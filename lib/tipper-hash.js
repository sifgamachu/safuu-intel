// ─────────────────────────────────────────────────────────────────────────
//  Tipper anonymization
//  SHA-256(salt + chat_id) — one-way, not reversible.
//  Salt validated on first use, not at module load, so Next.js build
//  doesn't throw when env vars aren't yet available.
// ─────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';

let _salt = null;

function getSalt() {
  if (_salt) return _salt;
  const salt = process.env.TIPPER_HASH_SALT;
  if (!salt || salt.length < 32) {
    throw new Error(
      'TIPPER_HASH_SALT env var must be set to a 32+ character random string'
    );
  }
  _salt = salt;
  return _salt;
}

export function hashTipper(chatId) {
  return crypto
    .createHash('sha256')
    .update(`${getSalt()}:${chatId}`)
    .digest('hex');
}
