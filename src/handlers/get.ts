import { embed } from '@libcontext/ai';
import { db, snippet } from '@libcontext/db';
import { eq, sql } from 'drizzle-orm';

export interface GetOptions {
  name: string;
  topic?: string;
  k: number;
}

const similarity = async ({ name, topic, k }: GetOptions) => {
  const vector = await embed(topic!);
  return db
    .select({
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      code: snippet.code,
    })
    .from(
      sql`vector_top_k('snippets_idx', vector32(${JSON.stringify(vector)}), ${k})`,
    )
    .innerJoin(snippet, sql`${snippet}.rowid = id`)
    .where(eq(snippet.library, name));
};

const all = async ({ name, k }: GetOptions) => {
  return await db
    .select()
    .from(snippet)
    .where(eq(snippet.library, name))
    .limit(k);
};

export const get = async (options: GetOptions) => {
  try {
    const query = options.topic ? similarity : all;
    const results = await query(options);

    if (results.length === 0) {
      return `No snippets found for library "${options.name}"${options.topic ? ` with topic: "${options.topic}"` : ''}`;
    }

    const snippets = results.map(
      (snippet) => `TITLE: ${snippet.title}
DESCRIPTION: ${snippet.description}
LANGUAGE: ${snippet.language}
CODE:
\`\`\`
${snippet.code}
\`\`\``,
    );
    return snippets.join('\n----------------------------------------\n');
  } catch (error) {
    return 'Failed to retrieve snippets';
  }
};
