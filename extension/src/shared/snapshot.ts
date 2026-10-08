export interface SnapshotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CheckboxSnapshot {
  id: string;
  label: string;
  checked: boolean;
  selector: string;
  rect: SnapshotRect;
  visible: boolean;
}

export interface Snapshot {
  version: 0;
  url: string;
  timestamp: number;
  checkboxes: CheckboxSnapshot[];
}

const MAX_SNAPSHOT_NODES = 5_000;

function cssEscape(value: string, document: Document): string {
  const escape = document.defaultView?.CSS?.escape;
  return escape ? escape(value) : value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~ ])/g, "\\$1");
}

function uniqueSelector(element: Element, document: Document): string {
  if (element.id) {
    const idSelector = `#${cssEscape(element.id, document)}`;
    if (idSelector.length <= 2_000 && document.querySelectorAll(idSelector).length === 1) return idSelector;
  }

  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.documentElement) {
    const tag = current.localName;
    const siblings = current.parentElement
      ? Array.from(current.parentElement.children).filter((sibling) => sibling.localName === tag)
      : [];
    const position = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${position})`);
    const selector = parts.join(" > ");
    if (document.querySelectorAll(selector).length === 1) return selector;
    current = current.parentElement;
  }
  return parts.join(" > ");
}

function associatedLabel(input: HTMLInputElement): string {
  const ariaLabel = input.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel.replace(/\s+/g, " ").slice(0, 1_000);
  return Array.from(input.labels ?? [])
    .map((label) => label.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1_000);
}

function isVisible(input: HTMLInputElement, document: Document, rect: DOMRect): boolean {
  for (let ancestor: Element | null = input; ancestor; ancestor = ancestor.parentElement) {
    const style = document.defaultView?.getComputedStyle(ancestor);
    if (ancestor.hasAttribute("hidden") || style?.display === "none" || style?.visibility === "hidden" || style?.visibility === "collapse") return false;
    if (style && Number.parseFloat(style.opacity) === 0) return false;
  }
  return rect.width > 0 && rect.height > 0;
}

/** Builds a bounded, side-effect-free snapshot; pass `timestamp` to make it deterministic in tests. */
export function buildSnapshot(document: Document, timestamp = Date.now()): Snapshot {
  const checkboxes: CheckboxSnapshot[] = [];
  const root = document.body ?? document.documentElement;
  const walker = document.createTreeWalker(root, document.defaultView?.NodeFilter.SHOW_ELEMENT ?? 1);
  let visited = 0;
  let node = walker.nextNode();

  while (node && visited < MAX_SNAPSHOT_NODES) {
    visited += 1;
    if (node instanceof (document.defaultView?.HTMLInputElement ?? HTMLInputElement)) {
      const input = node as HTMLInputElement;
      if (input.type.toLowerCase() === "checkbox") {
        const rect = input.getBoundingClientRect();
        const selector = uniqueSelector(input, document);
        checkboxes.push({
          id: `checkbox:${selector}`,
          label: associatedLabel(input),
          checked: input.checked,
          selector,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          visible: isVisible(input, document, rect),
        });
      }
    }
    node = walker.nextNode();
  }

  return { version: 0, url: document.location?.href ?? "", timestamp, checkboxes };
}
