import { randomBytes } from 'node:crypto';
import { rpc, serviceClient } from './db-client.mjs';
import { seal, unseal } from './privacy.mjs';
import { evolve } from './telegram-intake.mjs';
import { submissionArgs } from './intake-service.mjs';
import { telegramEvidence } from './telegram-evidence.mjs';
import { IntakeError } from './domain.mjs';

async function processUpdate(job) {
  const update = unseal(job.sealed_payload),
    client = serviceClient();
  const { data: session, error } = await client
    .from('telegram_sessions')
    .select('current_step,language,version,sealed_draft,draft')
    .eq('tipper_hash', job.partition_key)
    .maybeSingle();
  if (error) throw new Error('Session unavailable.');
  const loaded = session
    ? { ...session, draft: session.sealed_draft ? unseal(session.sealed_draft) : session.draft }
    : null;
  let evidence = null,
    evidenceError = null;
  if (loaded?.current_step === 9) {
    try {
      evidence = await telegramEvidence(update.message, job.partition_key, job.id);
    } catch (e) {
      if (e instanceof IntakeError) evidenceError = e.message;
      else throw e;
    }
  }
  const next = evolve(loaded, update, evidence, job.id);
  if (evidenceError) next.replies.unshift({ chat_id: update.message.chat.id, text: evidenceError });
  let submission = null;
  if (next.submission) {
    const args = submissionArgs(
      job.id,
      job.partition_key,
      randomBytes(32).toString('hex'),
      next.submission,
      'telegram',
    );
    submission = {
      receipt_hash: args.p_receipt_hash,
      fingerprint: args.p_fingerprint,
      case_key: args.p_case_key,
      case: args.p_case,
      sealed: args.p_sealed,
      evidence: args.p_evidence,
    };
  }
  try {
    await rpc('sf_commit_intake', {
      p_job: job.id,
      p_lease: job.lease_token,
      p_owner: job.partition_key,
      p_version: loaded?.version || 0,
      p_step: next.state.step,
      p_language: next.state.language,
      p_draft: seal(next.state.draft),
      p_replies: next.replies.map((reply) => ({ sealed: seal(reply) })),
      p_submission: submission,
    });
  } catch (error) {
    if (!['already_received', 'rate_limited'].includes(error.code)) throw error;
    const chat_id = (update.message || update.callback_query.message).chat.id;
    const text =
      error.code === 'already_received'
        ? 'This report was already received. Keep your original receipt. Type /report for another incident.'
        : 'Daily report limit reached. Your draft is saved; please submit it tomorrow.';
    await rpc('sf_commit_intake', {
      p_job: job.id,
      p_lease: job.lease_token,
      p_owner: job.partition_key,
      p_version: loaded?.version || 0,
      p_step: loaded?.current_step || 0,
      p_language: loaded?.language || 'en',
      p_draft: seal(loaded?.draft || {}),
      p_replies: [{ sealed: seal({ chat_id, text }) }],
      p_submission: null,
    });
  }
}
async function send(job) {
  // Telegram's standard throughput is ~30 messages/s globally and 1/s per chat.
  if (
    !(await rpc('sf_take_rate', {
      p_action: 'telegram_chat',
      p_subject: job.partition_key,
      p_limit: 1,
      p_window: 1,
    })) ||
    !(await rpc('sf_take_rate', {
      p_action: 'telegram_global',
      p_subject: 'all',
      p_limit: 25,
      p_window: 1,
    }))
  ) {
    await rpc('sf_finish_job', {
      p_id: job.id,
      p_lease: job.lease_token,
      p_error: 'throttled',
      p_delay: 1,
      p_throttled: true,
    });
    return;
  }
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unseal(job.sealed_payload)),
      signal: AbortSignal.timeout(10000),
    },
  );
  const body = await response.json();
  if (response.status === 429) {
    await rpc('sf_finish_job', {
      p_id: job.id,
      p_lease: job.lease_token,
      p_error: 'provider_rate_limit',
      p_delay: body.parameters?.retry_after || 5,
      p_throttled: true,
    });
    return;
  }
  if (!body.ok) throw new Error('Telegram delivery unavailable.');
  if (!(await rpc('sf_finish_job', { p_id: job.id, p_lease: job.lease_token })))
    throw new Error('Delivery lease expired.');
}
export async function drain({ budgetMs = 15000, batch = 8 } = {}) {
  const started = Date.now(),
    client = serviceClient();
  let processed = 0;
  const { error } = await client
    .from('worker_heartbeats')
    .upsert({ id: 'intake', last_seen: new Date().toISOString() });
  if (error) throw new Error('Worker heartbeat failed.');
  while (Date.now() - started < budgetMs) {
    let available = 0;
    for (const kind of ['telegram_update', 'telegram_send']) {
      const jobs = await rpc('sf_claim_jobs', { p_kind: kind, p_limit: batch });
      available += jobs.length;
      await Promise.all(
        jobs.map(async (job) => {
          try {
            if (kind === 'telegram_update') await processUpdate(job);
            else await send(job);
            processed++;
          } catch (error) {
            console.error('safuu_job_failed', { kind, code: error.code || error.name });
            await rpc('sf_finish_job', {
              p_id: job.id,
              p_lease: job.lease_token,
              p_error: error.code || 'provider_unavailable',
              p_delay: Math.min(300, 2 ** job.attempts),
            });
          }
        }),
      );
    }
    if (!available) break;
  }
  return { processed };
}
