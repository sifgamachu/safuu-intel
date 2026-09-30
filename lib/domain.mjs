export const LANGUAGES = ['en', 'am', 'or', 'ti', 'so'];
export const CATEGORIES = [
  'bribery',
  'embezzlement',
  'procurement_fraud',
  'tax_evasion',
  'nepotism',
  'abuse_of_power',
  'land_fraud',
  'extortion',
  'money_laundering',
  'electoral_fraud',
  'judicial_corruption',
  'police_misconduct',
  'other',
];
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
export const EVIDENCE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
]);
export class IntakeError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.name = 'IntakeError';
    this.status = status;
  }
}
function text(value, label, min, max) {
  if (typeof value !== 'string') throw new IntakeError(`${label} is required.`);
  const s = value
    .normalize('NFKC')
    .replace(/\u0000/g, '')
    .trim();
  if (s.length < min || s.length > max)
    throw new IntakeError(`${label} must be ${min}–${max} characters.`);
  return s;
}
export function validateReport(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new IntakeError('Invalid report.');
  const language = LANGUAGES.includes(body.language) ? body.language : 'en';
  if (!CATEGORIES.includes(body.corruption_type))
    throw new IntakeError('Choose a corruption category.');
  if (body.amount_etb != null && !['string', 'number'].includes(typeof body.amount_etb))
    throw new IntakeError('Enter a valid amount.');
  const amount = body.amount_etb === '' || body.amount_etb == null ? null : Number(body.amount_etb);
  if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 1e15))
    throw new IntakeError('Enter a valid amount.');
  const evidence = body.evidence_ids || [];
  if (!Array.isArray(evidence) || evidence.length > 4 || evidence.some((id) => !UUID.test(id)))
    throw new IntakeError('Invalid evidence references.');
  const full_name = body.full_name ? text(body.full_name, 'Name', 2, 180) : 'Unknown';
  return {
    full_name,
    office: text(body.office, 'Office', 2, 180),
    position_title: body.position_title ? text(body.position_title, 'Position', 1, 180) : null,
    city: text(body.city, 'City', 2, 120),
    region: text(body.region || body.city, 'Region', 2, 120),
    corruption_type: body.corruption_type,
    language,
    incident_date_raw: text(body.incident_date_raw || 'Unknown', 'Incident date', 1, 120),
    description: text(body.description, 'Description', 20, 5000),
    amount_etb: amount,
    note: body.note ? text(body.note, 'Note', 1, 1500) : null,
    evidence_ids: [...new Set(evidence)],
  };
}
export function validateEvidence(file) {
  if (!file || !EVIDENCE_TYPES.has(file.type))
    throw new IntakeError('Use a JPG, PNG, PDF, or supported audio file.');
  if (!Number.isInteger(file.size) || file.size < 4 || file.size > MAX_EVIDENCE_BYTES)
    throw new IntakeError('Evidence must be between 4 bytes and 10 MB.');
  return {
    type: file.type,
    size: file.size,
    kind: file.type.startsWith('audio/')
      ? 'voice'
      : file.type.startsWith('image/')
        ? 'photo'
        : 'document',
  };
}
export function labelCategory(value) {
  return value.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
}
export function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>\"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[c],
  );
}
export function canonicalReport(draft) {
  return JSON.stringify({
    ...draft,
    full_name: draft.full_name.toLocaleLowerCase(),
    office: draft.office.toLocaleLowerCase(),
    city: draft.city.toLocaleLowerCase(),
    evidence_ids: [...draft.evidence_ids].sort(),
  });
}
