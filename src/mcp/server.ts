import { name, topK, version } from '@libcontext/constants';
import { get, list } from '@libcontext/handlers';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

const libraries = await list();
const names = libraries.map((lib) => lib.name);

export const server = new FastMCP({
  name,
  version,
  instructions:
    'Use this server to retrieve up-to-date documentation and code examples for any library.',
  health: {
    enabled: true,
    path: '/health',
    message: 'healthy',
    status: 200,
  },
});

server.addTool({
  name: 'get-library-docs',
  description:
    'Fetches up-to-date documentation for a library. Call it multiple times if needed, one topic at a time.',
  parameters: z.object({
    name: z
      .enum(names as [string, ...string[]])
      .describe('Library name to fetch'),
    topic: z
      .string()
      .optional()
      .describe(
        "A single topic to focus documentation on (e.g., 'hooks', 'routing').",
      ),
  }),
  execute: async ({ name, topic }) => {
    return get({ name, topic, k: topK });
  },
});
