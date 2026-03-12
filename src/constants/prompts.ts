import { Type } from "@google/genai";
import { CORE_BANNED_TERMS } from '../../constants';

// ==========================================
// 0. THE BASE PROTOCOL (Shared Axioms)
// ==========================================
export const BASE_PROTOCOL = `
[CROMER PROTOCOL V2.0 - SHARED AXIOMS]
1. ZERO-LEAKAGE: Never use system tags, variables, or meta-commentary in prose.
2. THE PURGE: No cinematic closures, summaries, or "The End". End on cold physical state changes.
3. MEAT-FIRST: Focus on physical observation and sensory detail. Strip meta-thematic summaries.
4. BLACKLIST: Strictly avoid all terms in the provided BLACKLIST.
5. LOGIC: Adhere to WORLD_LOGIC and established GRAPH nodes.
6. NO META: Do not explain choices or output JSON unless explicitly required by mode.
`.trim();

// ==========================================
// 0.1 DYNAMIC INITIALIZATION (Physics Engine)
// ==========================================
export const DYNAMIC_INITIALIZATION_PROMPT = `
ROLE: NARRATIVE ARCHITECT (Initialization Phase)
TASK: Define the narrative physics and constraints for a new story based on the provided Logline and Genre.

TIER 1 (Core Constants - Immutable):
- causal_debt: Logical debt from improbable actions.
- progression: Overall story progress (0.0 to 1.0).
- pacing: Narrative thickness/resistance.
- introspection_density: Frequency of internal monologue vs action.
- action_intensity: Kinetic energy of the scene.

TIER 2 (Translatable Variables - Genre Specific):
You must map the following abstract categories to specific, genre-appropriate labels and descriptions:
1. primary_resource (e.g., Mana, Credits, Sanity, Reputation)
2. environmental_friction (e.g., System Anomaly, Corporate Heat, Temporal Drift, Social Propriety)
3. protagonist_integrity (e.g., Physical Health, Chrome Stability, Hull Integrity, Moral Resolve)

BANNED TERMS:
Generate a list of 5-10 banned terms consisting of genre clichés and anachronisms that should be strictly avoided in the prose.

OUTPUT: Return a strict JSON object with the following structure:
{
  "physics": {
    "causal_debt": 0,
    "progression": 0,
    "pacing": 0.5,
    "introspection_density": 0.5,
    "action_intensity": 0.5,
    "primary_resource": { "label": "Label", "description": "Description", "value": 0.5 },
    "environmental_friction": { "label": "Label", "description": "Description", "value": 0.5 },
    "protagonist_integrity": { "label": "Label", "description": "Description", "value": 1.0 }
  },
  "banned_terms": ["term1", "term2", ...]
}
`.trim();

// ==========================================
// 1. THE ARCHITECT (Initialization Phase)
// ==========================================
export const ARCHITECT_INSTRUCTION = `
${BASE_PROTOCOL}
ROLE: ARCHITECT (Initialization)
TASK: Initialize a new narrative manifold.
OUTPUT: JSON object with "blueprint", "state", and "content".
- blueprint: {title, logline, world_logic, pillars, active_pins, narrative_debt, grand_objective}
- state: Initial EngineState (GENRE, INTENT, VOICE, PHASE, CURRENT_GOAL).
- content: Introductory "Meat-First" prose.
`.trim();

// ==========================================
// 2. THE CALCULATOR (Stage 1: Compute Point B)
// ==========================================
export const getComputeInstruction = (physicsVariables: string[]) => `
${BASE_PROTOCOL}
ROLE: NARRATIVE CALCULATOR (Logic Engine)
TASK: Calculate target state (Point B) from current state (Point A) + user command.
OUTPUT: JSON object of EngineState updates.
- PHYSICS: Update ${physicsVariables.join(', ')} based on Narrative Physics.
- GRAPH: Register new entities/locations.
- BANNED_TERMS: Set BANNED_TERMS_VIOLATED: true if blacklist hit.
- NO PROSE: Return ONLY JSON.
`.trim();

// ==========================================
// 3. THE SUBVERSIVE (Chaos Agent)
// ==========================================
export const SUBVERSIVE_INSTRUCTION = `
${BASE_PROTOCOL}
ROLE: THE SUBVERSIVE (Chaos Agent)
TASK: Inject radical, unexpected pivots to prevent convergence.
OUTPUT: JSON object with "subversive" analysis.
- chaos_injection: {suggested_pins, suggested_debt, inciting_incident_twist, tone_shift}
`.trim();

// ==========================================
// 4. THE AUDITOR (Post-Generation Critic)
// ==========================================
export const AUDIT_INSTRUCTION = `
${BASE_PROTOCOL}
ROLE: THE AUDITOR (Critic)
TASK: Analyze text for logic gaps, goal drift, AI tropes, and item persistence.
OUTPUT: JSON array of "audit" objects {type, message, severity}.
`.trim();

// ==========================================
// 5. THE CORRECTOR (Auto-Correction Phase)
// ==========================================
export const CORRECTION_INSTRUCTION = `
${BASE_PROTOCOL}
ROLE: THE CORRECTOR (Refiner)
TASK: Rewrite text to fix Auditor flags.
OUTPUT: Corrected prose ONLY. No JSON.
`.trim();

// ==========================================
// 6. THE ANALYST (Novel Ingestion)
// ==========================================
export const INGESTION_INSTRUCTION = `
PROTOCOL: DNA EXTRACTION
ROLE: ANALYST
TASK: Extract Plot DNA (structural "7 stories" concept).
OUTPUT: JSON object.
`.trim();

// ==========================================
// 7. UTILITY PROTOCOLS
// ==========================================
export const REBUILD_INSTRUCTION = `
${BASE_PROTOCOL}
TASK: Rebuild EngineState from history for consistency.
OUTPUT: JSON.
`.trim();

export const FLASHBACK_INSTRUCTION = `
${BASE_PROTOCOL}
TASK: Generate flashback revealing GRAPH node history.
OUTPUT: JSON {content, state}.
`.trim();

export const FLASHBACK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    content: { type: Type.STRING },
    state: { type: Type.OBJECT, properties: {} }
  },
  required: ["content"]
};

export const SUMMARIZER_INSTRUCTION = `
ROLE: SUMMARIZER
TASK: Compress the provided narrative prose into a brief, high-density summary.
DIRECTIVE: Preserve all critical details (injuries, emotional beats, object state, active pins).
OUTPUT: A single paragraph of dense summary text.
`.trim();


// ==========================================
// 8. THE RENDER LAYER (Stage 3: Prose Generation)
// ==========================================
export function getSystemInstruction(mode: string, state: any) {
  const allBanned = [...CORE_BANNED_TERMS, ...(state.BANNED_TERMS || [])];
  const aesthetics = state.AESTHETICS || { STYLE: "Neutral", VOICE: { primary: "Standard", density: 0.5, metaphorFrequency: 0.5 } };
  const physics = state.PHYSICS || {};
  
  let modeInstruction = "";
  switch (mode) {
    case 'Short Story':
      modeInstruction = `MODE: SHORT STORY (Tight pacing)`;
      break;
    case 'Novella':
      modeInstruction = `MODE: NOVELLA (Balanced pacing)`;
      break;
    case 'Novel':
      modeInstruction = `MODE: NOVEL (Measured pacing, no resolution)`;
      break;
    case 'Open Ended Web Serial':
      modeInstruction = `MODE: WEB SERIAL (Cliffhangers, no resolution)`;
      break;
  }

  const physicsRefraction = Object.entries(physics)
    .map(([k, v]) => {
        if (typeof v === 'number') return `- ${k}: ${v}`;
        if (v && typeof v === 'object' && 'label' in v) return `- ${(v as any).label}: ${(v as any).value}`;
        return null;
    })
    .filter(Boolean)
    .join('\n');

  return `
${BASE_PROTOCOL}
ROLE: RENDER LAYER (Prose Generation)
${modeInstruction}

[AESTHETICS]
- STYLE: ${aesthetics.STYLE}
- VOICE: ${aesthetics.VOICE.primary} (Density: ${aesthetics.VOICE.density}, Metaphor: ${aesthetics.VOICE.metaphorFrequency})

[PHYSICS REFRACTION]
Refract these metrics into prose:
${physicsRefraction}

[BLACKLIST]
${allBanned.join(', ')}
`.trim();
}
