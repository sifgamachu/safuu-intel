// Controlled, loopback-only Auth/Storage fixtures. SQL and app routes remain real.
// This verifies integration contracts, not managed-provider availability or load.
import { randomUUID } from 'node:crypto';
export function browserProvider() {
  const users = [
    { id: randomUUID(), email: 'reviewer@example.invalid', role: 'reviewer', factors: [] },
    {
      id: randomUUID(),
      email: 'publisher@example.invalid',
      role: 'publisher',
      factors: [{ id: randomUUID(), factor_type: 'totp', status: 'verified' }],
    },
  ];
  const tokens = new Map(),
    uploads = new Map(),
    downloads = new Map(),
    files = new Map();
  const password = 'isolated-browser-fixture-password';
  let signouts = 0;
  const user = (account) => ({
    id: account.id,
    email: account.email,
    aud: 'authenticated',
    role: 'authenticated',
    factors: account.factors,
    user_metadata: { role: 'admin' },
    created_at: new Date().toISOString(),
  });
  const session = (account, aal, origin) => {
    const claims = {
      sub: account.id,
      aal,
      aud: 'authenticated',
      role: 'authenticated',
      iss: origin + '/auth/v1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      session_id: randomUUID(),
    };
    const access_token =
      Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url') +
      '.' +
      Buffer.from(JSON.stringify(claims)).toString('base64url') +
      '.' +
      Buffer.from(randomUUID()).toString('base64url');
    tokens.set(access_token, account);
    return {
      access_token,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: randomUUID(),
      user: user(account),
    };
  };
  async function body(req) {
    let text = '';
    for await (const chunk of req) text += chunk;
    return JSON.parse(text || '{}');
  }
  const send = (res, value, status = 200) => {
    res.statusCode = status;
    res.end(JSON.stringify(value));
  };
  async function handle(req, res) {
    const url = new URL(req.url, 'http://' + req.headers.host);
    if (url.pathname.startsWith('/auth/v1/')) {
      if (url.pathname === '/auth/v1/token' && req.method === 'POST') {
        const input = await body(req),
          account = users.find((u) => u.email === input.email);
        if (!account || input.password !== password)
          send(res, { msg: 'Invalid login credentials', code: 'invalid_credentials' }, 400);
        else send(res, session(account, 'aal1', url.origin));
        return true;
      }
      const account = tokens.get(req.headers.authorization?.replace(/^Bearer /, ''));
      if (!account) {
        send(res, { msg: 'Invalid session', code: 'bad_jwt' }, 401);
        return true;
      }
      if (url.pathname === '/auth/v1/user') {
        send(res, user(account));
        return true;
      }
      if (url.pathname === '/auth/v1/logout') {
        signouts++;
        res.statusCode = 204;
        res.end();
        return true;
      }
      if (url.pathname === '/auth/v1/factors' && req.method === 'POST') {
        const input = await body(req),
          factor = {
            id: randomUUID(),
            factor_type: 'totp',
            status: 'unverified',
            friendly_name: input.friendly_name,
          };
        account.factors.push(factor);
        send(res, {
          id: factor.id,
          type: 'totp',
          totp: {
            secret: 'LOCALBROWSERFIXTUREONLY',
            uri: 'otpauth://totp/local',
            qr_code:
              '<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224"><rect width="224" height="224" fill="white"/><path d="M20 20h40v40H20z" fill="#000"/></svg>',
          },
        });
        return true;
      }
      const match = url.pathname.match(/^\/auth\/v1\/factors\/([^/]+)(?:\/(challenge|verify))?$/);
      const factor = account.factors.find((f) => f.id === match?.[1]);
      if (!factor) {
        send(res, { msg: 'Factor not found', code: 'mfa_factor_not_found' }, 404);
        return true;
      }
      if (req.method === 'DELETE') {
        account.factors = account.factors.filter((f) => f !== factor);
        send(res, {});
        return true;
      }
      if (match[2] === 'challenge') {
        send(res, { id: randomUUID(), expires_at: Math.floor(Date.now() / 1000) + 300 });
        return true;
      }
      if (match[2] === 'verify') {
        const input = await body(req);
        if (input.code !== '123456')
          send(res, { msg: 'Invalid authenticator code', code: 'mfa_verification_failed' }, 422);
        else {
          factor.status = 'verified';
          send(res, session(account, 'aal2', url.origin));
        }
        return true;
      }
      send(res, { msg: 'Unsupported fixture operation' }, 404);
      return true;
    }
    const upload = url.pathname.match(/^\/storage\/v1\/object\/upload\/sign\/evidence\/(.+)$/);
    if (upload && req.method === 'POST') {
      if (req.headers.authorization !== 'Bearer local-test-service-key') {
        send(res, {}, 403);
        return true;
      }
      const token = randomUUID();
      uploads.set(token, decodeURIComponent(upload[1]));
      send(res, { url: `/object/upload/sign/evidence/${upload[1]}?token=${token}` });
      return true;
    }
    const info = url.pathname.match(/^\/storage\/v1\/object\/info\/evidence\/(.+)$/);
    if (info) {
      if (req.headers.authorization !== 'Bearer local-test-service-key') {
        send(res, {}, 403);
        return true;
      }
      const file = files.get(decodeURIComponent(info[1]));
      send(
        res,
        file ? { size: file.bytes.length, content_type: file.type } : { message: 'Missing file' },
        file ? 200 : 404,
      );
      return true;
    }
    const sign = url.pathname.match(/^\/storage\/v1\/object\/sign\/evidence\/(.+)$/);
    if (sign && req.method === 'POST') {
      if (req.headers.authorization !== 'Bearer local-test-service-key') {
        send(res, {}, 403);
        return true;
      }
      const token = randomUUID();
      downloads.set(token, { path: decodeURIComponent(sign[1]), expires: Date.now() + 60000 });
      send(res, { signedURL: `/object/sign/evidence/${sign[1]}?token=${token}` });
      return true;
    }
    if (sign && req.method === 'GET') {
      const capability = downloads.get(url.searchParams.get('token'));
      const file =
        capability &&
        capability.expires > Date.now() &&
        capability.path === decodeURIComponent(sign[1]) &&
        files.get(capability.path);
      if (!file) send(res, {}, 403);
      else {
        res.setHeader('Content-Type', file.type);
        res.setHeader('Content-Disposition', 'attachment; filename="synthetic-evidence"');
        res.end(file.bytes);
      }
      return true;
    }
    if (url.pathname.startsWith('/storage/v1/object/public/')) {
      send(res, {}, 403);
      return true;
    }
    return false;
  }
  return {
    users,
    password,
    files,
    get signouts() {
      return signouts;
    },
    handle,
    prepare: async (db) => {
      for (const u of users) {
        await db.query('INSERT INTO auth.users(id) VALUES($1)', [u.id]);
        await db.query('INSERT INTO public.staff_members(user_id,role) VALUES($1,$2)', [
          u.id,
          u.role,
        ]);
      }
    },
    upload: (token, type, bytes) => {
      const path = uploads.get(token);
      if (!path || files.has(path)) return false;
      files.set(path, { type, bytes });
      return true;
    },
  };
}
