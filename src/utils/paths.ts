import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { name } from '@libcontext/constants';

const homedir = os.homedir();
const tmpdir = os.tmpdir();
const env = process.env;

const macos = () => {
  const library = path.join(homedir, 'Library');
  return {
    data: path.join(library, 'Application Support', name),
    config: path.join(library, 'Preferences', name),
    cache: path.join(library, 'Caches', name),
    log: path.join(library, 'Logs', name),
    temp: path.join(tmpdir, name),
  };
};

const windows = () => {
  const appData = env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
  const localAppData =
    env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');

  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path.join(localAppData, name, 'Data'),
    config: path.join(appData, name, 'Config'),
    cache: path.join(localAppData, name, 'Cache'),
    log: path.join(localAppData, name, 'Log'),
    temp: path.join(tmpdir, name),
  };
};

// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
const linux = () => {
  const username = path.basename(homedir);
  return {
    data: path.join(
      env.XDG_DATA_HOME || path.join(homedir, '.local', 'share'),
      name,
    ),
    config: path.join(
      env.XDG_CONFIG_HOME || path.join(homedir, '.config'),
      name,
    ),
    cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, '.cache'), name),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path.join(
      env.XDG_STATE_HOME || path.join(homedir, '.local', 'state'),
      name,
    ),
    temp: path.join(tmpdir, username, name),
  };
};

function parse() {
  switch (process.platform) {
    case 'darwin':
      return macos();
    case 'win32':
      return windows();
    default:
      return linux();
  }
}

export const paths = parse();
