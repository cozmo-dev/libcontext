import { db, library } from '@libcontext/db';
import { eq } from 'drizzle-orm';

export interface RemoveOptions {
  name: string;
}

export const rm = async ({ name }: RemoveOptions) => {
  const libraries = await db.delete(library).where(eq(library.name, name));
  return libraries.rowsAffected;
};
