import 'server-only';
import { unstable_cache } from 'next/cache';
import { rpc } from './db-client.mjs';
export const publicSnapshot = unstable_cache(() => rpc('sf_public_snapshot'), ['safuu-public-v2'], {
  revalidate: 60,
});
export const publicCase = unstable_cache(
  (id) => rpc('sf_public_case', { p_id: id }),
  ['safuu-case-v2'],
  { revalidate: 60 },
);
