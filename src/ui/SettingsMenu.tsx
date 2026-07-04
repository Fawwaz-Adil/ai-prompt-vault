import { useRef, useState } from 'preact/hooks';
import type { SortMode } from '../lib/types';
import { DownloadIcon, FolderIcon, GearIcon, UploadIcon } from './icons';

const SORT_LABELS: Record<SortMode, string> = {
  recent: 'Recent',
  alpha: 'A–Z',
  used: 'Most used',
};

interface SettingsMenuProps {
  sort: SortMode;
  promptCount: number;
  onSort: (mode: SortMode) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onManageFolders: () => void;
}

export function SettingsMenu(props: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div class="menu-wrap">
      <button class="iconbtn" title="Settings" onClick={() => setOpen(!open)}>
        <GearIcon />
      </button>
      {open && (
        <>
          <div class="menu-backdrop" onClick={() => setOpen(false)} />
          <div class="menu">
            <div class="menu-label">Sort by</div>
            <div class="menu-sort">
              {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  class={props.sort === mode ? 'active' : ''}
                  onClick={() => props.onSort(mode)}
                >
                  {SORT_LABELS[mode]}
                </button>
              ))}
            </div>
            <hr />
            <button
              class="menu-item"
              onClick={() => {
                setOpen(false);
                props.onManageFolders();
              }}
            >
              <FolderIcon /> Manage folders
            </button>
            <button
              class="menu-item"
              onClick={() => {
                setOpen(false);
                props.onExport();
              }}
            >
              <DownloadIcon /> Export JSON
            </button>
            <button class="menu-item" onClick={() => fileRef.current?.click()}>
              <UploadIcon /> Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  setOpen(false);
                  props.onImport(file);
                }
                e.currentTarget.value = '';
              }}
            />
            <hr />
            <div class="menu-foot">
              {props.promptCount} prompt{props.promptCount === 1 ? '' : 's'} · stored locally · v0.1.0
            </div>
          </div>
        </>
      )}
    </div>
  );
}
