import { rootPath } from '@libcontext/utils/package';
import { migrate as execute } from 'drizzle-orm/libsql/migrator';
import path from 'path';
import { db } from './db';
import { library } from './schema';

export const migrate = async () => {
  return execute(db, { migrationsFolder: path.join(rootPath, 'migrations') });
};

export const clear = async () => {
  await db.delete(library);
};
