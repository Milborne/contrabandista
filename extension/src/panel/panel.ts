const info = document.querySelector<HTMLParagraphElement>("#page-info");
async function showActivePage(): Promise<void> {
 if (!info) return;
 const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
 const requestedTabId = new URLSearchParams(window.location.search).get("tabId");
  const tabId = requestedTabId ? Number(requestedTabId) : tabs[0]?.id;
 if (tabId === undefined) { info.textContent = "No hay una pestaña activa."; return; }
 const key = "page-info-" + tabId;
 const stored = await chrome.storage.session.get(key);
 const page = stored[key] as { title: string; url: string } | undefined;
 info.textContent = page ? page.title + " — " + page.url : "Esperando información de la pestaña…";
}
void showActivePage();
chrome.storage.onChanged.addListener(() => { void showActivePage(); });
