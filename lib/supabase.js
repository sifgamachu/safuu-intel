import 'server-only';
import { serviceClient } from './db-client.mjs';
export const supabase = new Proxy(
  {},
  {
    get(_target, property) {
      const client = serviceClient();
      const value = client[property];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  },
);
