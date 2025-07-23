import { db, library } from '@libcontext/db';

export const list = async () => {
  return db.select().from(library);
};
