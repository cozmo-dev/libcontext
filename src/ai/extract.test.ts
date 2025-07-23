import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { type MockResult, mockModule } from '../../tests/utils';
import { type ExtractOptions, extract } from './extract';

describe('extract', () => {
  const parse = mock(async (): Promise<any> => ({}));

  let mocks: MockResult[] = [];

  beforeEach(async () => {
    mocks = [
      await mockModule('@libcontext/ai/openai', () => ({
        openai: {
          chat: {
            completions: {
              parse,
            },
          },
        },
      })),
    ];
  });

  afterEach(() => {
    parse.mockClear();
    mocks.forEach((mockResult) => mockResult.clear());
  });

  const options: ExtractOptions = {
    name: 'test-library',
    description: 'A test library for testing',
    path: '/path/to/file.ts',
    content: 'console.log("hello world");',
  };

  describe('successful extraction', () => {
    it('should extract code snippets successfully', async () => {
      const mockSnippets = [
        {
          title: 'Basic Console Logging',
          description: 'Demonstrates basic console output functionality.',
          language: 'javascript',
          code: 'console.log("hello world");',
        },
      ];

      parse.mockResolvedValue({
        choices: [
          {
            message: {
              parsed: {
                snippets: mockSnippets,
              },
            },
          },
        ],
      });

      const result = await extract(options);

      expect(result).toEqual(mockSnippets);
      expect(parse).toHaveBeenCalledTimes(1);
    });

    it('should handle null description', async () => {
      const optionsWithNullDescription: ExtractOptions = {
        ...options,
        description: null,
      };

      const mockSnippets = [
        {
          title: 'Test Snippet',
          description: 'A test code snippet.',
          language: 'javascript',
          code: 'test();',
        },
      ];

      parse.mockResolvedValue({
        choices: [
          {
            message: {
              parsed: {
                snippets: mockSnippets,
              },
            },
          },
        ],
      });

      const result = await extract(optionsWithNullDescription);

      expect(result).toEqual(mockSnippets);
      expect(parse).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Description: No description'),
            }),
          ]),
        }),
      );
    });
  });

  describe('API call parameters', () => {
    beforeEach(() => {
      parse.mockResolvedValue({
        choices: [{ message: { parsed: { snippets: [] } } }],
      });
    });

    it('should call OpenAI API with correct model', async () => {
      await extract(options);

      expect(parse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4.1-mini',
          temperature: 0,
        }),
      );
    });

    it('should include system message with extraction instructions', async () => {
      await extract(options);

      // @ts-ignore
      const call: any = parse.mock.calls[0][0];
      const systemMessage = call.messages.find(
        (msg: any) => msg.role === 'system',
      );

      expect(systemMessage).toBeDefined();
      expect(systemMessage.content).toContain('expert technical writer');
      expect(systemMessage.content).toContain('llms.txt');
    });

    it('should include user message with library details and file content', async () => {
      await extract(options);

      // @ts-ignore
      const call: any = parse.mock.calls[0][0];
      const userMessage = call.messages.find((msg: any) => msg.role === 'user');

      expect(userMessage).toBeDefined();
      expect(userMessage.content).toContain('test-library');
      expect(userMessage.content).toContain('A test library for testing');
      expect(userMessage.content).toContain('/path/to/file.ts');
      expect(userMessage.content).toContain('console.log("hello world");');
    });

    it('should use structured output', async () => {
      await extract(options);
      // @ts-ignore
      const call: any = parse.mock.calls[0][0];
      expect(call.response_format).toBeDefined();
    });
  });

  describe('errors', () => {
    it('should throw API errors', async () => {
      const apiError = new Error('API request failed');
      parse.mockRejectedValue(apiError);
      expect(extract(options)).rejects.toThrow('API request failed');
    });
  });

  describe('edge cases', () => {
    it('should handle null response', async () => {
      parse.mockResolvedValue({
        choices: [
          {
            message: {
              parsed: null,
            },
          },
        ],
      });

      const result = await extract(options);
      expect(result).toEqual([]);
    });

    it('should handle missing snippets property', async () => {
      parse.mockResolvedValue({
        choices: [
          {
            message: {
              parsed: {},
            },
          },
        ],
      });

      const result = await extract(options);
      expect(result).toEqual([]);
    });

    it('should handle empty file content', async () => {
      const emptyContentOptions: ExtractOptions = {
        ...options,
        content: '',
      };

      parse.mockResolvedValue({
        choices: [{ message: { parsed: { snippets: [] } } }],
      });

      const result = await extract(emptyContentOptions);
      expect(result).toEqual([]);
    });
  });
});
