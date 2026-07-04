import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { Prompt } from '../lib/types';
import { snippet } from '../lib/model';
import { extractVariables } from '../lib/variables';
import { CopyIcon, FolderIcon, LogoIcon, PencilIcon, SendIcon, StarIcon, TrashIcon } from './icons';

export function Chip(props: {
  active?: boolean;
  onClick: () => void;
  children: ComponentChildren;
  small?: boolean;
  title?: string;
}) {
  return (
    <button
      class={`chip ${props.active ? 'active' : ''} ${props.small ? 'small' : ''}`}
      onClick={props.onClick}
      title={props.title}
    >
      {props.children}
    </button>
  );
}

export function Toast({ message, kind }: { message: string; kind: 'ok' | 'err' }) {
  return <div class={`toast ${kind === 'err' ? 'err' : ''}`}>{message}</div>;
}

export function EmptyState({ searching, onNew }: { searching: boolean; onNew: () => void }) {
  if (searching) {
    return (
      <div class="empty">
        <h2>No prompts match</h2>
        <p>Try a different search, or clear the active filters.</p>
      </div>
    );
  }
  return (
    <div class="empty">
      <LogoIcon class="logo" />
      <h2>Your vault is empty</h2>
      <p>
        Save your first prompt with the button below — or select text on any page, right-click, and
        choose <b>“Save selection to Prompt Vault”</b>.
      </p>
      <button class="btn-primary" onClick={onNew}>
        Create a prompt
      </button>
    </div>
  );
}

interface PromptCardProps {
  prompt: Prompt;
  folderName: string | null;
  onInsert: (p: Prompt) => void;
  onCopy: (p: Prompt) => void;
  onEdit: (p: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleFav: (p: Prompt) => void;
  onTagClick: (tag: string) => void;
}

export function PromptCard(props: PromptCardProps) {
  const { prompt } = props;
  const [confirming, setConfirming] = useState(false);
  const variables = extractVariables(prompt.body);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 2500);
    return () => clearTimeout(timer);
  }, [confirming]);

  return (
    <article class="card">
      <div class="card-head">
        <button
          class={`star ${prompt.favorite ? 'on' : ''}`}
          title={prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => props.onToggleFav(prompt)}
        >
          <StarIcon filled={prompt.favorite} />
        </button>
        <h3 class="card-title" title={prompt.title} onClick={() => props.onEdit(prompt)}>
          {prompt.title}
        </h3>
        {props.folderName && (
          <span class="card-folder" title={`Folder: ${props.folderName}`}>
            <FolderIcon />
            {props.folderName}
          </span>
        )}
      </div>
      <p class="card-snippet" onClick={() => props.onEdit(prompt)}>
        {snippet(prompt.body)}
      </p>
      <div class="card-foot">
        <div class="card-tags">
          {variables.length > 0 && (
            <span class="tag var" title={`Variables: ${variables.join(', ')}`}>
              {'{{ }}'} {variables.length}
            </span>
          )}
          {prompt.tags.map((tag) => (
            <button key={tag} class="tag" title={`Filter by #${tag}`} onClick={() => props.onTagClick(tag)}>
              {tag}
            </button>
          ))}
        </div>
        <div class="card-actions">
          <button class="iconbtn" title="Copy to clipboard" onClick={() => props.onCopy(prompt)}>
            <CopyIcon />
          </button>
          <button class="iconbtn" title="Edit" onClick={() => props.onEdit(prompt)}>
            <PencilIcon />
          </button>
          <button
            class={`iconbtn danger ${confirming ? 'confirming' : ''}`}
            title={confirming ? 'Click again to delete' : 'Delete'}
            onClick={() => (confirming ? props.onDelete(prompt.id) : setConfirming(true))}
          >
            <TrashIcon />
          </button>
          <button class="btn-insert" title="Insert into the active tab" onClick={() => props.onInsert(prompt)}>
            <SendIcon /> Insert
          </button>
        </div>
      </div>
    </article>
  );
}
