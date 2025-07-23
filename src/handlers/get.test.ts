import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { db, library, snippet } from '@libcontext/db';
import { stubs } from '../../tests/stubs';
import { type MockResult, mockModule } from '../../tests/utils';
import { type GetOptions, get } from './get';

describe('get', () => {
  const lib = stubs.libraries['org1/repo1'];
  const embed = mock(async () =>
    Array.from({ length: 1536 }, (_, i) => i * 0.001),
  );
  let mocks: MockResult[] = [];

  beforeEach(async () => {
    await db.insert(library).values(lib);
  });

  beforeEach(async () => {
    mocks = [await mockModule('@libcontext/ai', () => ({ embed }))];
  });

  afterEach(() => {
    embed.mockClear();
    mocks.forEach((mockResult) => mockResult.clear());
  });

  describe('when no topic is provided (all query)', () => {
    it('should return a special message when library was not added', async () => {
      // Act
      const options: GetOptions = { name: 'non-existent/repo', k: 10 };
      const result = await get(options);

      // Assert
      expect(result).toInclude('No snippets found');
      expect(embed).not.toHaveBeenCalled();
    });

    it('should return all snippets for a library up to k limit', async () => {
      // Arrange: Insert test snippets
      const snippets = [
        {
          library: lib.name,
          title: 'First Snippet',
          description: 'First test snippet',
          language: 'javascript',
          code: 'console.log("first");',
          path: 'doc.md',
        },
        {
          library: lib.name,
          title: 'Second Snippet',
          description: 'Second test snippet',
          language: 'typescript',
          code: 'const x: number = 42;',
          path: 'doc.md',
        },
        {
          library: lib.name,
          title: 'Other Library Snippet',
          description: 'Should not be included',
          language: 'python',
          code: 'print("hello")',
          path: 'doc.md',
        },
      ];

      await db.insert(snippet).values(snippets);

      // Act
      const result = await get({ name: lib.name, k: 10 });

      // Assert
      expect(embed).not.toHaveBeenCalled();
      expect(result).toContain('TITLE: First Snippet');
      expect(result).toContain('DESCRIPTION: First test snippet');
      expect(result).toContain('LANGUAGE: javascript');
      expect(result).toContain('console.log("first");');
      expect(result).toContain('TITLE: Second Snippet');
      expect(result).toContain('DESCRIPTION: Second test snippet');
      expect(result).toContain('LANGUAGE: typescript');
      expect(result).toContain('const x: number = 42;');
    });

    it('should respect the k limit', async () => {
      // Arrange: Insert more snippets than k limit
      const snippets = Array.from({ length: 5 }, (_, i) => ({
        library: lib.name,
        title: `Snippet ${i + 1}`,
        description: `Description ${i + 1}`,
        language: 'javascript',
        code: `console.log(${i + 1});`,
        path: 'doc.md',
      }));

      await db.insert(snippet).values(snippets);

      // Act: Request only 3 snippets
      const result = await get({ name: lib.name, k: 3 });

      // Assert
      const snippetCount = (result.match(/TITLE:/g) || []).length;
      expect(snippetCount).toBe(3);
      expect(embed).not.toHaveBeenCalled();
    });

    it('should format snippets correctly', async () => {
      // Arrange
      const snippets = {
        library: lib.name,
        title: 'Test Function',
        description: 'A test function example',
        language: 'python',
        code: 'def test():\n    return "hello world"',
        path: 'doc.md',
      };

      await db.insert(snippet).values(snippets);

      // Act
      const result = await get({ name: lib.name, k: 1 });

      // Assert
      const expectedFormat = `TITLE: Test Function
DESCRIPTION: A test function example
LANGUAGE: python
CODE:
\`\`\`
def test():
    return "hello world"
\`\`\``;
      expect(result).toBe(expectedFormat);
    });
  });

  describe('when topic is provided (similarity query)', () => {
    it('should call embed function with the topic', async () => {
      // Arrange
      const snippets = {
        library: lib.name,
        title: 'Test Snippet',
        description: 'Test description',
        language: 'javascript',
        code: 'console.log("test");',
        path: 'doc.md',
      };

      await db.insert(snippet).values(snippets);

      // Act
      await get({
        name: lib.name,
        topic: 'how to log messages',
        k: 5,
      });

      // Assert
      expect(embed).toHaveBeenCalledWith('how to log messages');
    });

    it('should return a special message when no similar snippets found', async () => {
      // Act
      const result = await get({
        name: 'non-existent/repo',
        topic: 'some topic',
        k: 5,
      });

      // Assert
      expect(result).toInclude('No snippets found');
      expect(embed).toHaveBeenCalledWith('some topic');
    });
  });

  describe('output formatting', () => {
    it('should join multiple snippets with separator', async () => {
      // Arrange
      const snippets = [
        {
          library: lib.name,
          title: 'First',
          description: 'First desc',
          language: 'js',
          code: 'first();',
          path: 'doc.md',
        },
        {
          library: lib.name,
          title: 'Second',
          description: 'Second desc',
          language: 'js',
          code: 'second();',
          path: 'doc.md',
        },
      ];

      await db.insert(snippet).values(snippets);

      // Act
      const result = await get({ name: lib.name, k: 10 });

      // Assert
      const separatorCount = (
        result.match(/----------------------------------------/g) || []
      ).length;
      expect(separatorCount).toBe(1); // One separator between two snippets
    });
  });
});
