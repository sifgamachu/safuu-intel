import { LANGUAGES, CORRUPTION_TYPES, getPrompts, corruptionTypeLabel } from './intake-prompts.mjs';
import { escapeHtml, validateReport } from './domain.mjs';

export function evolve(session, update, evidenceId = null, reportId = '') {
  const state = {
    step: session?.current_step || 0,
    language: session?.language || 'en',
    version: Number(session?.version || 0),
    draft: { ...(session?.draft || {}) },
  };
  const message = update.message || update.callback_query?.message;
  const input = typeof update.message?.text === 'string' ? update.message.text.trim() : '';
  const callback = update.callback_query?.data || '';
  const replies = [];
  let submission = null;
  const send = (text, keyboard) =>
    replies.push({
      chat_id: message.chat.id,
      text,
      parse_mode: 'HTML',
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    });
  const languages = () =>
    LANGUAGES.map((l) => [{ text: l.native, callback_data: `lang:${l.code}` }]);
  const prompt = () => {
    const p = getPrompts(state.language),
      version = state.version + 1;
    let text = p[`step${state.step}`] || p.welcome;
    let keyboard = [[{ text: p.langButton, callback_data: 'lang_menu' }]];
    if (!state.step) keyboard = languages();
    if (state.step === 5)
      keyboard = [
        ...CORRUPTION_TYPES.map((c) => [
          { text: c[state.language] || c.en, callback_data: `type:${c.code}:${version}` },
        ]),
        ...keyboard,
      ];
    if ([8, 9, 10].includes(state.step))
      keyboard.unshift([{ text: p.skipButton, callback_data: `skip:${state.step}:${version}` }]);
    if (state.step === 11) {
      const d = state.draft;
      const summary = [
        d.full_name,
        d.office,
        d.city,
        d.region,
        corruptionTypeLabel(d.corruption_type, state.language),
        d.incident_date_raw,
        d.description?.slice(0, 700),
        d.amount_etb == null ? '' : `${d.amount_etb} ETB`,
        `${d.evidence_ids?.length || 0} attachment(s)`,
        d.note?.slice(0, 250),
      ]
        .filter(Boolean)
        .map(escapeHtml)
        .join('\n');
      text = text.replace('{summary}', summary);
    }
    send(text, keyboard);
  };
  if (input.startsWith('/cancel')) {
    state.step = 0;
    state.draft = {};
    send(getPrompts(state.language).cancel);
    return { state, replies, submission };
  }
  if (/^\/(start|report)(?:\s|$)/i.test(input)) {
    state.step = 0;
    state.draft = {};
    prompt();
    return { state, replies, submission };
  }
  if (input === '/language' || callback === 'lang_menu') {
    send(getPrompts(state.language).langMenu, languages());
    return { state, replies, submission };
  }
  if (callback.startsWith('lang:')) {
    const language = callback.split(':')[1];
    if (LANGUAGES.some((l) => l.code === language)) {
      state.language = language;
      if (!state.step) state.step = 1;
    }
    prompt();
    return { state, replies, submission };
  }
  if (!state.step) {
    prompt();
    return { state, replies, submission };
  }
  if (callback.startsWith('skip:')) {
    const [, step, version] = callback.split(':');
    if (
      Number(step) === state.step &&
      Number(version) === state.version &&
      [8, 9, 10].includes(state.step)
    )
      state.step++;
    prompt();
    return { state, replies, submission };
  }
  if (callback.startsWith('type:')) {
    const [, category, version] = callback.split(':');
    if (
      state.step === 5 &&
      Number(version) === state.version &&
      CORRUPTION_TYPES.some((c) => c.code === category)
    ) {
      state.draft.corruption_type = category;
      state.step = 6;
    }
    prompt();
    return { state, replies, submission };
  }
  if (callback) {
    prompt();
    return { state, replies, submission };
  }
  const d = state.draft;
  const max =
    { 1: 180, 2: 180, 3: 180, 4: 240, 6: 120, 7: 5000, 8: 24, 10: 1500 }[state.step] || 200;
  if (state.step === 9) {
    if (evidenceId) {
      d.evidence_ids = [...(d.evidence_ids || []), evidenceId];
      state.step = 10;
    } else if (/^skip$/i.test(input)) state.step = 10;
    else {
      send('Attach a JPG, PNG, PDF, or audio file up to 10 MB; or type skip.');
    }
    prompt();
    return { state, replies, submission };
  }
  if (state.step === 5) {
    prompt();
    return { state, replies, submission };
  }
  if (state.step === 11) {
    if (/^no$/i.test(input)) {
      state.step = 0;
      state.draft = {};
      send(getPrompts(state.language).cancel);
    } else if (/^yes$/i.test(input)) {
      try {
        submission = validateReport({ ...d, language: state.language });
      } catch {
        state.step = 7;
        send('Please describe the incident in at least 20 characters before submitting.');
        prompt();
        return { state, replies, submission: null };
      }
      state.step = 0;
      state.draft = {};
      send(getPrompts(state.language).submitted.replace('{id}', escapeHtml(reportId)));
    } else prompt();
    return { state, replies, submission };
  }
  if ([8, 10].includes(state.step) && /^skip$/i.test(input)) {
    state.step++;
    prompt();
    return { state, replies, submission };
  }
  if (
    !input ||
    input.length > max ||
    input.length < (state.step === 7 ? 20 : state.step === 2 || state.step === 4 ? 2 : 1)
  ) {
    send(
      state.step === 7
        ? 'Please type a description of 20–5,000 characters. Audio may be attached at step 9.'
        : `Please type an answer of up to ${max} characters.`,
    );
    prompt();
    return { state, replies, submission };
  }
  switch (state.step) {
    case 1:
      d.full_name = /^unknown$/i.test(input) ? 'Unknown' : input;
      break;
    case 2:
      d.office = input;
      break;
    case 3:
      d.position_title = /^unknown$/i.test(input) ? null : input;
      break;
    case 4: {
      const [city, ...region] = input.split(',');
      d.city = city.trim();
      d.region = region.join(',').trim() || city.trim();
      break;
    }
    case 6:
      d.incident_date_raw = input;
      break;
    case 7:
      d.description = input;
      break;
    case 8: {
      if (!/^\d+(?:\.\d{1,2})?$/.test(input) || Number(input) > 1e15) {
        send('Enter an amount in Birr using digits, or type skip.');
        prompt();
        return { state, replies, submission };
      }
      d.amount_etb = Number(input);
      break;
    }
    case 10:
      d.note = input;
      break;
  }
  state.step++;
  prompt();
  return { state, replies, submission };
}
