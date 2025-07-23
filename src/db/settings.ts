import { name } from '@libcontext/constants';
import { paths } from '@libcontext/utils/paths';
import { mkdir } from 'fs/promises';

if (process.env.NODE_ENV !== 'test') {
  try {
    await mkdir(paths.data, { recursive: true });
  } catch (e) {
    console.error(
      `Permission error to create data folder at "${paths.data}". Please, create this folder manually and make sure this app has write permission.`,
    );
    process.exit(1);
  }
}

export const url =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : `file:${paths.data}/${name}.db`;
