// One-click insertion into the active tab. Strategy:
// 1. message the content script (already present on supported AI sites);
// 2. if unreachable, inject it on demand (activeTab grants access on any
//    normal page after the user opens the popup);
// 3. if the page still can't take it (chrome:// pages, no text box found),
//    fall back to copying so the user is never stuck.
export type InsertResult = 'inserted' | 'copied' | 'failed';

async function sendInsert(tabId: number, text: string): Promise<boolean> {
  const message = { type: 'PV_INSERT', text } as const;
  try {
    const res = await chrome.tabs.sendMessage(tabId, message);
    return res?.ok === true;
  } catch {
    // No content script in this tab yet — inject and retry once.
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      const res = await chrome.tabs.sendMessage(tabId, message);
      return res?.ok === true;
    } catch {
      return false;
    }
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function insertIntoActiveTab(text: string): Promise<InsertResult> {
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id != null && tab.url && /^https?:/i.test(tab.url)) {
        if (await sendInsert(tab.id, text)) return 'inserted';
      }
    }
  } catch {
    // Fall through to clipboard.
  }
  return (await copyToClipboard(text)) ? 'copied' : 'failed';
}
