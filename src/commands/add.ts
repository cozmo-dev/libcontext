import { type AddOptions, add as handler } from '@libcontext/handlers/add';
import type { Command } from '@libcontext/types';

export const add: Command<AddOptions> = {
  command: 'add <name>',
  description: 'Add a library documentation to the server',
  builder: (yargs) =>
    yargs
      .positional('name', {
        description: 'GitHub repository name in <owner/repo> format',
        type: 'string',
        demandOption: true,
        coerce: (name) => name.toLowerCase(),
      })
      .option('branch', {
        description: 'Git branch to parse',
        type: 'string',
      })
      .option('tag', {
        description: 'Git tag to parse',
        type: 'string',
      })
      .option('folders', {
        description: 'Repository folders with documentation files',
        array: true,
        type: 'string',
      })
      .option('token', {
        description: 'GitHub token, required to access private repositories',
        type: 'string',
      })
      .check((argv) => {
        if (!!argv.branch && !!argv.tag) {
          throw new Error(
            'You can specify either --branch or --tag, but not both.',
          );
        }

        return true;
      }),
  handler: async (args) => {
    const { snippets } = await handler(args);
    console.log(`Indexed ${snippets} snippets`);
  },
};
