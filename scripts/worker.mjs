// Run as a persistent process with the same environment as the Next application.
import { drain } from '../lib/worker.mjs';
import { rpc } from '../lib/db-client.mjs';
let running = true,
  lastMaintenance = 0;
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    running = false;
  });
console.log('Safuu intake worker starting.');
while (running) {
  try {
    await drain({ budgetMs: 10000, batch: Number(process.env.WORKER_BATCH || 8) });
    if (Date.now() - lastMaintenance > 3600000) {
      await rpc('sf_queue_maintenance');
      lastMaintenance = Date.now();
    }
  } catch (error) {
    console.error('worker_cycle_failed', { code: error.code || error.name });
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
