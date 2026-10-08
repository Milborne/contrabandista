import { describe, expect, it } from "vitest";
import { isPageInfoMessage } from "../src/shared/page-info";
describe("mensaje de la página", () => {
 it("acepta título y URL como texto", () => { expect(isPageInfoMessage({ type: "PAGE_INFO", page: { title: "Prueba", url: "http://localhost/" } })).toBe(true); });
 it("rechaza mensajes con forma inesperada", () => { expect(isPageInfoMessage({ type: "PAGE_INFO", page: { title: 3, url: "x" } })).toBe(false); });
});
