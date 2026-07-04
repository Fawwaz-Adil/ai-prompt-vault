import { describe, expect, it } from 'vitest';
import { makePrompt } from '../model';
import { searchPrompts, sortPrompts } from '../search';

const prompts = [
  makePrompt({ id: 'a', title: 'Blog outline generator', body: 'Create an outline', tags: ['writing'], updatedAt: 3 }),
  makePrompt({ id: 'b', title: 'Code reviewer', body: 'Review this code for bugs', tags: ['coding'], updatedAt: 2 }),
  makePrompt({ id: 'c', title: 'Email polisher', body: 'Rewrite my email about blog topics', tags: ['email'], updatedAt: 1, usageCount: 9 }),
];

describe('searchPrompts', () => {
  it('ranks title matches above body matches', () => {
    const results = searchPrompts(prompts, 'blog');
    expect(results.map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('matches tags', () => {
    expect(searchPrompts(prompts, 'coding').map((p) => p.id)).toEqual(['b']);
  });

  it('requires every term to match (AND semantics)', () => {
    expect(searchPrompts(prompts, 'blog email').map((p) => p.id)).toEqual(['c']);
    expect(searchPrompts(prompts, 'blog nonexistent')).toEqual([]);
  });

  it('returns everything for an empty query', () => {
    expect(searchPrompts(prompts, '  ')).toHaveLength(3);
  });
});

describe('sortPrompts', () => {
  it('sorts by recency by default', () => {
    expect(sortPrompts(prompts, 'recent').map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts alphabetically', () => {
    expect(sortPrompts(prompts, 'alpha').map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by usage', () => {
    expect(sortPrompts(prompts, 'used')[0].id).toBe('c');
  });
});
