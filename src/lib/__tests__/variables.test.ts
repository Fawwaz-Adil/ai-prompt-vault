import { describe, expect, it } from 'vitest';
import { extractVariables, fillVariables } from '../variables';

describe('extractVariables', () => {
  it('finds unique variables in order', () => {
    expect(extractVariables('Write about {{topic}} for {{audience}}, focusing on {{topic}}')).toEqual([
      'topic',
      'audience',
    ]);
  });

  it('trims whitespace inside braces', () => {
    expect(extractVariables('Hello {{ name }}!')).toEqual(['name']);
  });

  it('returns empty for prompts without variables', () => {
    expect(extractVariables('No placeholders here')).toEqual([]);
  });
});

describe('fillVariables', () => {
  it('substitutes provided values', () => {
    const { text, missing } = fillVariables('Write about {{topic}} for {{audience}}', {
      topic: 'chess',
      audience: 'kids',
    });
    expect(text).toBe('Write about chess for kids');
    expect(missing).toEqual([]);
  });

  it('keeps placeholders for missing values and reports them', () => {
    const { text, missing } = fillVariables('{{a}} and {{b}}', { a: 'one' });
    expect(text).toBe('one and {{b}}');
    expect(missing).toEqual(['b']);
  });

  it('treats empty strings as missing', () => {
    const { missing } = fillVariables('{{x}}', { x: '' });
    expect(missing).toEqual(['x']);
  });
});
