import { mock } from 'bun:test';

export type MockResult = {
  clear: () => void;
};

export const mockModule = async (
  modulePath: string,
  renderMocks: () => Record<string, any>,
): Promise<MockResult> => {
  const original = {
    ...(await import(modulePath)),
  };
  const mocks = renderMocks();
  const result = {
    ...original,
    ...mocks,
  };
  mock.module(modulePath, () => result);
  return {
    clear: () => {
      mock.module(modulePath, () => original);
    },
  };
};
