import { type GetOptions, get as handler } from '@libcontext/handlers/get';
import type { Command } from '@libcontext/types';

export const get: Command<GetOptions> = {
  command: 'get <name> [topic]',
  description: 'Fetches up-to-date documentation for a library',
  builder: (yargs) => {
    return yargs
      .positional('name', {
        description: 'Name of the library to search in <owner/repo> format',
        type: 'string',
        demandOption: true,
        coerce: (name) => name.toLowerCase(),
      })
      .positional('topic', {
        description:
          'Topic to focus documentation on (e.g., "hooks", "routing").',
        type: 'string',
        demandOption: false,
      })
      .option('k', {
        description: 'The number of snippets to return (top k)',
        type: 'number',
        default: 10,
      });
  },
  handler: async (args) => {
    const results = await handler(args);
    console.log(results);
  },
};
