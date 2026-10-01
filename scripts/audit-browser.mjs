// Optional browser acceptance: install Playwright/Chromium or supply the paths.
// Every write stays in a fresh loopback database. Provider responses are fixtures.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { localSupabase } from '../tests/local-supabase.mjs';
import { browserProvider } from '../tests/browser-provider.mjs';
import { call } from '../tests/database.mjs';
import { submissionArgs } from '../lib/intake-service.mjs';
import { privateHash, unseal } from '../lib/privacy.mjs';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const salt = 'isolated-browser-audit-secret-never-use-in-production-2026';
process.env.TIPPER_HASH_SALT = salt;
if (process.env.AUDIT_SKIP_BUILD !== '1')
  execFileSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
    cwd,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: 'pipe',
  });
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const provider = browserProvider();
const database = await localSupabase(0, { prepare: provider.prepare, handle: provider.handle });
const port = 30000 + Math.floor(Math.random() * 10000),
  base = `http://127.0.0.1:${port}`;
const app = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
  {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      TIPPER_HASH_SALT: salt,
      SUPABASE_URL: `http://127.0.0.1:${database.server.address().port}`,
      SUPABASE_SERVICE_ROLE_KEY: 'local-test-service-key',
      STAFF_REQUIRE_MFA: 'true',
      TELEGRAM_BOT_TOKEN: '',
      TELEGRAM_WEBHOOK_SECRET: '',
      TURNSTILE_SITE_KEY: '',
      TURNSTILE_SECRET_KEY: '',
    },
  },
);
let logs = '',
  browser;
app.stdout.on('data', (data) => (logs += data));
app.stderr.on('data', (data) => (logs += data));
const completed = [],
  errors = [];
const done = (name) => {
  completed.push(name);
  console.log('PASS ' + name);
};
const sample = {
  full_name: 'Synthetic audit case',
  office: 'Synthetic audit office',
  position_title: 'Synthetic position',
  city: 'Synthetic city',
  region: 'Synthetic region',
  corruption_type: 'bribery',
  language: 'en',
  incident_date_raw: 'September 2026',
  description: 'Synthetic browser acceptance fixture. No real allegation or incident is described.',
  amount_etb: '125.50',
  note: 'Synthetic additional note',
};
try {
  let healthy = false;
  for (let i = 0; i < 100; i++) {
    try {
      healthy = (await fetch(base + '/api/health')).ok;
      if (healthy) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert(healthy, 'Local app failed to start: ' + logs);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || undefined,
    args: ['--no-sandbox', '--no-zygote', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  const assertFits = async () => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        outside: [...document.querySelectorAll('main *')]
          .filter((element) => element.getBoundingClientRect().right > innerWidth + 2)
          .slice(0, 12)
          .map((element) => ({
            tag: element.tagName,
            class: element.className,
            right: element.getBoundingClientRect().right,
            text: element.textContent?.slice(0, 80),
          })),
      }));
      assert(layout.scroll <= layout.width, 'Horizontal overflow ' + JSON.stringify(layout));
    }
  };
  await page.goto(base + '/report');
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled);
  await page.locator('#office').fill('X');
  await page.locator('#city').fill(sample.city);
  await page.locator('#corruption_type').selectOption('bribery');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('alert').getByText('Office must be 2–180 characters.').waitFor();
  for (const key of [
    'full_name',
    'office',
    'position_title',
    'city',
    'region',
    'incident_date_raw',
  ])
    await page.locator('#' + key).fill(sample[key]);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#description').fill(sample.description);
  await page.locator('#amount_etb').fill(sample.amount_etb);
  await page.locator('#note').fill(sample.note);
  assert(await page.locator('#amount_etb').evaluate((element) => element.checkValidity()));
  const attachment = (name, mimeType, buffer = Buffer.from('synthetic transport fixture')) => ({
    name,
    mimeType,
    buffer,
  });
  const four = [
    attachment('synthetic.pdf', 'application/pdf'),
    attachment('synthetic.png', 'image/png'),
    attachment('synthetic.ogg', 'audio/ogg'),
    attachment('long-synthetic-name-'.repeat(6) + '.jpg', 'image/jpeg'),
  ];
  const fileInput = page.getByLabel('Attach private evidence');
  assert(await fileInput.isEnabled(), 'Controlled private storage must be ready before file tests');
  await fileInput.setInputFiles([...four, attachment('fifth.pdf', 'application/pdf')]);
  await page.getByRole('alert').getByText('Attach up to four files.').waitFor();
  assert.equal(await page.locator('.sf-files li').count(), 0);
  await fileInput.setInputFiles(attachment('unsupported.html', 'text/html'));
  await page
    .getByRole('alert')
    .getByText('Use a JPG, PNG, PDF, or supported audio file.')
    .waitFor();
  await fileInput.setInputFiles(
    attachment('too-large.pdf', 'application/pdf', Buffer.alloc(10485761)),
  );
  await page.getByRole('alert').getByText('Evidence must be between 4 bytes and 10 MB.').waitFor();
  await fileInput.setInputFiles(four);
  await page.getByRole('button', { name: 'Remove synthetic.pdf' }).click();
  assert.equal(await page.locator('.sf-files li').count(), 3);
  await fileInput.setInputFiles(four[0]);
  await assertFits();
  await page.getByRole('button', { name: 'Back', exact: false }).click();
  assert.equal(await page.locator('#office').inputValue(), sample.office);
  await page.getByRole('button', { name: 'Continue' }).click();
  assert.equal(await page.locator('#description').inputValue(), sample.description);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText(sample.position_title, { exact: true }).waitFor();
  await page.getByText(sample.note, { exact: true }).waitFor();
  await page.getByRole('checkbox').check();
  done(
    'Validation, decimal Birr, all entered fields, file limits/removal, and Back preserve the draft',
  );
  let failUpload = true,
    uploadAttempts = 0;
  await page.route('**/api/evidence/upload', async (route) => {
    const response = await route.fetch(),
      data = await response.json();
    if (!response.ok()) return route.fulfill({ response });
    const signed = new URL(data.upload_url);
    await route.fulfill({
      response,
      json: {
        ...data,
        upload_url: base + '/fixture/private-upload/' + signed.searchParams.get('token'),
      },
    });
  });
  await page.route('**/fixture/private-upload/*', async (route) => {
    uploadAttempts++;
    if (failUpload) {
      failUpload = false;
      return route.fulfill({ status: 503, body: 'Controlled upload outage' });
    }
    const token = route.request().url().split('/').at(-1);
    const accepted = provider.upload(
      token,
      route.request().headers()['content-type'],
      route.request().postDataBuffer(),
    );
    await route.fulfill({ status: accepted ? 200 : 409, json: {} });
  });
  await page.getByRole('button', { name: 'Submit privately' }).click();
  await page
    .getByRole('alert')
    .getByText('An attachment could not be uploaded.', { exact: false })
    .waitFor();
  assert.equal(
    (await database.db.query('SELECT count(*)::int AS count FROM public.reports')).rows[0].count,
    0,
  );
  assert.equal(
    await page.getByRole('heading', { name: 'Your report has been received.' }).count(),
    0,
  );
  done('An upload outage retains the draft and issues no receipt');
  let savedRequest;
  const interrupted = async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    savedRequest = route.request().postDataJSON();
    const response = await route.fetch();
    assert.equal(response.status(), 201);
    await route.abort('failed');
  };
  await page.route('**/api/reports', interrupted);
  await page.getByRole('button', { name: 'Submit privately' }).click();
  await page.getByText('A save was attempted.', { exact: false }).waitFor();
  assert(await page.getByRole('button', { name: 'Back', exact: false }).isDisabled());
  assert(await page.getByLabel('Reporting language').isDisabled());
  const rows = (await database.db.query('SELECT id,person_id,sealed_payload FROM public.reports'))
    .rows;
  assert.equal(rows.length, 1);
  const report = rows[0],
    payload = unseal(report.sealed_payload);
  assert.equal(payload.amount_etb, 125.5);
  assert.equal(payload.evidence_ids.length, 4);
  assert.equal(payload.position_title, sample.position_title);
  assert.equal(
    (
      await database.db.query(
        'SELECT count(*)::int AS count FROM public.evidence_ledger WHERE report_id=$1',
        [report.id],
      )
    ).rows[0].count,
    1,
  );
  const beforeRetryUploads = uploadAttempts;
  await page.unroute('**/api/reports', interrupted);
  await page.getByRole('button', { name: 'Submit privately' }).click();
  await page.getByRole('heading', { name: 'Your report has been received.' }).waitFor();
  const code = await page.locator('.sf-receipt code').textContent();
  assert.equal(code, savedRequest.request_id + '.' + savedRequest.receipt_secret);
  assert.equal(uploadAttempts, beforeRetryUploads);
  assert.equal(
    (await database.db.query('SELECT count(*)::int AS count FROM public.reports')).rows[0].count,
    1,
  );
  await page.getByRole('button', { name: 'Copy tracking code' }).click();
  await page.getByRole('button', { name: 'Copied' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), code);
  done(
    'A committed but interrupted response retries the same payload and four attachments exactly once; receipt copy works',
  );
  await page.goto(base + '/tracker');
  await page.locator('#tracking-code').fill(code + '.extra');
  await page.getByRole('button', { name: 'Check status' }).click();
  await page
    .getByRole('alert')
    .getByText('Enter the complete private tracking code', { exact: false })
    .waitFor();
  await page.locator('#tracking-code').fill(code.toUpperCase());
  await page.getByRole('button', { name: 'Check status' }).click();
  await page.getByText('Saved · waiting for human review').waitFor();
  await page.locator('#tracking-code').fill(report.id + '.' + '00'.repeat(32));
  await page.getByRole('button', { name: 'Check status' }).click();
  await page.getByRole('alert').getByText('No receipt matches that tracking code.').waitFor();
  done('Private tracking accepts complete codes and rejects wrong keys or extra text');
  const boundaries = await page.evaluate(async () => {
    const outputs = {};
    for (const path of [
      '/api/reports/status',
      '/api/admin/session',
      '/api/admin/authenticator',
      '/api/evidence/upload',
    ]) {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'null',
      });
      outputs[path] = response.status;
    }
    outputs.private_queue = (await fetch('/api/admin/reports')).status;
    outputs.setup_without_session = (
      await fetch('/api/admin/authenticator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{"code":"123456"}',
      })
    ).status;
    return outputs;
  });
  assert.deepEqual(boundaries, {
    '/api/reports/status': 422,
    '/api/admin/session': 422,
    '/api/admin/authenticator': 422,
    '/api/evidence/upload': 422,
    private_queue: 401,
    setup_without_session: 401,
  });
  done('Malformed forms and unauthenticated private routes fail with the expected status');
  const reviewer = provider.users[0],
    publisher = provider.users[1];
  for (let i = 0; i < 99; i++) {
    const args = submissionArgs(
      randomUUID(),
      privateHash('browser-independent-' + i, 'owner'),
      'ab'.repeat(32),
      sample,
    );
    await call(database.db, 'sf_submit_report', args);
    await call(database.db, 'sf_review_report', {
      p_actor: reviewer.id,
      p_id: args.p_id,
      p_decision: 'verified',
      p_reason: 'Synthetic isolated review fixture.',
    });
  }
  assert.equal((await call(database.db, 'sf_public_snapshot')).published, 0);
  await page.goto(base + '/admin');
  await page.locator('#email').fill(reviewer.email);
  await page.locator('#password').fill('wrong-fixture-password');
  await page.getByRole('button', { name: 'Sign in', exact: false }).click();
  await page.getByRole('alert').getByText('Credentials could not be verified.').waitFor();
  await page.locator('#password').fill(provider.password);
  await page.getByRole('button', { name: 'Sign in', exact: false }).click();
  await page.getByRole('alert').getByText('Set up your authenticator before signing in.').waitFor();
  await page.getByRole('button', { name: 'Set up authenticator', exact: true }).click();
  await page.locator('#setup-code').waitFor();
  assert.equal(await page.evaluate(async () => (await fetch('/api/admin/reports')).status), 401);
  await page.getByRole('button', { name: 'Cancel setup' }).click();
  await page.getByRole('heading', { name: 'Sign in', exact: true }).waitFor();
  assert.equal(reviewer.factors.length, 0);
  await page.locator('#email').fill(reviewer.email);
  await page.locator('#password').fill(provider.password);
  await page.getByRole('button', { name: 'Set up authenticator', exact: true }).click();
  await page.locator('#setup-code').waitFor();
  assert(
    await page
      .locator('img[alt="Authenticator setup QR code"]')
      .evaluate((image) => image.complete && image.naturalWidth > 0),
  );
  await assertFits();
  await page.locator('#setup-code').fill('000000');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await page.getByRole('alert').getByText('Authenticator code could not be verified.').waitFor();
  await page.locator('#setup-code').fill('123456');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await page.getByRole('heading', { name: 'Pending reports' }).waitFor();
  assert.equal(reviewer.factors.filter((f) => f.status === 'verified').length, 1);
  done(
    'Staff credential checks, MFA setup, QR rendering, cancellation, code rejection, and verified sign-in work through app routes',
  );
  const record = page.locator('.sf-review-record').filter({ hasText: report.id });
  await record.waitFor();
  assert(await record.getByRole('button', { name: 'Mark reviewed & verified' }).isDisabled());
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    record.getByRole('button', { name: 'Download private evidence 1' }).click(),
  ]);
  assert.equal(await download.failure(), null);
  assert.equal(
    (
      await database.db.query(
        "SELECT count(*)::int AS count FROM public.audit_log WHERE action='read_evidence'",
      )
    ).rows[0].count,
    1,
  );
  await record.locator('textarea').fill('Synthetic independent review for browser acceptance.');
  await record.getByRole('button', { name: 'Mark reviewed & verified' }).click();
  await page.getByText('No reports are waiting for review.').waitFor();
  assert(await page.getByRole('button', { name: 'Approve public name disclosure' }).isDisabled());
  const denied = await page.evaluate(
    async (id) =>
      (
        await fetch('/api/admin/cases/' + id, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
      ).status,
    report.person_id,
  );
  assert.equal(denied, 403);
  assert.equal((await call(database.db, 'sf_public_snapshot')).published, 0);
  done(
    'Private evidence download is audited; review reasoning is required; reviewer publication is denied',
  );
  await page.route('**/api/admin/reports', (route) =>
    route.fulfill({ status: 503, json: { error: 'Controlled queue outage' } }),
  );
  await page.getByRole('button', { name: 'Refresh queue' }).click();
  await page.getByRole('alert').getByText('Controlled queue outage').waitFor();
  assert.equal(await page.getByText('No reports are waiting for review.').count(), 0);
  await page.unroute('**/api/admin/reports');
  await page.getByRole('button', { name: 'Refresh queue' }).click();
  await page.getByText('No reports are waiting for review.').waitFor();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('heading', { name: 'Sign in', exact: true }).waitFor();
  assert.equal(await page.evaluate(async () => (await fetch('/api/admin/reports')).status), 401);
  done(
    'Queue outage is never presented as empty, refresh recovers, and sign-out removes browser access',
  );
  await page.locator('#email').fill(publisher.email);
  await page.locator('#password').fill(provider.password);
  await page.locator('#code').fill('123456');
  await page.getByRole('button', { name: 'Sign in', exact: false }).click();
  await page.getByRole('button', { name: 'Approve public name disclosure' }).waitFor();
  assert(await page.getByRole('button', { name: 'Approve public name disclosure' }).isEnabled());
  await page.getByRole('button', { name: 'Approve public name disclosure' }).click();
  await page.getByText('No reviewed cases are awaiting a publication decision.').waitFor();
  assert.equal((await call(database.db, 'sf_public_snapshot')).published, 1);
  await page.goto(base + '/transparency');
  const publishedLink = page.getByRole('link', {
    name: 'Reviewed & published ' + sample.full_name,
    exact: false,
  });
  await publishedLink.waitFor();
  assert.equal(await publishedLink.getAttribute('href'), '/transparency/' + report.person_id);
  await publishedLink.click();
  await page.getByRole('heading', { name: sample.full_name, exact: true }).waitFor();
  await page.getByText('100 distinct reporting identities', { exact: true }).waitFor();
  await page.goto(base + '/transparency/' + randomUUID());
  await page.getByText('Case not found.', { exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { name: sample.full_name, exact: true }).count(), 0);
  done(
    'Only an authorized publisher can approve the threshold-qualified case; public details and missing cases are correct',
  );
  const dismissed = submissionArgs(
    randomUUID(),
    privateHash('browser-dismissal', 'owner'),
    'ab'.repeat(32),
    { ...sample, full_name: 'Synthetic dismissed case', office: 'Synthetic dismissal office' },
  );
  await call(database.db, 'sf_submit_report', dismissed);
  await page.goto(base + '/admin');
  const dismissal = page.locator('.sf-review-record').filter({ hasText: dismissed.p_id });
  await dismissal.locator('textarea').fill('አ'.repeat(2000));
  await dismissal.getByRole('button', { name: 'Dismiss after review' }).click();
  await page.getByText('No reports are waiting for review.').waitFor();
  const totals = await call(database.db, 'sf_public_snapshot');
  assert.equal(totals.reviewed, 101);
  assert.equal(totals.published, 1);
  assert.equal(
    (await database.db.query('SELECT status FROM public.reports WHERE id=$1', [dismissed.p_id]))
      .rows[0].status,
    'dismissed',
  );
  done(
    'Dismissal accepts the full 2,000-character Ethiopic reason and counts as a reviewed report without publishing a name',
  );
  await page.route('**/api/health', (route) => route.abort('failed'));
  await page.goto(base + '/status');
  await page
    .getByRole('alert')
    .getByText('The service check could not be completed. Try again.')
    .waitFor();
  assert.equal(await page.getByText('Checking the connected services…').count(), 0);
  await page.unroute('**/api/health');
  await page.getByRole('button', { name: 'Check again' }).click();
  await page.getByText('Session rate limits only', { exact: true }).waitFor();
  done('Health failure settles, Check again recovers, and anti-spam setup status is accurate');
  await page.route('**/api/reports', async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch(),
      data = await response.json();
    await route.fulfill({
      response,
      json: { ...data, turnstile_site_key: 'controlled-fixture-sitekey' },
    });
  });
  let scriptAttempts = 0;
  await page.route(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    (route) => {
      scriptAttempts++;
      if (scriptAttempts === 1) return route.abort('failed');
      return route.fulfill({
        contentType: 'application/javascript',
        body: "window.turnstile={render:(element,options)=>{window.fixtureChallenge=options;options.callback('controlled-token');return 'fixture-widget'},reset:()=>window.fixtureChallenge.callback('controlled-token'),remove:()=>{}}",
      });
    },
  );
  await page.goto(base + '/report');
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled);
  await page.locator('#office').fill('Synthetic challenge fixture');
  await page.locator('#city').fill(sample.city);
  await page.locator('#corruption_type').selectOption('other');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('#description').fill(sample.description);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Retry anti-spam check' }).waitFor();
  assert(await page.getByRole('button', { name: 'Submit privately' }).isDisabled());
  await page.getByRole('button', { name: 'Retry anti-spam check' }).click();
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled);
  await page.evaluate(() => window.fixtureChallenge['error-callback']('controlled-error'));
  await page.getByRole('button', { name: 'Retry anti-spam check' }).click();
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled);
  assert.equal(scriptAttempts, 2);
  done(
    'Anti-spam script/widget failures can retry without reloading or losing the draft (controlled widget fixture)',
  );
  await page.goto(base + '/');
  for (const button of await page.locator('.classic-faq-toggle').all()) {
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
  }
  const anchors = await page
    .locator('a[href*="#"]')
    .evaluateAll((links) => links.map((link) => ({ href: link.getAttribute('href') })));
  for (const { href } of anchors) {
    const target = new URL(href, base);
    if (target.pathname === '/' && target.hash)
      assert((await page.locator(target.hash).count()) > 0, 'Missing ' + href);
  }
  const routes = [
    '/',
    '/about',
    '/admin',
    '/af',
    '/am',
    '/analytics',
    '/api-docs',
    '/backend',
    '/changelog',
    '/demo',
    '/donate',
    '/faq',
    '/or',
    '/partners',
    '/press',
    '/privacy',
    '/report',
    '/setup-domain',
    '/sms',
    '/so',
    '/status',
    '/ti',
    '/tracker',
    '/transparency',
  ];
  const links = new Set();
  for (const path of routes) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    await page.locator('h1').first().waitFor();
    await assertFits();
    for (const href of await page
      .locator('a[href]')
      .evaluateAll((items) => items.map((item) => item.getAttribute('href')))) {
      if (href.startsWith('/') && !href.startsWith('//')) links.add(new URL(href, base).pathname);
    }
  }
  for (const path of links)
    assert.equal((await fetch(base + path)).status, 200, 'Broken local link ' + path);
  await page.goto(base + '/backend');
  await page.waitForURL(base + '/api-docs');
  await page.getByRole('heading', { name: 'Reporting interfaces.' }).waitFor();
  done(
    'All 24 top-level pages, every internal link, homepage anchor, FAQ toggle, and 96 responsive layouts pass',
  );
  assert.deepEqual(errors, []);
  const reportData = {
    timestamp: new Date().toISOString(),
    scope:
      'Isolated Next production build and fresh PGlite SQL; Auth/Storage and Turnstile providers use controlled fixtures; all writes are loopback-only.',
    checks: completed,
    page_errors: errors,
    production_staff_acceptance:
      'Still requires appointed staff and a real managed-provider enrollment/review drill.',
    production_capacity: 'Not established by this browser audit.',
  };
  if (process.env.AUDIT_REPORT_PATH)
    await writeFile(process.env.AUDIT_REPORT_PATH, JSON.stringify(reportData, null, 2) + '\n');
  console.log(JSON.stringify(reportData, null, 2));
} catch (error) {
  console.error(error);
  console.error(logs.slice(-2500));
  process.exitCode = 1;
} finally {
  await browser?.close();
  app.kill('SIGTERM');
  if (app.exitCode === null) await new Promise((resolve) => app.once('exit', resolve));
  await database.close();
}
