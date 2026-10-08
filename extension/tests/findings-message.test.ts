import { describe, expect, it } from "vitest";
import { isFindingsMessage, isHighlightMessage } from "../src/shared/findings-message";

const finding = {
  pattern: "Casilla premarcada",
  selector: "#newsletter",
  evidence: "Recibir el boletín",
  rule: "prechecked-checkbox",
  reason: "La casilla marcada sugiere una suscripción.",
  confidence: 0.92,
  status: "detected",
};

describe("mensajes de hallazgos", () => {
  it("acepta hallazgos con estructura y confianza válida", () => {
    expect(isFindingsMessage({ type: "FINDINGS_UPDATED", findings: [finding] })).toBe(true);
  });

  it("rechaza datos malformados y selectores demasiado largos", () => {
    expect(isFindingsMessage({ type: "FINDINGS_UPDATED", findings: [{ ...finding, confidence: 1.5 }] })).toBe(false);
    expect(isHighlightMessage({ type: "HIGHLIGHT_FINDING", selector: "x".repeat(2_000) })).toBe(false);
  });
});
