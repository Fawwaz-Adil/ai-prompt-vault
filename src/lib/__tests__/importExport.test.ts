import { describe, expect, it } from 'vitest';
import { parseImport, serializeVault } from '../importExport';
import { makePrompt } from '../model';

describe('parseImport', () => {
  it('round-trips an export', () => {
    const prompt = makePrompt({ title: 'Test', body: 'Body text', tags: ['a'] });
    const parsed = parseImport(serializeVault([prompt], []));
    expect(parsed.prompts).toHaveLength(1);
    expect(parsed.prompts[0].title).toBe('Test');
    expect(parsed.prompts[0].body).toBe('Body text');
  });

  it('rejects non-JSON input', () => {
    expect(() => parseImport('not json {')).toThrow(/valid JSON/);
  });

  it('rejects files without prompts', () => {
    expect(() => parseImport('{"foo": 1}')).toThrow(/No prompts/);
  });

  it('sanitizes malicious or malformed entries', () => {
    const parsed = parseImport(
      JSON.stringify({
        prompts: [
          { id: '<script>', title: 42, body: 'valid body', tags: ['ok', 7, ''], favorite: 'yes', usageCount: -5 },
          { body: '   ' }, // blank body -> dropped
          'not an object',
        ],
      }),
    );
    expect(parsed.prompts).toHaveLength(1);
    const p = parsed.prompts[0];
    expect(p.id).toMatch(/^[\w-]+$/); // invalid id regenerated
    expect(p.title).toBe('valid body'); // non-string title falls back to body text
    expect(p.tags).toEqual(['ok']);
    expect(p.favorite).toBe(false);
    expect(p.usageCount).toBe(0);
  });

  it('remaps unknown folder references to null', () => {
    const parsed = parseImport(
      JSON.stringify({
        folders: [{ id: 'f1', name: 'Writing' }],
        prompts: [
          { title: 'In folder', body: 'x', folderId: 'f1' },
          { title: 'Orphan', body: 'y', folderId: 'deleted-folder' },
        ],
      }),
    );
    expect(parsed.folders).toHaveLength(1);
    expect(parsed.prompts[0].folderId).toBe(parsed.folders[0].id);
    expect(parsed.prompts[1].folderId).toBeNull();
  });

  it('accepts a bare array of prompts', () => {
    const parsed = parseImport(JSON.stringify([{ title: 'A', body: 'b' }]));
    expect(parsed.prompts).toHaveLength(1);
  });
});
