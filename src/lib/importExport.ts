// JSON import/export. Imports are treated as untrusted input: every field is
// type-checked, length-capped and re-assembled into fresh objects so nothing
// unexpected reaches storage or the UI.
import type { Folder, Prompt } from './types';
import { makePrompt, newId, titleFromText } from './model';

export const LIMITS = {
  title: 200,
  body: 100_000,
  tag: 40,
  tagsPerPrompt: 20,
  folderName: 60,
  items: 20_000,
};

export interface ParsedImport {
  prompts: Prompt[];
  folders: Folder[];
}

export function serializeVault(prompts: Prompt[], folders: Folder[]): string {
  return JSON.stringify(
    { app: 'ai-prompt-vault', version: 1, exportedAt: new Date().toISOString(), folders, prompts },
    null,
    2,
  );
}

function asString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function asId(value: unknown): string | null {
  return typeof value === 'string' && /^[\w-]{1,64}$/.test(value) ? value : null;
}

function asTime(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : Date.now();
}

function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of value) {
    const tag = asString(raw, LIMITS.tag).trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= LIMITS.tagsPerPrompt) break;
  }
  return tags;
}

export function parseImport(raw: string): ParsedImport {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const rawPrompts = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).prompts)
      ? ((data as Record<string, unknown>).prompts as unknown[])
      : null;
  if (!rawPrompts) throw new Error('No prompts found in that file.');
  if (rawPrompts.length > LIMITS.items) {
    throw new Error(`Too many prompts in one file (max ${LIMITS.items}).`);
  }

  const rawFolders =
    data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).folders)
      ? ((data as Record<string, unknown>).folders as unknown[])
      : [];

  // Sanitize folders; remap invalid/duplicate ids to fresh ones.
  const folders: Folder[] = [];
  const folderIdMap = new Map<string, string>();
  const usedFolderIds = new Set<string>();
  for (const entry of rawFolders.slice(0, 500)) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const name = asString(record.name, LIMITS.folderName).trim();
    if (!name) continue;
    const originalId = asId(record.id);
    let id = originalId ?? newId();
    if (usedFolderIds.has(id)) id = newId();
    usedFolderIds.add(id);
    if (originalId) folderIdMap.set(originalId, id);
    folders.push({ id, name, createdAt: asTime(record.createdAt) });
  }

  // Sanitize prompts; folder references that don't resolve become "No folder".
  const prompts: Prompt[] = [];
  const usedPromptIds = new Set<string>();
  for (const entry of rawPrompts) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const body = asString(record.body ?? record.text ?? record.content, LIMITS.body);
    if (!body.trim()) continue;
    let id = asId(record.id) ?? newId();
    if (usedPromptIds.has(id)) id = newId();
    usedPromptIds.add(id);
    const rawFolderId = asId(record.folderId);
    const usage = record.usageCount;
    prompts.push(
      makePrompt({
        id,
        title: asString(record.title ?? record.name, LIMITS.title).trim() || titleFromText(body),
        body,
        tags: sanitizeTags(record.tags),
        folderId: rawFolderId ? (folderIdMap.get(rawFolderId) ?? null) : null,
        favorite: record.favorite === true,
        usageCount:
          typeof usage === 'number' && Number.isFinite(usage) && usage > 0
            ? Math.min(Math.floor(usage), 1_000_000)
            : 0,
        createdAt: asTime(record.createdAt),
        updatedAt: asTime(record.updatedAt),
      }),
    );
  }

  return { prompts, folders };
}
