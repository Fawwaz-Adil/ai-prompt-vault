import { useMemo, useState } from 'preact/hooks';
import type { Folder, Prompt } from '../lib/types';
import { BackIcon, CheckIcon, CloseIcon, FolderIcon, PencilIcon, TrashIcon } from './icons';

interface FoldersPanelProps {
  folders: Folder[];
  prompts: Prompt[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function FoldersPanel(props: FoldersPanelProps) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const prompt of props.prompts) {
      if (prompt.folderId) map.set(prompt.folderId, (map.get(prompt.folderId) ?? 0) + 1);
    }
    return map;
  }, [props.prompts]);

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    props.onAdd(trimmed);
    setName('');
  };

  const saveRename = (id: string) => {
    const trimmed = editName.trim();
    if (trimmed) props.onRename(id, trimmed);
    setEditingId(null);
  };

  return (
    <div class="overlay">
      <header class="overlay-head">
        <button class="iconbtn" title="Back" onClick={props.onClose}>
          <BackIcon />
        </button>
        <h2>Folders</h2>
        <span />
      </header>
      <div class="overlay-body">
        <div class="folder-add">
          <input
            value={name}
            maxLength={60}
            placeholder="New folder name"
            onInput={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
            }}
          />
          <button class="btn-primary" disabled={!name.trim()} onClick={add}>
            Add
          </button>
        </div>
        {props.folders.length === 0 && (
          <p class="hint">No folders yet — folders group related prompts (e.g. Writing, Coding, Email).</p>
        )}
        <ul class="folder-list">
          {props.folders.map((folder) => (
            <li key={folder.id}>
              {editingId === folder.id ? (
                <>
                  <input
                    class="folder-rename"
                    value={editName}
                    maxLength={60}
                    autofocus
                    onInput={(e) => setEditName(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(folder.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button class="iconbtn" title="Save name" onClick={() => saveRename(folder.id)}>
                    <CheckIcon />
                  </button>
                  <button class="iconbtn" title="Cancel" onClick={() => setEditingId(null)}>
                    <CloseIcon />
                  </button>
                </>
              ) : (
                <>
                  <span class="folder-glyph">
                    <FolderIcon />
                  </span>
                  <span class="folder-name" title={folder.name}>
                    {folder.name}
                  </span>
                  <span class="folder-count">{counts.get(folder.id) ?? 0}</span>
                  <button
                    class="iconbtn"
                    title="Rename"
                    onClick={() => {
                      setEditingId(folder.id);
                      setEditName(folder.name);
                    }}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    class={`iconbtn danger ${confirmId === folder.id ? 'confirming' : ''}`}
                    title={confirmId === folder.id ? 'Click again to delete' : 'Delete folder'}
                    onClick={() =>
                      confirmId === folder.id ? props.onDelete(folder.id) : setConfirmId(folder.id)
                    }
                  >
                    <TrashIcon />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        <p class="hint">Deleting a folder keeps its prompts — they just move to “No folder”.</p>
      </div>
    </div>
  );
}
