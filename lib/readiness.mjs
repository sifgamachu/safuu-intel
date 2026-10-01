import { serviceClient } from './db-client.mjs';
import { EVIDENCE_TYPES, MAX_EVIDENCE_BYTES } from './domain.mjs';

// Only capability states leave the server. No staff identities, storage paths,
// bot tokens, webhook response bodies, or private queue payloads are returned.
export function createReadiness({
  client = serviceClient,
  env = () => process.env,
  fetcher = fetch,
  now = Date.now,
} = {}) {
  const caches = new Map();
  async function cached(key, read) {
    let entry = caches.get(key);
    if (entry?.value && now() < entry.expires) return entry.value;
    if (entry?.pending) return entry.pending;
    entry = { pending: Promise.resolve().then(read) };
    caches.set(key, entry);
    try {
      const value = await entry.pending;
      caches.set(key, { value, expires: now() + 30000 });
      return value;
    } catch (error) {
      caches.delete(key);
      throw error;
    }
  }
  async function reporting() {
    return cached('reporting', async () => {
      const db = client();
      const [members, bucket] = await Promise.allSettled([
        db.from('staff_members').select('role', { count: 'exact', head: true }).eq('active', true),
        db.storage.getBucket('evidence'),
      ]);
      const staff =
        members.status === 'fulfilled' && !members.value.error ? members.value.count : null;
      const policy =
        bucket.status === 'fulfilled' && !bucket.value.error ? bucket.value.data : null;
      const privateBucket =
        policy &&
        policy.public === false &&
        Number(policy.file_size_limit) === MAX_EVIDENCE_BYTES &&
        Array.isArray(policy.allowed_mime_types) &&
        policy.allowed_mime_types.length === EVIDENCE_TYPES.size &&
        policy.allowed_mime_types.every((type) => EVIDENCE_TYPES.has(type));
      return {
        review_team: staff === null ? 'unconfirmed' : staff > 0 ? 'configured' : 'not_configured',
        evidence: !policy
          ? 'unconfirmed'
          : privateBucket
            ? 'private_storage_verified'
            : 'configuration_incomplete',
      };
    });
  }
  async function telegram() {
    return cached('telegram', async () => {
      const vars = env();
      if (!vars.TELEGRAM_BOT_TOKEN || !vars.TELEGRAM_WEBHOOK_SECRET) return 'not_configured';
      try {
        const read = async (method) => {
          const response = await fetcher(
            `https://api.telegram.org/bot${vars.TELEGRAM_BOT_TOKEN}/${method}`,
            { signal: AbortSignal.timeout(8000) },
          );
          if (!response.ok) throw new Error('Provider unavailable');
          const body = await response.json();
          if (!body.ok) throw new Error('Provider unavailable');
          return body.result;
        };
        const [bot, webhook] = await Promise.all([read('getMe'), read('getWebhookInfo')]);
        const destinations = vars.TELEGRAM_WEBHOOK_URL
          ? [vars.TELEGRAM_WEBHOOK_URL]
          : [
              'https://www.safuu.net/api/telegram/webhook',
              'https://safuu.net/api/telegram/webhook',
              'https://safuu-intel.vercel.app/api/telegram/webhook',
            ];
        if (
          bot.is_bot !== true ||
          bot.username?.toLowerCase() !== 'safuuintelbot' ||
          !destinations.includes(webhook.url) ||
          (webhook.allowed_updates?.length &&
            !['message', 'callback_query'].every((type) => webhook.allowed_updates.includes(type)))
        )
          return 'configuration_incomplete';
        if (webhook.last_error_date && now() - webhook.last_error_date * 1000 < 900000)
          return 'provider_error';
        return 'configuration_verified';
      } catch {
        return 'unconfirmed';
      }
    });
  }
  return { reporting, telegram };
}

export function antiSpamState(env = process.env) {
  if (!!env.TURNSTILE_SITE_KEY !== !!env.TURNSTILE_SECRET_KEY) return 'configuration_incomplete';
  return env.TURNSTILE_SECRET_KEY ? 'challenge_enabled' : 'rate_limits_only';
}
export const readiness = createReadiness();
