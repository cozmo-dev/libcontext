import { mkdirSync } from 'node:fs';
import { name } from '@libcontext/constants';
import { paths } from '@libcontext/utils/paths';

if (process.env.NODE_ENV !== 'test') {
  try {
    mkdirSync(paths.data, { recursive: true });
  } catch (error) {
    console.error(
      `Permission error to create data folder at "${paths.data}". Please, create this folder manually and make sure this app has write permission.`,
      error,
    );
    process.exit(1);
  }
}

export const url =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : `file:${paths.data}/${name}.db`;
