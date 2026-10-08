export interface PageInfo { title: string; url: string; }
export interface PageInfoMessage { type: "PAGE_INFO"; page: PageInfo; }
export function isPageInfoMessage(value: unknown): value is PageInfoMessage {
 if (typeof value !== "object" || value === null || !("type" in value) || !("page" in value)) return false;
 const candidate = value as { type?: unknown; page?: unknown };
 if (candidate.type !== "PAGE_INFO" || typeof candidate.page !== "object" || candidate.page === null) return false;
 const page = candidate.page as Record<string, unknown>;
 return typeof page.title === "string" && typeof page.url === "string";
}
