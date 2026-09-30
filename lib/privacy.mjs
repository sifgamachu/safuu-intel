import crypto from 'node:crypto';
let cachedSalt, cachedKey;
function salt() {
  const value = process.env.TIPPER_HASH_SALT;
  if (!value || value.length < 32) throw new Error('Privacy configuration is missing.');
  return value;
}
function encryptionKey() {
  const value = salt();
  if (value !== cachedSalt) {
    cachedSalt = value;
    cachedKey = Buffer.from(
      crypto.hkdfSync(
        'sha256',
        Buffer.from(value),
        Buffer.from('safuu'),
        Buffer.from('private-evidence-v1'),
        32,
      ),
    );
  }
  return cachedKey;
}
export function privateHash(value, purpose = 'tipper') {
  return crypto.createHmac('sha256', salt()).update(`${purpose}:${value}`).digest('hex');
}
export function seal(value) {
  const iv = crypto.randomBytes(12),
    cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    body.toString('base64url'),
  ].join('.');
}
export function unseal(value) {
  const [version, iv, tag, body] = value.split('.');
  if (version !== 'v1' || !body) throw new Error('Invalid private envelope.');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return JSON.parse(
    Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString(
      'utf8',
    ),
  );
}
export function constantEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  return crypto.timingSafeEqual(
    crypto.createHash('sha256').update(a).digest(),
    crypto.createHash('sha256').update(b).digest(),
  );
}
export function signVisitor(id) {
  return `${id}.${privateHash(id, 'visitor-cookie')}`;
}
export function visitorId(cookie) {
  const [id, signature] = String(cookie || '').split('.');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) &&
    constantEqual(signature, privateHash(id, 'visitor-cookie'))
    ? id
    : null;
}
