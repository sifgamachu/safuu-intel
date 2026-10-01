// Starts a fresh, loopback-only PostgreSQL cluster. No remote URL or existing
// database is accepted. Install PostgreSQL 17 and supply its bin directory.
import { Pool } from 'pg';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, chmod, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { prepareDatabase } from './database.mjs';
import net from 'node:net';

export async function nativeDatabase(binDirectory) {
  if (process.getuid?.() === 0)
    throw new Error(
      'Native PostgreSQL requires an unprivileged account. Use the capacity workflow on GitHub Actions or run this command as your normal user.',
    );
  const bin = resolve(binDirectory);
  const directory = await mkdtemp(join(tmpdir(), 'safuu-load-pg-'));
  await chmod(directory, 0o700);
  const password = randomBytes(32).toString('hex');
  const passwordFile = join(directory, 'password');
  await writeFile(passwordFile, password, { mode: 0o600 });
  const probe = net.createServer();
  await new Promise((r) => probe.listen(0, '127.0.0.1', r));
  const port = probe.address().port;
  await new Promise((r) => probe.close(r));
  let postgres, exited, admin, pool;
  let logs = '';
  const close = async () => {
    await pool?.end();
    await admin?.end();
    if (postgres && postgres.exitCode === null) postgres.kill('SIGTERM');
    await exited;
    await rm(directory, { recursive: true, force: true });
  };
  try {
    await new Promise((resolveRun, reject) => {
      const init = spawn(
        join(bin, 'initdb'),
        [
          '-D',
          join(directory, 'data'),
          '-U',
          'safuu_load',
          '--pwfile=' + passwordFile,
          '--auth=scram-sha-256',
          '--encoding=UTF8',
          '--locale=C',
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      );
      init.on('error', reject);
      init.stderr.on('data', (d) => {
        logs = (logs + d).slice(-4000);
      });
      init.once('exit', (code) =>
        code === 0 ? resolveRun() : reject(new Error('initdb failed: ' + logs)),
      );
    });
    postgres = spawn(
      join(bin, 'postgres'),
      [
        '-D',
        join(directory, 'data'),
        '-h',
        '127.0.0.1',
        '-p',
        String(port),
        '-c',
        'max_connections=60',
        '-c',
        'shared_buffers=256MB',
        '-c',
        'unix_socket_directories=' + directory,
        '-c',
        'fsync=on',
        '-c',
        'synchronous_commit=on',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    exited = new Promise((r) => postgres.once('exit', r));
    postgres.on('error', (error) => {
      logs = error.message;
    });
    postgres.stderr.on('data', (d) => {
      logs = (logs + d).slice(-4000);
    });
    const config = {
      host: '127.0.0.1',
      port,
      user: 'safuu_load',
      password,
      database: 'postgres',
      connectionTimeoutMillis: 1000,
    };
    admin = new Pool({ ...config, max: 1 });
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (postgres.exitCode !== null) throw new Error('Postgres exited: ' + logs);
      try {
        await admin.query('SELECT 1');
        ready = true;
        break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw new Error('Postgres did not start: ' + logs);
    await prepareDatabase({ exec: (sql) => admin.query(sql) });
    const {
      rows: [settings],
    } = await admin.query(`SELECT current_setting('server_version') AS version,
      current_setting('max_connections') AS max_connections, current_setting('shared_buffers') AS shared_buffers,
      current_setting('fsync') AS fsync, current_setting('synchronous_commit') AS synchronous_commit`);
    pool = new Pool({
      ...config,
      max: 24,
      options: '-c role=service_role',
      statement_timeout: 10000,
    });
    return {
      db: { query: (sql, args) => pool.query(sql, args), exec: (sql) => pool.query(sql), close },
      settings,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
