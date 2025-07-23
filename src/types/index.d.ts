import type { Argv } from 'yargs';

export interface Command<T = {}> {
  command: string;
  description: string;
  builder?: (yargs: Argv) => Argv<T>;
  handler: (argv: T) => Promise<void>;
}
