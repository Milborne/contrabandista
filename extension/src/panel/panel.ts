import type { Finding } from "../rules/types";

const list = document.querySelector<HTMLUListElement>("#findings");
const emptyState = document.querySelector<HTMLParagraphElement>("#empty-state");
const pageInfo = document.querySelector<HTMLParagraphElement>("#page-info");

function requestedTabId(): number | undefined {
  const parameter = new URLSearchParams(window.location.search).get("tabId");
  if (parameter === null) return undefined;
  const id = Number(parameter);
  return Number.isInteger(id) && id >= 0 ? id : undefined;
}

async function showActiveFindings(): Promise<void> {
  if (!list || !emptyState || !pageInfo) return;
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tabId = requestedTabId() ?? tabs[0]?.id;
  if (tabId === undefined) {
    pageInfo.textContent = "No hay una pestaña activa.";
    emptyState.textContent = "No hay hallazgos para mostrar.";
    return;
  }

  const tab = await chrome.tabs.get(tabId);
  pageInfo.textContent = `${tab.title ?? "Página activa"} — ${tab.url ?? "URL no disponible"}`;
  const key = `findings-${tabId}`;
  const stored = await chrome.storage.session.get(key);
  const findings = (stored[key] as Finding[] | undefined) ?? [];
  list.replaceChildren();
  if (findings.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = stored[key] === undefined ? "Analizando la página…" : "No se detectaron patrones en esta página.";
    return;
  }

  emptyState.hidden = true;
  for (const finding of findings) {
    const item = document.createElement("li");
    const heading = document.createElement("h3");
    heading.textContent = `${finding.pattern}${finding.status === "possible" ? " (posible)" : ""} · ${Math.round(finding.confidence * 100)}%`;
    const evidence = document.createElement("p");
    evidence.textContent = `Evidencia: “${finding.evidence}”`;
    const reason = document.createElement("p");
    reason.textContent = finding.reason;
    const rule = document.createElement("p");
    rule.textContent = `Regla: ${finding.rule}`;
    const highlight = document.createElement("button");
    highlight.type = "button";
    highlight.textContent = "Resaltar";
    highlight.addEventListener("click", () => {
      void chrome.tabs.sendMessage(tabId, { type: "HIGHLIGHT_FINDING", selector: finding.selector });
    });
    item.append(heading, evidence, reason, rule, highlight);
    list.append(item);
  }
}

void showActiveFindings();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "session" && (Object.keys(changes).some((key) => key.startsWith("findings-")))) {
    void showActiveFindings();
  }
});
