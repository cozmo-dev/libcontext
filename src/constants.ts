import { packageJson } from '@libcontext/utils/package';

export const name = Object.keys(packageJson.bin)[0];
export const version = packageJson.version;
export const topK = 15;
