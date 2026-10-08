import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { buildSnapshot } from "../src/shared/snapshot";
import { precheckedCheckboxRule } from "../src/rules/prechecked-checkbox";

function fixtureSnapshot(filename: string) {
  const html = readFileSync(resolve(process.cwd(), "fixtures", filename), "utf8");
  const document = new JSDOM(html, { url: "http://localhost/" }).window.document;
  for (const input of Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))) {
    Object.defineProperty(input, "getBoundingClientRect", {
      value: () => ({ x: 0, y: 0, width: 13, height: 13 }),
    });
  }
  return buildSnapshot(document, 1_700_000_000_000);
}

describe("regla de casillas premarcadas", () => {
  it("detecta suscripción/seguro en la fixture etiquetada", () => {
    const findings = precheckedCheckboxRule.evaluate(fixtureSnapshot("prechecked-basic.html"));
    expect(findings).toHaveLength(2);
    expect(findings.map((finding) => finding.evidence)).toEqual([
      "Quiero recibir el boletín y ofertas por correo",
      "Añadir seguro de envío",
    ]);
    expect(findings.every((finding) => finding.confidence >= 0.6 && finding.status === "detected")).toBe(true);
    expect(findings[0]?.selector).toBe("#newsletter");
  });

  it("no encuentra patrones en la fixture limpia", () => {
    expect(precheckedCheckboxRule.evaluate(fixtureSnapshot("clean-form.html"))).toHaveLength(0);
  });

  it("marca señales ambiguas con confianza baja como posibles", () => {
    const snapshot = fixtureSnapshot("clean-form.html");
    snapshot.checkboxes[0]!.label = "Recibir actualizaciones";
    snapshot.checkboxes[0]!.checked = true;
    expect(precheckedCheckboxRule.evaluate(snapshot)[0]).toMatchObject({ confidence: 0.55, status: "possible" });
  });
});
