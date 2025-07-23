import path from 'node:path';
import { rootPath } from '@libcontext/utils/package';
import { migrate as execute } from 'drizzle-orm/libsql/migrator';
import { db } from './db';
import { library } from './schema';

export const migrate = async () => {
  return execute(db, { migrationsFolder: path.join(rootPath, 'migrations') });
};

export const clear = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Clear operation is not allowed in production environment');
  }

  await db.delete(library);
};
