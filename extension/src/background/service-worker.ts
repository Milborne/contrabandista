import { isFindingsMessage } from "../shared/findings-message";

chrome.runtime.onInstalled.addListener(() => { void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }); });
chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
 if (isFindingsMessage(message) && sender.tab?.id !== undefined) {
  const tabId = sender.tab.id;
  void chrome.storage.session.set({ ["findings-" + tabId]: message.findings }).then(() => sendResponse({ ok: true }));
  return true;
 }
});

chrome.tabs.onRemoved.addListener((tabId) => {
 void chrome.storage.session.remove(`findings-${tabId}`);
});
