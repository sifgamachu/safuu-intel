// Local-only PostgREST compatibility harness backed by PostgreSQL WASM (PGlite).
// This verifies HTTP behaviour and database effects; it is not a Supabase benchmark.
import http from 'node:http';
import { testDatabase, call } from './database.mjs';
export async function localSupabase(port = 54391, options = {}) {
  const db = options.db || (await testDatabase());
  await db.exec('SET ROLE service_role');
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
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
      };
      const table = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/)?.[1];
      if (columns[table] && ['GET', 'HEAD'].includes(req.method)) {
        const selected = (url.searchParams.get('select') || '*').split(',');
        if (selected.some((column) => column !== '*' && !columns[table].includes(column)))
          throw new Error('Invalid column');
        const args = [],
          filters = [];
        for (const [column, value] of url.searchParams) {
          if (['select', 'limit', 'order'].includes(column)) continue;
          if (!columns[table].includes(column) || !value.startsWith('eq.'))
            throw new Error('Unsupported filter');
          args.push(value.slice(3));
          filters.push(`${column} = $${args.length}`);
        }
        const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
        const { rows } = await db.query(
          `SELECT ${selected.join(',')} FROM public.${table}${where}`,
          args,
        );
        res.setHeader('Content-Range', `0-${Math.max(0, rows.length - 1)}/${rows.length}`);
        res.end(req.method === 'HEAD' ? undefined : JSON.stringify(rows));
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
