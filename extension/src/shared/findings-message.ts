import type { Finding } from "../rules/types";

export interface FindingsMessage {
  type: "FINDINGS_UPDATED";
  findings: Finding[];
}

export interface HighlightMessage {
  type: "HIGHLIGHT_FINDING";
  selector: string;
}

export function isFindingsMessage(value: unknown): value is FindingsMessage {
  if (typeof value !== "object" || value === null || !("type" in value) || !("findings" in value)) return false;
  const candidate = value as { type?: unknown; findings?: unknown };
  if (candidate.type !== "FINDINGS_UPDATED" || !Array.isArray(candidate.findings)) return false;
  return candidate.findings.every((item: unknown) => {
    if (typeof item !== "object" || item === null) return false;
    const finding = item as Record<string, unknown>;
    return typeof finding.pattern === "string" && finding.pattern.length <= 200
      && typeof finding.selector === "string" && finding.selector.length <= 2_000
      && typeof finding.evidence === "string" && finding.evidence.length <= 1_000
      && typeof finding.rule === "string" && finding.rule.length <= 200
      && typeof finding.reason === "string" && finding.reason.length <= 1_000
      && typeof finding.confidence === "number" && Number.isFinite(finding.confidence)
      && finding.confidence >= 0 && finding.confidence <= 1
      && (finding.status === "possible" || finding.status === "detected");
  });
}

export function isHighlightMessage(value: unknown): value is HighlightMessage {
  if (typeof value !== "object" || value === null || !("type" in value) || !("selector" in value)) return false;
  const candidate = value as { type?: unknown; selector?: unknown };
  return candidate.type === "HIGHLIGHT_FINDING" && typeof candidate.selector === "string" && candidate.selector.length < 2_000;
}
