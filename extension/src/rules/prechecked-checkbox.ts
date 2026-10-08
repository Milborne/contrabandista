import type { Snapshot } from "../shared/snapshot";
import type { Finding, Rule } from "./types";

export const PRECHECKED_CHECKBOX_RULE_ID = "prechecked-checkbox";
const DIRECT_SIGNALS = /\b(suscrib\w*|bolet[ií]n|newsletter|mailing\s+list|e-?mail\s+updates?|promociones?|ofertas?|promotional|marketing|publicidad|seguro|insurance|protecci[oó]n|protection|extras?|complementos?|add-?ons?|cobertura|coverage|renovaci[oó]n|renewal)\b/i;
const AMBIGUOUS_SIGNALS = /\b(actualizaciones|updates|recomendaciones|recommendations)\b/i;

function confidenceFor(label: string): number {
  if (DIRECT_SIGNALS.test(label)) return 0.92;
  if (AMBIGUOUS_SIGNALS.test(label)) return 0.55;
  return 0;
}

export const precheckedCheckboxRule: Rule = {
  id: PRECHECKED_CHECKBOX_RULE_ID,
  evaluate(snapshot: Snapshot): Finding[] {
    return snapshot.checkboxes.flatMap((checkbox): Finding[] => {
      const confidence = confidenceFor(checkbox.label);
      if (!checkbox.checked || !checkbox.visible || confidence === 0) return [];
      return [{
        pattern: "Casilla premarcada",
        selector: checkbox.selector,
        evidence: checkbox.label,
        rule: PRECHECKED_CHECKBOX_RULE_ID,
        reason: "La casilla está marcada por defecto y su etiqueta sugiere suscripción, marketing, seguro o un extra opcional.",
        confidence,
        status: confidence < 0.6 ? "possible" : "detected",
      }];
    });
  },
};

export function evaluateRules(snapshot: Snapshot): Finding[] {
  return [precheckedCheckboxRule].flatMap((rule) => rule.evaluate(snapshot));
}
