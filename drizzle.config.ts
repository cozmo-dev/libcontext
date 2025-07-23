import { url } from '@libcontext/db/settings';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: { url },
} satisfies Config;
