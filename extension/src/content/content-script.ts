import { buildSnapshot } from "../shared/snapshot";
import { isHighlightMessage } from "../shared/findings-message";
import { evaluateRules } from "../rules/prechecked-checkbox";

const DEBOUNCE_MS = 180;
let debounceTimer: number | undefined;

function analyzeAndSend(): void {
  const findings = evaluateRules(buildSnapshot(document));
  void chrome.runtime.sendMessage({ type: "FINDINGS_UPDATED", findings }).catch(() => {
    // The service worker can be asleep or the extension may have been reloaded.
  });
}

function highlight(selector: string): boolean {
  try {
    const matches = document.querySelectorAll(selector);
    if (matches.length !== 1) return false;
    const element = matches[0] as HTMLElement;
    const animation = element.animate(
      [
        { outline: "3px solid #d71920", outlineOffset: "2px" },
        { outline: "3px solid #d71920", outlineOffset: "2px" },
      ],
      { duration: 2_500, fill: "forwards" },
    );
    window.setTimeout(() => animation.cancel(), 2_500);
    return true;
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isHighlightMessage(message)) return;
  sendResponse({ ok: highlight(message.selector) });
});

analyzeAndSend();

const observer = new MutationObserver(() => {
  if (debounceTimer !== undefined) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(analyzeAndSend, DEBOUNCE_MS);
});
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["checked", "class", "hidden", "aria-label", "style"] });
