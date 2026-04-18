// ─────────────────────────────────────────────────────────────────────────
//  Telegram Webhook Handler — Vercel Serverless Route
//  POST /api/telegram/webhook
//
//  Supports mid-flow language switching without losing report progress.
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashTipper } from '@/lib/tipper-hash';
import { sendMessage, sendInlineKeyboard, answerCallback } from '@/lib/telegram';
import {
  LANGUAGES,
  CORRUPTION_TYPES,
  getPrompts,
  corruptionTypeLabel,
} from '@/lib/intake-prompts';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req) {
  const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
  if (headerSecret !== WEBHOOK_SECRET) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  const update = await req.json();

  try {
    if (update.message)             await handleMessage(update.message);
    else if (update.callback_query) await handleCallback(update.callback_query);
  } catch (err) {
    console.error('webhook handler error:', err);
  }

  return NextResponse.json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────────
// Inline keyboard helpers — adds 🌐 Language button at the end
// ─────────────────────────────────────────────────────────────────────────
function addLanguageButton(buttons, lang) {
  const p = getPrompts(lang);
  return [...buttons, [{ text: p.langButton, callback_data: 'lang_menu' }]];
}

function languageOnlyKeyboard(lang) {
  const p = getPrompts(lang);
  return [[{ text: p.langButton, callback_data: 'lang_menu' }]];
}

function languageMenuKeyboard(mode /* 'intake' | 'switch' */) {
  return LANGUAGES.map(l => [{
    text: l.native,
    callback_data: `lang:${l.code}:${mode}`,
  }]);
}

// ─────────────────────────────────────────────────────────────────────────
// Message handler
// ─────────────────────────────────────────────────────────────────────────
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const tipperHash = hashTipper(chatId);
  const text = (msg.text || '').trim();

  if (text.startsWith('/')) {
    const [cmd] = text.slice(1).split(/\s+/);
    return handleCommand(cmd.toLowerCase(), chatId, tipperHash);
  }

  const session = await getSession(tipperHash);
  if (session) {
    return handleIntakeStep(session, msg, chatId, tipperHash);
  }

  await sendInlineKeyboard(
    chatId,
    `Send /report to file an anonymous corruption report, or /help to see what I can do.`,
    languageOnlyKeyboard('en'),
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────────────────
async function handleCommand(cmd, chatId, tipperHash) {
  const session = await getSession(tipperHash);
  const lang = session?.language || 'en';

  switch (cmd) {
    case 'start':
    case 'report':
      return startIntake(chatId, tipperHash);

    case 'cancel': {
      if (session) {
        await deleteSession(tipperHash);
        const p = getPrompts(lang);
        return sendMessage(chatId, p.cancel);
      }
      return sendMessage(chatId, 'Nothing to cancel. Send /report to start.');
    }

    case 'language':
      return showLanguageMenu(chatId, session ? 'switch' : 'intake', lang);

    case 'subscribe':     return subscribe(chatId, lang);
    case 'unsubscribe':   return unsubscribe(chatId, lang);
    case 'status':        return sendStatus(chatId, lang);

    case 'help':
      return sendInlineKeyboard(
        chatId,
        `<b>SAFUU Intel</b> — anonymous anti-corruption reporting.\n\n` +
        `/report — file an anonymous report\n` +
        `/language — change language anytime\n` +
        `/subscribe — get intelligence alerts\n` +
        `/unsubscribe — stop alerts\n` +
        `/status — platform stats\n` +
        `/cancel — cancel a report in progress\n\n` +
        `🔗 safuu.net`,
        languageOnlyKeyboard(lang),
      );

    default:
      return sendMessage(chatId, `Unknown command. Try /help`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Intake start + language menu
// ─────────────────────────────────────────────────────────────────────────
async function startIntake(chatId, tipperHash) {
  await supabase.from('telegram_sessions').upsert({
    tipper_hash: tipperHash,
    current_step: 0,
    language: 'en',
    draft: {},
    last_activity: new Date().toISOString(),
  });
  return showLanguageMenu(chatId, 'intake', 'en');
}

async function showLanguageMenu(chatId, mode, currentLang) {
  const p = getPrompts(currentLang);
  const text = mode === 'intake' ? p.welcome : p.langMenu;
  return sendInlineKeyboard(chatId, text, languageMenuKeyboard(mode));
}

// ─────────────────────────────────────────────────────────────────────────
// Intake step handling
// ─────────────────────────────────────────────────────────────────────────
async function handleIntakeStep(session, msg, chatId, tipperHash) {
  const p = getPrompts(session.language);
  const step = session.current_step;
  const text = (msg.text || '').trim();
  const draft = { ...session.draft };

  switch (step) {
    case 1: draft.full_name = text; break;
    case 2: draft.office    = text; break;
    case 3: draft.position_title = text.toLowerCase() === 'unknown' ? null : text; break;
    case 4: {
      const [city, region] = text.split(',').map(s => s.trim());
      draft.city = city;
      draft.region = region || city;
      break;
    }
    // case 5: corruption type — via callback button only
    case 6: draft.incident_date_raw = text; break;
    case 7: draft.description = text; break;
    case 8: {
      if (text.toLowerCase() === 'skip') { draft.amount_etb = null; break; }
      draft.amount_etb = Number(text.replace(/[^\d.]/g, '')) || null;
      break;
    }
    case 9: {
      if (!msg.photo && !msg.document && text.toLowerCase() !== 'skip') {
        return sendInlineKeyboard(chatId, 'Send a photo/document, or type "skip".',
          languageOnlyKeyboard(session.language));
      }
      // TODO: upload attachment to Supabase Storage here
      break;
    }
    case 10: draft.note = text.toLowerCase() === 'skip' ? null : text; break;
    case 11: {
      if (/^(yes|y|ok|submit|send|✅|እሺ|eeyyee|እወ|haa)$/i.test(text)) {
        return submitReport(session, draft, chatId, tipperHash);
      }
      if (/^(no|n|cancel|አይ|lakki|ኣይፋል|maya)$/i.test(text)) {
        await deleteSession(tipperHash);
        return sendMessage(chatId, p.cancel);
      }
      return sendInlineKeyboard(chatId, 'Reply "yes" to submit, "no" to cancel.',
        languageOnlyKeyboard(session.language));
    }
  }

  const nextStep = step + 1;
  await supabase.from('telegram_sessions')
    .update({ current_step: nextStep, draft, last_activity: new Date().toISOString() })
    .eq('tipper_hash', tipperHash);

  return askStep(chatId, nextStep, session.language, draft);
}

async function askStep(chatId, step, lang, draft) {
  const p = getPrompts(lang);
  switch (step) {
    case 1:  return sendInlineKeyboard(chatId, p.step1,  languageOnlyKeyboard(lang));
    case 2:  return sendInlineKeyboard(chatId, p.step2,  languageOnlyKeyboard(lang));
    case 3:  return sendInlineKeyboard(chatId, p.step3,  languageOnlyKeyboard(lang));
    case 4:  return sendInlineKeyboard(chatId, p.step4,  languageOnlyKeyboard(lang));
    case 5: {
      const buttons = CORRUPTION_TYPES.map(t => [{
        text: corruptionTypeLabel(t.code, lang),
        callback_data: `ctype:${t.code}`,
      }]);
      return sendInlineKeyboard(chatId, p.step5, addLanguageButton(buttons, lang));
    }
    case 6:  return sendInlineKeyboard(chatId, p.step6,  languageOnlyKeyboard(lang));
    case 7:  return sendInlineKeyboard(chatId, p.step7,  languageOnlyKeyboard(lang));
    case 8:  return sendInlineKeyboard(chatId, p.step8,  languageOnlyKeyboard(lang));
    case 9:  return sendInlineKeyboard(chatId, p.step9,  languageOnlyKeyboard(lang));
    case 10: return sendInlineKeyboard(chatId, p.step10, languageOnlyKeyboard(lang));
    case 11: {
      const summary = buildSummary(draft, lang);
      return sendInlineKeyboard(
        chatId,
        p.step11.replace('{summary}', summary),
        languageOnlyKeyboard(lang),
      );
    }
  }
}

function buildSummary(draft, lang) {
  const typeLabel = draft.corruption_type
    ? corruptionTypeLabel(draft.corruption_type, lang)
    : '—';
  return (
    `<b>Name:</b> ${draft.full_name || '—'}\n` +
    `<b>Office:</b> ${draft.office || '—'}\n` +
    `<b>Position:</b> ${draft.position_title || '—'}\n` +
    `<b>Location:</b> ${draft.city || '—'}${draft.region ? ', ' + draft.region : ''}\n` +
    `<b>Type:</b> ${typeLabel}\n` +
    `<b>When:</b> ${draft.incident_date_raw || '—'}\n` +
    `<b>What:</b> ${(draft.description || '—').slice(0, 200)}${(draft.description || '').length > 200 ? '…' : ''}\n` +
    `<b>Amount:</b> ${draft.amount_etb ? draft.amount_etb + ' ETB' : '—'}\n` +
    `<b>Note:</b> ${draft.note || '—'}`
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Callback query handler (inline button taps)
// ─────────────────────────────────────────────────────────────────────────
async function handleCallback(cq) {
  const chatId = cq.message.chat.id;
  const tipperHash = hashTipper(chatId);
  const data = cq.data || '';
  await answerCallback(cq.id);

  // 🌐 Language button tapped — show the language menu in switch mode
  if (data === 'lang_menu') {
    const session = await getSession(tipperHash);
    const currentLang = session?.language || 'en';
    const mode = session ? 'switch' : 'intake';
    return showLanguageMenu(chatId, mode, currentLang);
  }

  // Language selection — handles both intake and mid-flow switch
  if (data.startsWith('lang:')) {
    const [, code, mode] = data.split(':');
    const session = await getSession(tipperHash);

    if (mode === 'intake') {
      // Initial language pick — set language and advance to step 1
      await supabase.from('telegram_sessions')
        .upsert({
          tipper_hash: tipperHash,
          language: code,
          current_step: 1,
          draft: session?.draft || {},
          last_activity: new Date().toISOString(),
        });
      const p = getPrompts(code);
      await sendMessage(chatId, p.langSwitched);
      return askStep(chatId, 1, code, session?.draft || {});
    }

    // Mid-flow switch — keep current step, just change the language
    if (!session) {
      const p = getPrompts(code);
      return sendMessage(chatId, p.langSwitched);
    }

    await supabase.from('telegram_sessions')
      .update({ language: code, last_activity: new Date().toISOString() })
      .eq('tipper_hash', tipperHash);

    const p = getPrompts(code);
    await sendMessage(chatId, p.langSwitched);
    return askStep(chatId, session.current_step, code, session.draft || {});
  }

  // Corruption type pick (step 5)
  if (data.startsWith('ctype:')) {
    const code = data.split(':')[1];
    const session = await getSession(tipperHash);
    if (!session) return;
    const draft = { ...session.draft, corruption_type: code };
    await supabase.from('telegram_sessions')
      .update({ current_step: 6, draft, last_activity: new Date().toISOString() })
      .eq('tipper_hash', tipperHash);
    return askStep(chatId, 6, session.language, draft);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Submission
// ─────────────────────────────────────────────────────────────────────────
async function submitReport(session, draft, chatId, tipperHash) {
  const p = getPrompts(session.language);

  const { data: person } = await supabase
    .from('persons')
    .upsert({
      full_name: draft.full_name,
      office:    draft.office,
      position_title: draft.position_title,
      city:      draft.city,
      region:    draft.region,
    }, { onConflict: 'full_name,office,city' })
    .select()
    .single();

  const contentHash = await sha256(JSON.stringify(draft));
  const { data: prevLedger } = await supabase
    .from('evidence_ledger')
    .select('combined_hash')
    .order('seq', { ascending: false })
    .limit(1)
    .maybeSingle();
  const prevHash = prevLedger?.combined_hash || 'GENESIS';
  const combinedHash = await sha256(prevHash + contentHash);

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      person_id: person?.id,
      tipper_hash: tipperHash,
      channel: 'telegram',
      language: session.language,
      corruption_type: draft.corruption_type,
      city: draft.city,
      region: draft.region,
      description: draft.description,
      amount_etb: draft.amount_etb,
      note: draft.note,
      note_language: session.language,
      ledger_prev_hash: prevHash,
      ledger_hash: combinedHash,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('submit report failed', error);
    await sendMessage(chatId, p.error);
    return;
  }

  await supabase.from('evidence_ledger').insert({
    report_id: report.id,
    prev_hash: prevHash,
    content_hash: contentHash,
    combined_hash: combinedHash,
  });

  await deleteSession(tipperHash);
  return sendMessage(chatId, p.submitted.replace('{id}', report.id.slice(0, 8)));
}

// ─────────────────────────────────────────────────────────────────────────
// Subscriptions + status
// ─────────────────────────────────────────────────────────────────────────
async function subscribe(chatId, lang) {
  await supabase.from('subscribers').upsert({
    chat_id: chatId, language: lang, active: true, unsubscribed_at: null,
  });
  return sendMessage(
    chatId,
    `📡 Subscribed to SAFUU Intel alerts. /unsubscribe any time.`
  );
}

async function unsubscribe(chatId) {
  await supabase.from('subscribers')
    .update({ active: false, unsubscribed_at: new Date().toISOString() })
    .eq('chat_id', chatId);
  return sendMessage(chatId, `✖️ Unsubscribed.`);
}

async function sendStatus(chatId, lang) {
  const { data } = await supabase.from('v_public_stats').select('*').maybeSingle();
  if (!data) return sendMessage(chatId, 'Stats unavailable.');
  return sendInlineKeyboard(
    chatId,
    `<b>📊 SAFUU Intel</b>\n\n` +
    `Reports: <b>${data.total_reports}</b>\n` +
    `Verified: <b>${data.verified_reports}</b>\n` +
    `Disclosed: <b>${data.disclosed_persons}</b>\n` +
    `Referred: <b>${data.referrals}</b>\n` +
    `Regions: <b>${data.regions_reporting}</b>\n` +
    `Subscribers: <b>${data.active_subscribers}</b>\n\n` +
    `🔗 safuu.net/transparency`,
    languageOnlyKeyboard(lang),
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────
async function getSession(tipperHash) {
  const { data } = await supabase
    .from('telegram_sessions')
    .select('*')
    .eq('tipper_hash', tipperHash)
    .maybeSingle();
  return data;
}

async function deleteSession(tipperHash) {
  await supabase.from('telegram_sessions').delete().eq('tipper_hash', tipperHash);
}

async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
