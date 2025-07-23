import { sql } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { f32 } from './types';

export const library = sqliteTable('libraries', {
  name: text('name').notNull().primaryKey(),
  description: text('description'),
  owner: text('owner').notNull(),
  repo: text('repo').notNull(),
  ref: text('ref').notNull(),
  sha: text('sha').notNull(),
  folders: text('folders', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`(json_array())`),
  files: int('files').default(0),
  snippets: int('snippets').default(0),
  timestamp: text('timestamp').notNull().default(sql`(current_timestamp)`),
});
export type Library = typeof library.$inferSelect;
export type CreateLibrary = typeof library.$inferInsert;

export const snippet = sqliteTable('snippets', {
  record: int('record').primaryKey({ autoIncrement: true }),
  library: text('library')
    .references(() => library.name, { onDelete: 'cascade' })
    .notNull(),
  path: text('path').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  language: text('language'),
  code: text('code').notNull(),
  embedding: f32('embedding', { dimensions: 1536 }),
});
export type Snippet = typeof snippet.$inferSelect;
export type CreateSnippet = typeof snippet.$inferInsert;
