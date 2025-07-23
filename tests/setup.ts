import { afterAll, afterEach, beforeAll, type Mock, spyOn } from 'bun:test';
import { clear, migrate } from '@libcontext/db/migrations';

let exit: Mock<(code?: number | string | undefined | null) => never>;
let log: Mock<(...args: any[]) => void>;
let error: Mock<(...args: any[]) => void>;

beforeAll(migrate);
afterEach(clear);

beforeAll(() => {
  // Mock process.exit globally
  exit = spyOn(process, 'exit').mockImplementation(() => void 0 as never);
  log = spyOn(console, 'log').mockImplementation(() => {});
  error = spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  exit?.mockClear();
  log?.mockClear();
  error?.mockClear();
});

afterAll(() => {
  // Restore after all tests
  exit?.mockRestore();
  log?.mockRestore();
  error?.mockRestore();
});
