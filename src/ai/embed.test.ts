import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { type MockResult, mockModule } from '../../tests/utils';
import { embed } from './embed';

describe('embed', () => {
  const create = mock(async () => ({
    data: [{ embedding: [0.1, -0.2, 0.3, 0.4, -0.5] }],
  }));

  let mocks: MockResult[] = [];

  beforeEach(async () => {
    mocks = [
      await mockModule('@libcontext/ai/openai', () => ({
        openai: {
          embeddings: { create },
        },
      })),
    ];
  });

  afterEach(() => {
    create.mockClear();
    mocks.forEach((mockResult) => mockResult.clear());
  });

  it('should return embedding array for valid input', async () => {
    // Arrange
    const input = 'Hello world';
    const embedding = [0.1, -0.2, 0.3, 0.4, -0.5];

    create.mockResolvedValueOnce({
      data: [{ embedding }],
    });

    // Act
    const result = await embed(input);

    // Assert
    expect(result).toEqual(embedding);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: input,
    });
  });
});
