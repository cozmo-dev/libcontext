import { describe, expect, it } from 'bun:test';
import { db, library } from '@libcontext/db';
import { stubs } from '../../tests/stubs';
import { rm } from './rm';

describe('rm handler', () => {
  it('should remove an existing library and return count of 1', async () => {
    // Arrange: Insert a library
    const data = stubs.libraries['org1/repo1'];

    await db.insert(library).values(data);

    // Act: Remove the library
    const result = await rm({ name: data.name });

    // Assert
    expect(result).toBe(1);

    // Verify the library was actually deleted
    const remaining = await db.select().from(library);
    expect(remaining).toHaveLength(0);
  });

  it('should return 0 when trying to remove a non-existent library', async () => {
    // Act: Try to remove a library that doesn't exist
    const result = await rm({ name: 'non-existent/repo' });

    // Assert
    expect(result).toBe(0);
  });

  it('should only remove the specified library when multiple exist', async () => {
    // Arrange: Insert multiple libraries
    const libraries = Object.values(stubs.libraries);

    await db.insert(library).values(libraries);

    // Act: Remove only the second library
    const result = await rm({ name: stubs.libraries['org2/repo2'].name });

    // Assert
    expect(result).toBe(1);

    // Verify only the correct library was removed
    const remaining = await db.select().from(library);
    expect(remaining).toHaveLength(2);

    const remainingNames = remaining.map((lib) => lib.name);
    expect(remainingNames).toContain(stubs.libraries['org1/repo1'].name);
    expect(remainingNames).toContain(stubs.libraries['org3/repo3'].name);
    expect(remainingNames).not.toContain(stubs.libraries['org2/repo2'].name);
  });
});
