// Local-only PostgREST compatibility harness backed by PostgreSQL WASM (PGlite).
// This verifies HTTP behaviour and database effects; it is not a Supabase benchmark.
import http from 'node:http';
import { testDatabase, call } from './database.mjs';
export async function localSupabase(port = 54391) {
  const db = await testDatabase();
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
      // Used by evidence-free report submissions: no direct tables are needed.
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
