import { rm as handler, type RemoveOptions } from '@libcontext/handlers/rm';
import type { Command } from '@libcontext/types';

export const rm: Command<RemoveOptions> = {
  command: 'rm <name>',
  description: 'Remove a library from the server',
  builder: (yargs) =>
    yargs.positional('name', {
      description: 'GitHub repository name in <owner/repo> format',
      type: 'string',
      demandOption: true,
      coerce: (name) => name.toLowerCase(),
    }),
  handler: async (args) => {
    const count = await handler(args);
    console.log(
      count ? `Library ${args.name} removed` : `Library ${args.name} not found`,
    );
  },
};
