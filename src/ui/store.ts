import { useCallback, useEffect, useState } from 'preact/hooks';
import * as db from '../lib/db';
import type { Folder, Prompt } from '../lib/types';

export interface VaultData {
  prompts: Prompt[];
  folders: Folder[];
  loading: boolean;
  refresh: () => Promise<void>;
}

/** Loads the vault and stays in sync across popup/side panel/service worker. */
export function useVaultData(): VaultData {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [p, f] = await Promise.all([db.getAllPrompts(), db.getAllFolders()]);
      setPrompts(p);
      setFolders(f);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return db.onChange(() => void refresh());
  }, [refresh]);

  return { prompts, folders, loading, refresh };
}
