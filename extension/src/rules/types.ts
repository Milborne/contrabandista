import type { Snapshot } from "../shared/snapshot";

export interface Finding {
  pattern: string;
  selector: string;
  evidence: string;
  rule: string;
  reason: string;
  confidence: number;
  status: "possible" | "detected";
}

export interface Rule {
  id: string;
  evaluate(snapshot: Snapshot): Finding[];
}
