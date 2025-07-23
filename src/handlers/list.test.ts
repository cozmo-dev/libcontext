import { describe, expect, it } from 'bun:test';
import { db, library } from '@libcontext/db';
import { stubs } from '../../tests/stubs';
import { list } from './list';

describe('list handler', () => {
  it('should return empty array when no libraries exist', async () => {
    // Act
    const result = await list();

    // Assert
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return a single library when one exists', async () => {
    // Arrange: Insert a library
    const data = stubs.libraries['org1/repo1'];

    await db.insert(library).values(data);

    // Act
    const result = await list();

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(data);
  });

  it('should return all libraries when multiple exist', async () => {
    // Arrange: Insert multiple libraries
    const libraries = Object.values(stubs.libraries);

    await db.insert(library).values(libraries);

    // Act
    const result = await list();

    // Assert
    expect(result).toHaveLength(3);

    const resultNames = result.map((lib) => lib.name);
    for (const lib of libraries) {
      expect(resultNames).toContain(lib.name);
    }

    const resultDescriptions = result.map((lib) => lib.description);
    for (const lib of libraries) {
      expect(resultDescriptions).toContain(lib.description);
    }
  });
});
