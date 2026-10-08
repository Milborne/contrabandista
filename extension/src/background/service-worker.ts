import { isPageInfoMessage } from "../shared/page-info";

chrome.runtime.onInstalled.addListener(() => { void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }); });
chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
 if (!isPageInfoMessage(message) || sender.tab?.id === undefined) return;
 const tabId = sender.tab.id;
 void chrome.storage.session.set({ ["page-info-" + tabId]: message.page }).then(() => sendResponse({ ok: true }));
 return true;
});
