// Pure domain helpers (no storage or extension APIs) so they stay unit-testable.
import type { Prompt } from './types';

export function newId(): string {
  return crypto.randomUUID();
}

export function makePrompt(partial: Partial<Prompt>): Prompt {
  const now = Date.now();
  return {
    id: partial.id ?? newId(),
    title: partial.title ?? 'Untitled prompt',
    body: partial.body ?? '',
    tags: partial.tags ?? [],
    folderId: partial.folderId ?? null,
    favorite: partial.favorite ?? false,
    usageCount: partial.usageCount ?? 0,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

/** Resolves duplicate titles by appending " (2)", " (3)", ... */
export function dedupeTitle(title: string, existing: Prompt[], selfId?: string): string {
  const base = title.trim() || 'Untitled prompt';
  const taken = new Set(
    existing.filter((p) => p.id !== selfId).map((p) => p.title.toLowerCase()),
  );
  if (!taken.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base} (${n})`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

export function snippet(body: string, max = 140): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
}

/** Parses a comma-separated tag string into clean, deduped tags. */
export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(',')) {
    const tag = part.trim().slice(0, 40);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= 20) break;
  }
  return tags;
}

/** Title for a prompt captured from selected page text. */
export function titleFromText(text: string): string {
  const firstLine = text.trim().split(/\r?\n/, 1)[0] ?? '';
  return firstLine.length <= 60 ? firstLine || 'Captured prompt' : `${firstLine.slice(0, 59).trimEnd()}…`;
}
