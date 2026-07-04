// Content script: receives PV_INSERT messages and places text into the
// site's prompt box. Site-specific selectors come first; if a site redesign
// breaks them we degrade to generic editable-element detection, and if that
// fails too the popup falls back to the clipboard. No page content is ever
// read or sent anywhere — this script only writes.

interface SiteAdapter {
  host: RegExp;
  selectors: string[];
}

const SITES: SiteAdapter[] = [
  {
    host: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/,
    selectors: [
      '#prompt-textarea',
      'div.ProseMirror[contenteditable="true"]',
      'textarea[data-testid="prompt-textarea"]',
    ],
  },
  {
    host: /(^|\.)claude\.ai$/,
    selectors: [
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][aria-label]',
      'div[contenteditable="true"]',
    ],
  },
  {
    host: /(^|\.)gemini\.google\.com$/,
    selectors: ['div.ql-editor[contenteditable="true"]', 'rich-textarea div[contenteditable="true"]'],
  },
  {
    host: /(^|\.)perplexity\.ai$/,
    selectors: ['div[contenteditable="true"]#ask-input', 'textarea[placeholder]', 'div[contenteditable="true"]'],
  },
  {
    host: /(^|\.)copilot\.microsoft\.com$/,
    selectors: ['textarea#userInput', 'textarea[placeholder]'],
  },
  {
    host: /(^|\.)chat\.deepseek\.com$/,
    selectors: ['textarea#chat-input', 'textarea'],
  },
  {
    host: /(^|\.)grok\.com$/,
    selectors: ['textarea', 'div[contenteditable="true"]'],
  },
];

const GENERIC_SELECTORS = [
  'textarea',
  'div[contenteditable="true"]',
  '[role="textbox"]',
  'input[type="text"]',
];

function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 8 && rect.height > 8 && el.getClientRects().length > 0;
}

function isTextField(el: Element): el is HTMLTextAreaElement | HTMLInputElement {
  return (
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLInputElement && el.type === 'text')
  );
}

function isEditable(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (isTextField(el)) return !el.disabled && !el.readOnly;
  return el.isContentEditable;
}

function firstMatch(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    let elements: NodeListOf<HTMLElement>;
    try {
      elements = document.querySelectorAll<HTMLElement>(selector);
    } catch {
      continue;
    }
    for (const el of elements) {
      if (isEditable(el) && isVisible(el)) return el;
    }
  }
  return null;
}

function findTarget(): HTMLElement | null {
  const site = SITES.find((s) => s.host.test(location.hostname));
  if (site) {
    const el = firstMatch(site.selectors);
    if (el) return el;
  }
  const active = document.activeElement;
  if (isEditable(active) && isVisible(active)) return active;
  return firstMatch(GENERIC_SELECTORS);
}

function setNativeValue(el: HTMLTextAreaElement | HTMLInputElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  // React and similar frameworks track the native setter; going through it
  // plus an input event makes them register the change.
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
}

function insertIntoContentEditable(el: HTMLElement, text: string): void {
  el.focus();
  const selection = window.getSelection();
  if (selection) {
    selection.selectAllChildren(el);
    selection.collapseToEnd();
  }
  const hasContent = (el.textContent ?? '').trim().length > 0;
  const payload = hasContent ? `\n${text}` : text;
  let ok = false;
  try {
    // Editors like ProseMirror and Quill all honor insertText.
    ok = document.execCommand('insertText', false, payload);
  } catch {
    ok = false;
  }
  if (!ok) {
    el.textContent = (el.textContent ?? '') + payload;
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: payload }),
    );
  }
}

function insertText(text: string): boolean {
  const target = findTarget();
  if (!target) return false;
  try {
    if (isTextField(target)) {
      const existing = target.value;
      setNativeValue(target, existing ? `${existing}\n${text}` : text);
      target.focus();
      target.setSelectionRange(target.value.length, target.value.length);
    } else {
      insertIntoContentEditable(target, text);
    }
    return true;
  } catch {
    return false;
  }
}

// This file has no imports, so it compiles as a global script and this
// interface merges straight into the global Window type.
interface Window {
  __pvContentLoaded?: boolean;
}

// Guard against double injection (declared in manifest + injected on demand).
if (!window.__pvContentLoaded) {
  window.__pvContentLoaded = true;
  chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id) return;
    if (!message || typeof message !== 'object') return;
    const msg = message as { type?: unknown; text?: unknown };
    if (msg.type === 'PV_PING') {
      sendResponse({ ok: true });
    } else if (msg.type === 'PV_INSERT' && typeof msg.text === 'string') {
      sendResponse({ ok: insertText(msg.text) });
    }
  });
}
