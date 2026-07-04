// Small settings live in chrome.storage.sync (per spec); prompt data never
// goes there. Falls back to defaults outside an extension context.
import type { Settings } from './types';

const DEFAULTS: Settings = { sort: 'recent' };

function hasSyncStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.sync;
}

export async function getSettings(): Promise<Settings> {
  if (!hasSyncStorage()) return { ...DEFAULTS };
  try {
    const stored = await chrome.storage.sync.get(DEFAULTS);
    return { ...DEFAULTS, ...stored } as Settings;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  if (!hasSyncStorage()) return;
  try {
    await chrome.storage.sync.set(patch);
  } catch {
    // Sync storage being unavailable is never fatal.
  }
}
