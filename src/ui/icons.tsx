// Inline SVG icons (stroke = currentColor) — no icon font, no image requests.
import type { JSX } from 'preact';

function Svg(props: { children: JSX.Element | JSX.Element[]; class?: string }) {
  return (
    <svg
      class={props.class}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {props.children}
    </svg>
  );
}

export const SearchIcon = () => (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
);

export const PlusIcon = () => (
  <Svg>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CopyIcon = () => (
  <Svg>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

export const PencilIcon = () => (
  <Svg>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Svg>
);

export const TrashIcon = () => (
  <Svg>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </Svg>
);

export const FolderIcon = () => (
  <Svg>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Svg>
);

export const GearIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const CloseIcon = () => (
  <Svg>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const BackIcon = () => (
  <Svg>
    <path d="M19 12H5m7-7-7 7 7 7" />
  </Svg>
);

export const SendIcon = () => (
  <Svg>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </Svg>
);

export const CheckIcon = () => (
  <Svg>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const DownloadIcon = () => (
  <Svg>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Svg>
);

export const UploadIcon = () => (
  <Svg>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </Svg>
);

export const PanelIcon = () => (
  <Svg>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M15 3v18" />
  </Svg>
);

/** Brand mark: silver plate, green vault door, silver keyhole. */
export const LogoIcon = ({ class: cls }: { class?: string }) => (
  <svg class={cls ?? 'logo'} viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="pv-silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fafcfd" />
        <stop offset="1" stop-color="#b9c1c9" />
      </linearGradient>
      <linearGradient id="pv-green" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#31d975" />
        <stop offset="1" stop-color="#0e8a6e" />
      </linearGradient>
      <linearGradient id="pv-ring" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eaeef1" />
        <stop offset="1" stop-color="#949ca4" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#pv-silver)" stroke="#8c949c" stroke-width="0.8" />
    <circle cx="12" cy="12" r="8" fill="url(#pv-ring)" />
    <circle cx="12" cy="12" r="6.7" fill="url(#pv-green)" />
    <circle cx="12" cy="10.7" r="1.9" fill="#f6f9fb" />
    <rect x="11.2" y="11.6" width="1.6" height="4.1" rx="0.8" fill="#f6f9fb" />
  </svg>
);
