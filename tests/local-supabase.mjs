// Local-only PostgREST compatibility harness backed by PostgreSQL WASM (PGlite).
// This verifies HTTP behaviour and database effects; it is not a Supabase benchmark.
import http from 'node:http';
import { testDatabase, call } from './database.mjs';
export async function localSupabase(port = 54391, options = {}) {
  const db = options.db || (await testDatabase());
  if (options.prepare) await options.prepare(db);
  await db.exec('SET ROLE service_role');
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      // Optional controlled provider fixtures for isolated browser acceptance.
      if (options.handle && (await options.handle(req, res, db))) return;
      if (req.headers.authorization !== 'Bearer local-test-service-key')
        throw new Error('Unauthorized');
      if (req.method === 'POST' && req.url.startsWith('/rest/v1/rpc/')) {
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 150000) throw new Error('Too large');
        }
        const name = req.url.split('/').at(-1),
          args = JSON.parse(body || '{}');
        const value = await call(db, name, args);
        res.end(JSON.stringify(value));
        return;
      }
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/storage/v1/bucket/evidence') {
        const { rows } = await db.query("SELECT * FROM storage.buckets WHERE id='evidence'");
        res.end(JSON.stringify(rows[0]));
        return;
      }
      // Narrow table support for real worker execution and readiness checks.
      // Auth and Storage transport are not simulated by this database harness.
      const columns = {
        staff_members: ['user_id', 'role', 'active', 'created_at'],
        telegram_sessions: [
          'tipper_hash',
          'current_step',
          'language',
          'version',
          'sealed_draft',
          'draft',
        ],
        worker_heartbeats: ['id', 'last_seen'],
        reports: ['id', 'person_id', 'status', 'sealed_payload', 'created_at'],
        persons: [
          'id',
          'full_name',
          'office',
          'city',
          'verified_report_count',
          'disclosure_threshold',
          'coordination_hold',
          'publication_approved_at',
        ],
        report_evidence: [
          'id',
          'owner_hash',
          'object_path',
          'kind',
          'byte_size',
          'content_type',
          'uploaded_at',
          'report_id',
        ],
        audit_log: ['actor_email', 'action', 'target_type', 'target_id', 'metadata'],
      };
      const table = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/)?.[1];
      if (columns[table] && ['GET', 'HEAD', 'PATCH'].includes(req.method)) {
        const args = [],
          filters = [];
        for (const [column, value] of url.searchParams) {
          if (['select', 'limit', 'order'].includes(column)) continue;
          if (!columns[table].includes(column)) throw new Error('Unsupported filter');
          if (value === 'is.null') filters.push(`${column} IS NULL`);
          else if (value.startsWith('in.(') && value.endsWith(')')) {
            const values = value.slice(4, -1).split(',');
            if (values.length > 50) throw new Error('Too many filter values');
            const refs = values.map((item) => {
              args.push(item);
              return `$${args.length}`;
            });
            filters.push(`${column} IN (${refs.join(',')})`);
          } else {
            const operator = value.startsWith('eq.') ? '=' : value.startsWith('gt.') ? '>' : null;
            if (!operator) throw new Error('Unsupported filter');
            args.push(value.slice(3));
            filters.push(`${column} ${operator} $${args.length}`);
          }
        }
        const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
        if (req.method === 'PATCH') {
          if (table !== 'report_evidence') throw new Error('Unsupported update');
          let body = '';
          for await (const chunk of req) body += chunk;
          const patch = JSON.parse(body),
            keys = Object.keys(patch);
          if (keys.some((key) => !['uploaded_at'].includes(key)))
            throw new Error('Unsupported update column');
          const assignments = keys.map((key) => {
            args.push(patch[key]);
            return `${key}=$${args.length}`;
          });
          await db.query(`UPDATE public.${table} SET ${assignments.join(',')}${where}`, args);
          res.statusCode = 204;
          res.end();
          return;
        }
        const selected = (url.searchParams.get('select') || '*').split(',');
        if (selected.some((column) => column !== '*' && !columns[table].includes(column)))
          throw new Error('Invalid column');
        let ordering = '';
        if (url.searchParams.has('order')) {
          const [column, direction = 'asc'] = url.searchParams.get('order').split('.');
          if (!columns[table].includes(column) || !['asc', 'desc'].includes(direction))
            throw new Error('Invalid order');
          ordering = ` ORDER BY ${column} ${direction}`;
        }
        let limit = '';
        if (url.searchParams.has('limit')) {
          const count = Number(url.searchParams.get('limit'));
          if (!Number.isSafeInteger(count) || count < 1 || count > 100)
            throw new Error('Invalid limit');
          limit = ` LIMIT ${count}`;
        }
        const { rows } = await db.query(
          `SELECT ${selected.join(',')} FROM public.${table}${where}${ordering}${limit}`,
          args,
        );
        res.setHeader('Content-Range', `0-${Math.max(0, rows.length - 1)}/${rows.length}`);
        res.end(req.method === 'HEAD' ? undefined : JSON.stringify(rows));
        return;
      }
      if (['report_evidence', 'audit_log'].includes(table) && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const value = JSON.parse(body);
        for (const item of Array.isArray(value) ? value : [value]) {
          const keys = Object.keys(item);
          if (!keys.length || keys.some((key) => !columns[table].includes(key)))
            throw new Error('Unsupported insert');
          await db.query(
            `INSERT INTO public.${table}(${keys.join(',')}) VALUES(${keys.map((_, i) => `$${i + 1}`).join(',')})`,
            keys.map((key) => item[key]),
          );
        }
        res.statusCode = 201;
        res.end();
        return;
      }
      if (table === 'worker_heartbeats' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const value = JSON.parse(body);
        await db.query(
          'INSERT INTO public.worker_heartbeats(id,last_seen) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET last_seen=excluded.last_seen',
          [value.id, value.last_seen],
        );
        res.statusCode = 201;
        res.end();
        return;
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'Unsupported harness operation' }));
    } catch (error) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: error.message, code: error.code || 'P0001' }));
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return {
    db,
    server,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await db.close();
    },
  };
}
if (process.argv[1]?.endsWith('local-supabase.mjs')) {
  const instance = await localSupabase();
  console.log('Local PostgreSQL HTTP harness listening on 127.0.0.1:54391');
  for (const signal of ['SIGTERM', 'SIGINT'])
    process.on(signal, async () => {
      await instance.close();
      process.exit(0);
    });
}
