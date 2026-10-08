// Hito 0: solo demuestra el canal. La página se considera entrada no confiable.
void chrome.runtime.sendMessage({ type: "PAGE_INFO", page: { title: document.title, url: window.location.href } });
