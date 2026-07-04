# AI Prompt Vault

A lightweight Manifest V3 Chrome extension to save, organize, search, tag, favorite and
one-click-insert AI prompts into ChatGPT, Claude, Gemini, Perplexity, Copilot, DeepSeek and Grok.
Offline-first: everything lives in local IndexedDB — no accounts, no servers, no tracking.

## Features (MVP)

- **CRUD prompts** with title, body, tags, folder and favorite flag
- **Full-text search** (title / body / tags, ranked, AND semantics)
- **Folders** (create, rename, delete — deleting keeps prompts) and **tag filters**
- **Favorites** filter
- **Variables**: `{{topic}}`-style placeholders become fill-in fields on insert/copy
- **One-click insert** into the active tab, with graceful degradation:
  site-specific selectors → generic text-box detection → clipboard fallback
- **Right-click capture**: select text on any page → *Save selection to Prompt Vault*
- **Import / Export JSON** (imports are sanitized and de-duplicated)
- **Keyboard shortcuts**: `Alt+P` opens the popup, `Alt+Shift+P` opens the side panel
- **Popup + side panel** — same UI, the side panel is comfier for large libraries

## Build

```bash
npm install
npm run build     # type-checks and bundles into dist/
npm test          # unit tests (search, variables, import sanitization)
```

## Load in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions`, enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.

## Architecture

| Piece | File(s) | Notes |
| --- | --- | --- |
| Popup / side panel UI | `src/ui/*`, `src/popup`, `src/sidepanel` | Preact (~4 KB), shared `App` |
| Storage layer | `src/lib/db.ts` | IndexedDB + BroadcastChannel sync between views |
| Settings | `src/lib/settings.ts` | `chrome.storage.sync` (settings only, per spec) |
| Background worker | `src/background/service-worker.ts` | context menu, side-panel command, badge |
| Content script | `src/content/content.ts` | insert-only; never reads page content |
| Search / variables / import | `src/lib/*.ts` | pure, unit-tested |

### Memory footprint

- No framework runtime beyond Preact (~4 KB gzipped); no icon fonts or images (inline SVG).
- The service worker is event-driven and unloads when idle.
- Content script is a few KB, does nothing until it receives an insert message.
- Rendering is capped (120 cards per page with "Show more") so 10k-prompt libraries stay smooth.

### Security

- Imported JSON is fully sanitized (type-checked, length-capped, ids validated/regenerated).
- No `eval`, no remote code, default MV3 CSP.
- Least-privilege permissions; host access limited to the supported AI sites plus
  user-gesture `activeTab`.
- Message handlers validate sender and payload shape.

## Roadmap (post-MVP, per spec)

Cloud sync (Supabase), version history, AI categorization, team libraries, billing.
