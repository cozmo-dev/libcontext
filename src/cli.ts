import { add, get, list, rm, start } from '@libcontext/commands';
import { name, version } from '@libcontext/constants';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export const cli = yargs(hideBin(process.argv))
  .scriptName(name)
  .version(version)
  .command(add)
  .command(list)
  .command(get)
  .command(start)
  .command(rm)
  .help()
  .demandCommand(1);
