import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import * as db from '../lib/db';
import { serializeVault } from '../lib/importExport';
import { copyToClipboard, insertIntoActiveTab } from '../lib/insert';
import { dedupeTitle, makePrompt, newId } from '../lib/model';
import { searchPrompts, sortPrompts } from '../lib/search';
import { getSettings, updateSettings } from '../lib/settings';
import type { Folder, Prompt, SortMode } from '../lib/types';
import { importIntoVault } from '../lib/vault';
import { extractVariables } from '../lib/variables';
import { Chip, EmptyState, PromptCard, Toast } from './components';
import { Editor, type EditorDraft } from './Editor';
import { FoldersPanel } from './FoldersPanel';
import { LogoIcon, PanelIcon, PlusIcon, SearchIcon, StarIcon } from './icons';
import { SettingsMenu } from './SettingsMenu';
import { useVaultData } from './store';
import { VariableModal } from './VariableModal';

const PAGE_SIZE = 120;

type Filter = 'all' | 'fav' | string; // string = folder id
type UseAction = 'insert' | 'copy';

interface AppProps {
  surface: 'popup' | 'panel';
}

export function App({ surface }: AppProps) {
  const { prompts, folders, loading } = useVaultData();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('recent');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState<Prompt | 'new' | null>(null);
  const [managingFolders, setManagingFolders] = useState(false);
  const [varTarget, setVarTarget] = useState<{ prompt: Prompt; action: UseAction } | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: 'ok' | 'err' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    void getSettings().then((s) => setSort(s.sort));
  }, []);

  useEffect(() => setLimit(PAGE_SIZE), [query, filter, activeTag]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (varTarget) setVarTarget(null);
      else if (editing) setEditing(null);
      else if (managingFolders) setManagingFolders(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [varTarget, editing, managingFolders]);

  const showToast = (message: string, kind: 'ok' | 'err' = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ message, kind });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const guard = async (op: () => Promise<void>, okMessage?: string) => {
    try {
      await op();
      if (okMessage) showToast(okMessage);
    } catch (err) {
      showToast(
        db.isQuotaError(err)
          ? 'Storage is full — export your vault, remove old prompts, and retry.'
          : 'Something went wrong while saving.',
        'err',
      );
    }
  };

  // ---------- derived ----------

  const folderNames = useMemo(() => new Map(folders.map((f) => [f.id, f.name])), [folders]);

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const prompt of prompts) {
      for (const tag of prompt.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [prompts]);

  const listed = useMemo(() => {
    let base = prompts;
    if (filter === 'fav') base = base.filter((p) => p.favorite);
    else if (filter !== 'all') base = base.filter((p) => p.folderId === filter);
    if (activeTag) {
      const wanted = activeTag.toLowerCase();
      base = base.filter((p) => p.tags.some((t) => t.toLowerCase() === wanted));
    }
    return query.trim() ? searchPrompts(base, query) : sortPrompts(base, sort);
  }, [prompts, filter, activeTag, query, sort]);

  const visible = listed.slice(0, limit);

  // ---------- actions ----------

  const changeSort = (mode: SortMode) => {
    setSort(mode);
    void updateSettings({ sort: mode });
  };

  const savePrompt = (draft: EditorDraft, newFolderName: string | null) =>
    guard(async () => {
      let folderId = draft.folderId;
      if (newFolderName) {
        const folder: Folder = { id: newId(), name: newFolderName, createdAt: Date.now() };
        await db.putFolder(folder);
        folderId = folder.id;
      }
      const existing = editing !== 'new' && editing ? editing : null;
      const prompt = makePrompt({
        ...(existing ?? {}),
        title: dedupeTitle(draft.title || 'Untitled prompt', prompts, existing?.id),
        body: draft.body,
        tags: draft.tags,
        folderId,
        favorite: draft.favorite,
        updatedAt: Date.now(),
      });
      await db.putPrompt(prompt);
      setEditing(null);
    }, 'Saved');

  const removePrompt = (id: string) =>
    guard(async () => {
      await db.deletePrompt(id);
      setEditing(null);
    }, 'Prompt deleted');

  const toggleFavorite = (prompt: Prompt) =>
    guard(() => db.putPrompt({ ...prompt, favorite: !prompt.favorite }));

  const bumpUsage = (prompt: Prompt) =>
    db.putPrompt({ ...prompt, usageCount: prompt.usageCount + 1 }).catch(() => {});

  const usePrompt = (prompt: Prompt, action: UseAction) => {
    if (extractVariables(prompt.body).length > 0) {
      setVarTarget({ prompt, action });
    } else {
      void executeUse(prompt, prompt.body, action);
    }
  };

  const executeUse = async (prompt: Prompt, text: string, action: UseAction) => {
    setVarTarget(null);
    if (action === 'copy') {
      if (await copyToClipboard(text)) {
        void bumpUsage(prompt);
        showToast('Copied to clipboard');
      } else {
        showToast('Could not access the clipboard.', 'err');
      }
      return;
    }
    const result = await insertIntoActiveTab(text);
    if (result === 'inserted') {
      void bumpUsage(prompt);
      showToast('Inserted ✓');
      if (surface === 'popup') setTimeout(() => window.close(), 350);
    } else if (result === 'copied') {
      void bumpUsage(prompt);
      showToast('No text box found — copied to clipboard instead.');
    } else {
      showToast('Could not insert or copy.', 'err');
    }
  };

  const exportVault = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(
      new Blob([serializeVault(prompts, folders)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt-vault-${stamp}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    showToast(`Exported ${prompts.length} prompt${prompts.length === 1 ? '' : 's'}`);
  };

  const importVault = async (file: File) => {
    try {
      const summary = await importIntoVault(await file.text(), prompts, folders);
      showToast(
        `Imported ${summary.added} prompt${summary.added === 1 ? '' : 's'}` +
          (summary.skipped ? `, skipped ${summary.skipped} duplicate${summary.skipped === 1 ? '' : 's'}` : ''),
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Import failed.', 'err');
    }
  };

  const addFolder = (name: string) =>
    guard(() => db.putFolder({ id: newId(), name, createdAt: Date.now() }));

  const renameFolder = (id: string, name: string) =>
    guard(async () => {
      const folder = folders.find((f) => f.id === id);
      if (folder) await db.putFolder({ ...folder, name });
    });

  const removeFolder = (id: string) =>
    guard(async () => {
      await db.deleteFolder(id);
      if (filter === id) setFilter('all');
    }, 'Folder deleted — its prompts were kept');

  const openSidePanel = async () => {
    try {
      const win = await chrome.windows.getCurrent();
      if (win.id !== undefined) {
        await chrome.sidePanel.open({ windowId: win.id });
        window.close();
      }
    } catch {
      showToast('Side panel is unavailable here.', 'err');
    }
  };

  const canOpenPanel =
    surface === 'popup' && typeof chrome !== 'undefined' && !!chrome.sidePanel && !!chrome.windows;

  // ---------- render ----------

  return (
    <div class="app">
      <header class="topbar">
        <div class="brand">
          <LogoIcon />
          <h1>Prompt Vault</h1>
          {!loading && <span class="count-pill">{prompts.length}</span>}
        </div>
        {canOpenPanel && (
          <button class="iconbtn" title="Open in side panel (Alt+Shift+P)" onClick={openSidePanel}>
            <PanelIcon />
          </button>
        )}
        <SettingsMenu
          sort={sort}
          promptCount={prompts.length}
          onSort={changeSort}
          onExport={exportVault}
          onImport={(file) => void importVault(file)}
          onManageFolders={() => setManagingFolders(true)}
        />
      </header>

      <div class="searchrow">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search prompts…"
          value={query}
          autofocus={surface === 'popup'}
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
      </div>

      <div class="chips">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </Chip>
        <Chip active={filter === 'fav'} onClick={() => setFilter('fav')}>
          <StarIcon filled={filter === 'fav'} /> Favorites
        </Chip>
        {folders.map((folder) => (
          <Chip
            key={folder.id}
            active={filter === folder.id}
            onClick={() => setFilter(filter === folder.id ? 'all' : folder.id)}
            title={`Folder: ${folder.name}`}
          >
            {folder.name}
          </Chip>
        ))}
      </div>

      {topTags.length > 0 && (
        <div class="chips tagrow">
          {topTags.map((tag) => (
            <Chip
              key={tag}
              small
              active={activeTag === tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              title={`Filter by #${tag}`}
            >
              #{tag}
            </Chip>
          ))}
        </div>
      )}

      <main class="list">
        {loading ? (
          <div class="empty">
            <p>Loading…</p>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            searching={prompts.length > 0}
            onNew={() => setEditing('new')}
          />
        ) : (
          <>
            {visible.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                folderName={prompt.folderId ? (folderNames.get(prompt.folderId) ?? null) : null}
                onInsert={(p) => usePrompt(p, 'insert')}
                onCopy={(p) => usePrompt(p, 'copy')}
                onEdit={(p) => setEditing(p)}
                onDelete={(id) => void removePrompt(id)}
                onToggleFav={(p) => void toggleFavorite(p)}
                onTagClick={(tag) => setActiveTag(activeTag === tag ? null : tag)}
              />
            ))}
            {listed.length > visible.length && (
              <button class="loadmore" onClick={() => setLimit(limit + PAGE_SIZE)}>
                Show more ({listed.length - visible.length} remaining)
              </button>
            )}
          </>
        )}
      </main>

      <div class="footer">
        <button class="btn-new" onClick={() => setEditing('new')}>
          <PlusIcon /> New prompt
        </button>
      </div>

      {editing && (
        <Editor
          prompt={editing === 'new' ? null : editing}
          folders={folders}
          onSave={(draft, newFolderName) => void savePrompt(draft, newFolderName)}
          onDelete={(id) => void removePrompt(id)}
          onClose={() => setEditing(null)}
        />
      )}

      {managingFolders && (
        <FoldersPanel
          folders={folders}
          prompts={prompts}
          onAdd={(name) => void addFolder(name)}
          onRename={(id, name) => void renameFolder(id, name)}
          onDelete={(id) => void removeFolder(id)}
          onClose={() => setManagingFolders(false)}
        />
      )}

      {varTarget && (
        <VariableModal
          prompt={varTarget.prompt}
          action={varTarget.action}
          onConfirm={(text) => void executeUse(varTarget.prompt, text, varTarget.action)}
          onCancel={() => setVarTarget(null)}
        />
      )}

      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </div>
  );
}
