// ─────────────────────────────────────────────────────────────────────────
//  Tipper anonymization
//  The Telegram chat_id is NEVER stored as-is. It is hashed with an
//  application salt (env var) so the database has no PII, even if fully
//  compromised. The hash is deterministic per-tipper so we can correlate
//  their in-flight session across messages, but reverses to nothing.
// ─────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';

const salt = process.env.TIPPER_HASH_SALT;
if (!salt || salt.length < 32) {
  throw new Error(
    'TIPPER_HASH_SALT env var must be set to a 32+ character random string'
  );
}

export function hashTipper(chatId) {
  return crypto
    .createHash('sha256')
    .update(`${salt}:${chatId}`)
    .digest('hex');
}
