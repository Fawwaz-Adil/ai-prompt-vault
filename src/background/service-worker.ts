// Background service worker: context-menu capture, side panel command,
// and action badge feedback. Stays dormant otherwise — the popup and side
// panel talk to IndexedDB directly, so the worker adds no idle memory.
import { saveSelectionAsPrompt } from '../lib/vault';

const MENU_SAVE_SELECTION = 'pv-save-selection';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_SAVE_SELECTION,
      title: 'Save selection to Prompt Vault',
      contexts: ['selection'],
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_SAVE_SELECTION || !info.selectionText) return;
  try {
    await saveSelectionAsPrompt(info.selectionText);
    flashBadge('✓');
  } catch {
    flashBadge('!');
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'open-side-panel' && tab?.windowId !== undefined) {
    void chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

function flashBadge(text: string): void {
  void chrome.action.setBadgeBackgroundColor({ color: '#128C7E' });
  void chrome.action.setBadgeText({ text });
  setTimeout(() => void chrome.action.setBadgeText({ text: '' }), 1500);
}
