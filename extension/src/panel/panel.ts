const info = document.querySelector<HTMLParagraphElement>("#page-info");
async function showActivePage(): Promise<void> {
 if (!info) return;
 const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
 const requestedTabId = new URLSearchParams(window.location.search).get("tabId");
  const tabId = requestedTabId ? Number(requestedTabId) : tabs[0]?.id;
 if (tabId === undefined) { info.textContent = "No hay una pestaña activa."; return; }
 const key = "page-info-" + tabId;
 const stored = await chrome.storage.session.get(key);
 let page = stored[key] as { title: string; url: string } | undefined;
 // activeTab grants temporary access after the user opens this panel from the toolbar.
 // This fallback reads only title and URL; it does not inspect page content.
 if (!page && !requestedTabId) {
  try {
   const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({ title: document.title, url: window.location.href }),
   });
   page = result?.result as { title: string; url: string } | undefined;
  } catch {
   info.textContent = "No se pudo leer esta pestaña. Ábrela con el botón de la extensión.";
   return;
  }
 }
 info.textContent = page ? page.title + " — " + page.url : "La pestaña aún no ha enviado información.";
}
void showActivePage();
chrome.storage.onChanged.addListener(() => { void showActivePage(); });
