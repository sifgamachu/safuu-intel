// ─────────────────────────────────────────────────────────────────────────
//  Telegram Bot API helper
// ─────────────────────────────────────────────────────────────────────────

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE  = `https://api.telegram.org/bot${TOKEN}`;

export async function sendMessage(chatId, text, extra = {}) {
  const r = await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    }),
  });
  if (!r.ok) console.error('sendMessage failed:', await r.text());
  return r.json();
}

export async function sendInlineKeyboard(chatId, text, buttons) {
  return sendMessage(chatId, text, {
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function answerCallback(callbackId, text = '') {
  return fetch(`${BASE}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  });
}

export async function getFile(fileId) {
  const r = await fetch(`${BASE}/getFile?file_id=${fileId}`);
  const j = await r.json();
  if (!j.ok) return null;
  return `https://api.telegram.org/file/bot${TOKEN}/${j.result.file_path}`;
}
