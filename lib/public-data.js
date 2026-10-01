import 'server-only';
import { unstable_cache } from 'next/cache';
import { rpc } from './db-client.mjs';
const snapshotForProject = unstable_cache(
  (_project) => rpc('sf_public_snapshot'),
  ['safuu-public-v3'],
  {
    revalidate: 60,
  },
);
const caseForProject = unstable_cache(
  (_project, id) => rpc('sf_public_case', { p_id: id }),
  ['safuu-case-v3'],
  { revalidate: 60 },
);
// Include the configured project in cache arguments. A staging deployment or
// reused local build must not read the previous project's public snapshot.
export const publicSnapshot = () => snapshotForProject(process.env.SUPABASE_URL);
export const publicCase = (id) => caseForProject(process.env.SUPABASE_URL, id);
