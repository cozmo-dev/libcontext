import fs, { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findPackageRoot = (startPath: string = __dirname): string => {
  let currentPath = startPath;
  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, 'package.json'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  throw new Error('Could not find package root with package.json');
};

export const rootPath = findPackageRoot();
export const packageJsonPath = path.join(rootPath, 'package.json');
export const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
