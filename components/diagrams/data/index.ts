import type { DiagramSpec } from "../types";
import { dbwhisperDiagram } from "./dbwhisper";
import { tradepulseDiagram } from "./tradepulse";
import { crownwagerDiagram } from "./crownwager";
import { llmStudioDiagram } from "./llm-studio";

/** All architecture diagrams, keyed by project slug. */
export const diagrams: Record<string, DiagramSpec> = {
  dbwhisper: dbwhisperDiagram,
  tradepulse: tradepulseDiagram,
  crownwager: crownwagerDiagram,
  "llm-studio": llmStudioDiagram,
};
