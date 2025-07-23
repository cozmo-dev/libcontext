import { embed, extract } from '@libcontext/ai';
import * as libcontext from '@libcontext/constants';
import { db, library, snippet } from '@libcontext/db';
import { Octokit } from '@octokit/rest';
import { eq } from 'drizzle-orm';

const fromName = (lib: string): { owner: string; repo: string } => {
  const parts = lib.split('/');
  if (parts.length !== 2) {
    console.log('Library name must be in format owner/repo');
    process.exit(1);
  }
  return { owner: parts[0].trim(), repo: parts[1].trim() };
};

const isDocumentationFile = (
  path: string,
  extensions: string[] = ['md', 'mdx'],
): boolean => {
  const ext = path.split('.').pop()?.toLowerCase();
  return ext ? extensions.includes(ext) : false;
};

const isInTargetFolders = (path: string, folders: string[] = []): boolean => {
  return (
    folders.length === 0 || folders.some((folder) => path.startsWith(folder))
  );
};

export interface AddOptions {
  name: string;
  branch?: string;
  tag?: string;
  folders?: string[];
  token?: string;
}

export const add = async ({
  name,
  tag,
  branch,
  token,
  folders = [],
}: AddOptions) => {
  const { owner, repo } = fromName(name);

  const github = new Octokit({
    userAgent: `${libcontext.name}/${libcontext.version}`,
    auth: token,
  });

  const {
    data: { description, default_branch },
  } = await github.repos.get({ owner, repo });
  const ref = tag ? `tags/${tag}` : `heads/${branch || default_branch}`;
  const libraryId = `${owner}/${repo}`;

  const {
    data: {
      object: { sha },
    },
  } = await github.git.getRef({
    owner,
    repo,
    ref,
  });

  const {
    data: { tree },
  } = await github.git.getTree({
    owner,
    repo,
    tree_sha: sha,
    recursive: 'true',
  });

  const files = tree
    .filter((item) => item.type === 'blob' && item.path)
    .filter((item) => isInTargetFolders(item.path, folders))
    .filter((item) => isDocumentationFile(item.path))
    .map(({ path, sha }) => ({
      libraryId,
      path,
      sha,
    }));

  console.log(`Found ${files.length} files`);

  const snippets = await Promise.all(
    files.map(async ({ path }) => {
      const { data } = await github.repos.getContent({
        owner,
        repo,
        ref,
        path,
      });

      if (Array.isArray(data) || data.type !== 'file') {
        throw new Error(
          `Expected file but got ${Array.isArray(data) ? 'array' : data.type}`,
        );
      }

      const content =
        data.encoding === 'base64'
          ? Buffer.from(data.content, 'base64').toString('utf-8')
          : data.content;

      const snippets = await extract({
        name,
        description,
        path,
        content,
      });

      const results = await Promise.all(
        snippets.map(async (snippet) => ({
          ...snippet,
          path,
          library: name,
          embedding: await embed(
            `## ${snippet.title}\n\n${snippet.description}`,
          ),
        })),
      );

      return results;
    }),
  );

  const data = snippets.flat();
  console.log(`Extracted ${data.length} snippets`);

  console.log('Building index...');
  await db.transaction(async (tx) => {
    await tx.delete(library).where(eq(library.name, name));
    await tx
      .insert(library)
      .values({
        name,
        owner,
        repo,
        folders,
        ref,
        sha,
        description,
      })
      .returning();
    await tx.insert(snippet).values(data);
  });
  console.log('Done');

  return { snippets: data.length };
};
