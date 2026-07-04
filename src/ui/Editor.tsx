import { useState } from 'preact/hooks';
import type { Folder, Prompt } from '../lib/types';
import { parseTags } from '../lib/model';
import { extractVariables } from '../lib/variables';
import { BackIcon, StarIcon } from './icons';

export interface EditorDraft {
  title: string;
  body: string;
  tags: string[];
  folderId: string | null;
  favorite: boolean;
}

interface EditorProps {
  prompt: Prompt | null;
  folders: Folder[];
  onSave: (draft: EditorDraft, newFolderName: string | null) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const NEW_FOLDER = '__new__';

export function Editor({ prompt, folders, onSave, onDelete, onClose }: EditorProps) {
  const [title, setTitle] = useState(prompt?.title ?? '');
  const [body, setBody] = useState(prompt?.body ?? '');
  const [tagsRaw, setTagsRaw] = useState(prompt?.tags.join(', ') ?? '');
  const [folderId, setFolderId] = useState(prompt?.folderId ?? '');
  const [favorite, setFavorite] = useState(prompt?.favorite ?? false);
  const [newFolder, setNewFolder] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const variables = extractVariables(body);
  const canSave = body.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onSave(
      {
        title: title.trim(),
        body,
        tags: parseTags(tagsRaw),
        folderId: folderId === '' || folderId === NEW_FOLDER ? null : folderId,
        favorite,
      },
      folderId === NEW_FOLDER ? newFolder.trim() || null : null,
    );
  };

  return (
    <div class="overlay">
      <header class="overlay-head">
        <button class="iconbtn" title="Back" onClick={onClose}>
          <BackIcon />
        </button>
        <h2>{prompt ? 'Edit prompt' : 'New prompt'}</h2>
        <button class="btn-primary" disabled={!canSave} onClick={submit}>
          Save
        </button>
      </header>
      <div class="overlay-body">
        <label class="field">
          <span>Title</span>
          <input
            value={title}
            maxLength={200}
            placeholder="e.g. Blog outline generator"
            onInput={(e) => setTitle(e.currentTarget.value)}
          />
        </label>
        <label class="field grow">
          <span>Prompt</span>
          <textarea
            value={body}
            placeholder={'Write your prompt…\n\nUse {{topic}} style placeholders to fill in values on insert.'}
            onInput={(e) => setBody(e.currentTarget.value)}
          />
        </label>
        <div class="varhint">
          {variables.length > 0 ? (
            <>
              Variables detected:{' '}
              {variables.map((v) => (
                <code key={v}>{v}</code>
              ))}
            </>
          ) : (
            <>
              Tip: add placeholders like <code>{'{{topic}}'}</code> — they become fill-in fields when you
              insert the prompt.
            </>
          )}
        </div>
        <label class="field">
          <span>Tags</span>
          <input
            value={tagsRaw}
            placeholder="comma, separated, tags"
            onInput={(e) => setTagsRaw(e.currentTarget.value)}
          />
        </label>
        <label class="field">
          <span>Folder</span>
          <select value={folderId} onChange={(e) => setFolderId(e.currentTarget.value)}>
            <option value="">No folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
            <option value={NEW_FOLDER}>＋ New folder…</option>
          </select>
        </label>
        {folderId === NEW_FOLDER && (
          <label class="field">
            <span>New folder name</span>
            <input
              value={newFolder}
              maxLength={60}
              placeholder="e.g. Writing"
              onInput={(e) => setNewFolder(e.currentTarget.value)}
            />
          </label>
        )}
        <label class="favrow">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.currentTarget.checked)}
          />
          <span class={`star ${favorite ? 'on' : ''}`}>
            <StarIcon filled={favorite} />
          </span>
          Favorite
        </label>
        {prompt && (
          <button
            class={`btn-danger ${confirmDelete ? 'confirming' : ''}`}
            onClick={() => (confirmDelete ? onDelete(prompt.id) : setConfirmDelete(true))}
          >
            {confirmDelete ? 'Click again to delete permanently' : 'Delete prompt'}
          </button>
        )}
      </div>
    </div>
  );
}
