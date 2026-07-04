// Shared storage layer on IndexedDB. Works from the popup, the side panel
// and the background service worker (all share the extension origin).
// Cross-context change notifications go over a BroadcastChannel so every
// open view stays in sync without polling.
import type { Folder, Prompt } from './types';

const DB_NAME = 'ai-prompt-vault';
const DB_VERSION = 1;
const CHANNEL_NAME = 'pv-sync';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('prompts')) {
        const store = db.createObjectStore('prompts', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      req.result.onclose = () => {
        dbPromise = null;
      };
      resolve(req.result);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error('Failed to open database'));
    };
  });
  return dbPromise;
}

function run<T>(
  stores: string[],
  mode: IDBTransactionMode,
  fn: (tx: IDBTransaction) => IDBRequest<T> | void,
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(stores, mode);
        let result: T | undefined;
        const req = fn(tx);
        if (req) {
          req.onsuccess = () => {
            result = req.result;
          };
        }
        tx.oncomplete = () => resolve(result as T);
        tx.onerror = () => reject(tx.error ?? new Error('Transaction failed'));
        tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
      }),
  );
}

export function getAllPrompts(): Promise<Prompt[]> {
  return run(['prompts'], 'readonly', (tx) => tx.objectStore('prompts').getAll());
}

export function getAllFolders(): Promise<Folder[]> {
  return run(['folders'], 'readonly', (tx) => tx.objectStore('folders').getAll());
}

export async function putPrompt(prompt: Prompt): Promise<void> {
  await run(['prompts'], 'readwrite', (tx) => {
    tx.objectStore('prompts').put(prompt);
  });
  notifyChange();
}

export async function putMany(prompts: Prompt[], folders: Folder[]): Promise<void> {
  await run(['prompts', 'folders'], 'readwrite', (tx) => {
    const folderStore = tx.objectStore('folders');
    for (const folder of folders) folderStore.put(folder);
    const promptStore = tx.objectStore('prompts');
    for (const prompt of prompts) promptStore.put(prompt);
  });
  notifyChange();
}

export async function deletePrompt(id: string): Promise<void> {
  await run(['prompts'], 'readwrite', (tx) => {
    tx.objectStore('prompts').delete(id);
  });
  notifyChange();
}

export async function putFolder(folder: Folder): Promise<void> {
  await run(['folders'], 'readwrite', (tx) => {
    tx.objectStore('folders').put(folder);
  });
  notifyChange();
}

/** Deletes a folder and moves its prompts to "No folder" in one transaction. */
export async function deleteFolder(id: string): Promise<void> {
  await run(['folders', 'prompts'], 'readwrite', (tx) => {
    tx.objectStore('folders').delete(id);
    const store = tx.objectStore('prompts');
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return;
      const prompt = cursor.value as Prompt;
      if (prompt.folderId === id) {
        prompt.folderId = null;
        cursor.update(prompt);
      }
      cursor.continue();
    };
  });
  notifyChange();
}

// ---------- change notifications ----------

let sendChannel: BroadcastChannel | null = null;

export function notifyChange(): void {
  try {
    if (typeof BroadcastChannel === 'undefined') return;
    sendChannel ??= new BroadcastChannel(CHANNEL_NAME);
    sendChannel.postMessage('changed');
  } catch {
    // Non-fatal: views refresh on their own actions anyway.
  }
}

export function onChange(callback: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {};
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = () => callback();
  return () => channel.close();
}

export function isQuotaError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'QuotaExceededError';
}
