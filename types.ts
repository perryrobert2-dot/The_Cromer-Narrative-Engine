// types.ts
export interface AuditFlag {
  id: string;
  segmentId: string;
  type: 'logic' | 'pattern' | 'tone';
  message: string;
  severity: 'low' | 'high';
  timestamp: number;
}

export type GenreProfile = 'Noir/Procedural' | 'LitRPG/Progression' | 'Speculative/Sociological' | 'High-Density Action';

export interface VoiceProfile {
  primary: string; // e.g., "Hard-boiled"
  density: number; // 0.0 to 1.0 (Sparse to Ornate)
  metaphorFrequency: number; // 0.0 to 1.0
  temperature: number; // 0.0 to 1.0 (Clinical to Empathetic)
  abstractness: number; // 0.0 to 1.0 (Concrete to Surreal)
}

export interface TapestryNode {
  id: string;
  type: 'entity' | 'concept' | 'attribute' | 'item' | 'location' | 'psychological' | 'background_context';
  description: string;
  weight: number; // 0.0 to 1.0
  latent?: boolean; // If true, it's an "Accidental Chekhov" waiting to be activated
}

export interface TapestryEdge {
  source: string;
  target: string;
  relation: string;
  weight: number; // 0.0 to 1.0
  directional: boolean;
}

export interface TapestryGraph {
  nodes: TapestryNode[];
  edges: TapestryEdge[];
}

export type NarrativeIntent = 'Cozy' | 'Epic' | 'Gritty' | 'Satirical' | 'Clinical' | 'Nostalgic';

export interface CoreState {
  GRAPH: TapestryGraph;
  ACTIVE_PINS: string[];
  CURRENT_GOAL: string;
  INTENSITY: number;
}

export interface Tier2Variable {
  label: string;
  value: number;
  description: string;
}

export interface PhysicsPayload {
  // Tier 1: Core Constants (Immutable Labels)
  causal_debt: number;
  progression: number;
  pacing: number;
  introspection_density: number;
  action_intensity: number;

  // Tier 2: Translatable Variables (AI Defined)
  primary_resource: Tier2Variable;
  environmental_friction: Tier2Variable;
  protagonist_integrity: Tier2Variable;

  // Narrative Mechanics
  narrative_credit?: number;

  // Legacy / System Variables (Optional)
  viscosity?: number;
  surface_tension?: number;
  manifold_tension?: number;
  causal_debt_ledger?: number;
  audit_error?: number;
  exogenous_source?: number;
  theatrical_variance?: number;
  pov_rotation?: number;
  reserve_capacity?: number;
  resonance?: number;

  [key: string]: any;
}

export interface Aesthetics {
  STYLE: string;
  VOICE: VoiceProfile;
}

export interface AxiomDefinition {
  currency: string;           // The "Primary Resource" (e.g., Mana, Reputation)
  secondaryCurrency?: string; // The "Secondary Resource" (e.g., Money, Health, Sanity)
  friction: string;           // The "Viscosity" (e.g., Social Propriety, Gravity)
  penalty: string;            // The "Debt" (e.g., System Anomaly, Social Exile)
  recoveryRate: number;       // 0.0 to 1.0
  isTransactional: boolean;   // If true, resources pay for intensity
}

export interface FailSafeConfig {
  STALL_PROTECTION: string;
  MAX_PHASE_DURATION: number;
  LOOP_PENALTY: string;
  TRANSITION_PRIORITY: string[];
  OVERRIDE_CONDITION: string;
}

export interface EngineState extends CoreState {
  PHASE: string;
  PHASE_TICKS: number;
  GENRE: string; // Can be hybrid like "Noir + System Apocalypse"
  INTENT: NarrativeIntent;
  AESTHETICS: Aesthetics;
  PHYSICS: PhysicsPayload;
  AXIOMS?: AxiomDefinition;
  FAIL_SAFES?: FailSafeConfig;
  
  // Meta/System variables
  NARRATIVE_DEBT: string[];
  BANNED_TERMS: string[];
  BANNED_TERMS_VIOLATED?: boolean;
  GAME_LOG: Array<{ id: string; type: 'milestone' | 'chaos' | 'credit' | 'system'; message: string; timestamp: number }>;
  AUDIT_LOG: AuditFlag[];
  CRITIC_STATE?: CriticState;
  
  // World Bible
  TITLE?: string;
  LOGLINE?: string;
  WORLD_LOGIC?: string;
  PILLARS?: string[];
  GRAND_OBJECTIVE?: string;
  TICK: number; // Global narrative clock
  
  // Internal/Legacy Metrics
  SIGNIFICANCE_MAP: Record<string, number>;
  CAUSAL_DEBT_LEDGER: number;
  GENETIC_ANCHOR?: string;
  WORLD_ENTITIES?: Record<string, EntityState>;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

export interface Blueprint {
  title: string;
  logline: string;
  pillars: string[];
  world_logic: string;
  tone_style: string;
  protagonist_conflict: string;
  inciting_incident: string;
  active_pins: string[];
  narrative_debt: string[];
  grand_objective: string; // Point Z
  axioms?: AxiomDefinition;
}

export interface SubversiveAnalysis {
  dissent: string;
  chaos_injection: {
    suggested_pins: string[];
    suggested_debt: string[];
    inciting_incident_twist: string;
    tone_shift: string;
  }
}

export interface StorySegment {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 encoded image data
  summary?: string;
  thought?: string;
  state?: EngineState;
  blueprint?: Blueprint; 
  subversive?: SubversiveAnalysis;
  criticSuggestion?: CriticSuggestion;
  usage?: TokenUsage;
  timestamp: number;
}

export interface CriticSuggestion {
  lens: string;
  critique: string;
  suggestedEdit: string;
  isAccepted?: boolean;
}

export interface CriticState {
  isEnabled: boolean;
  activeLens: string;
  history: string[]; 
}

export type NarrativeMode = 'Short Story' | 'Novella' | 'Novel' | 'Open Ended Web Serial';

export type GenerationStage = 'IDLE' | 'ARCHITECT' | 'CALCULATOR' | 'SUBVERSIVE' | 'PATHMAKER' | 'AUDITOR' | 'CORRECTOR' | 'WEAVER' | 'ARCHIVIST' | 'SAVING' | 'ERROR';

export const DEFAULT_STATE: EngineState = {
  PHASE: "0 - Initialization",
  PHASE_TICKS: 0,
  GENRE: 'Generic/Adaptive',
  INTENT: 'Epic',
  AESTHETICS: {
    STYLE: "Neutral/Adaptive",
    VOICE: { primary: 'Observant', density: 0.5, metaphorFrequency: 0.5, temperature: 0.5, abstractness: 0.2 }
  },
  PHYSICS: {
    causal_debt: 0,
    progression: 0,
    pacing: 0.5,
    introspection_density: 0.5,
    action_intensity: 0.5,
    primary_resource: { label: 'Resource', value: 0.5, description: 'Primary narrative energy' },
    environmental_friction: { label: 'Friction', value: 0.5, description: 'World resistance' },
    protagonist_integrity: { label: 'Integrity', value: 1.0, description: 'Protagonist stability' },
    narrative_credit: 3
  },
  FAIL_SAFES: {
    STALL_PROTECTION: "Active",
    MAX_PHASE_DURATION: 5,
    LOOP_PENALTY: "Increase Temperature +0.4",
    TRANSITION_PRIORITY: [
      "Temporal Leap (e.g., 15 Years)",
      "Perspective Shift (e.g., Secondary Character)"
    ],
    OVERRIDE_CONDITION: "If current character/scene count > 3 turns without progression, execute 'Context Shatter' sequence."
  },
  GRAPH: { nodes: [], edges: [] },
  ACTIVE_PINS: [],
  NARRATIVE_DEBT: [],
  GAME_LOG: [],
  AUDIT_LOG: [],
  CURRENT_GOAL: "Awaiting Initialization",
  GRAND_OBJECTIVE: "Undefined",
  INTENSITY: 0,
  BANNED_TERMS: [],
  SIGNIFICANCE_MAP: {},
  CAUSAL_DEBT_LEDGER: 0,
  TITLE: "Untitled Narrative",
  LOGLINE: "",
  WORLD_LOGIC: "",
  PILLARS: [],
  TICK: 0
};

// --- New Persistence Types ---

export type NarrativeLOD = 'Scalar' | 'Vector' | 'Manifold';

export interface EntityState {
  id: string;
  name: string;
  lod: NarrativeLOD;
  phase: string;
  goal: string;
  metrics: Record<string, number>; // e.g., [Affinity, Fear, Debt] for Scalar/Vector
  memory?: string[]; // Salience Buffer (GraphNode IDs)
  memoryWeights?: Record<string, number>; // Sigmoid-decayed strength [0, 1]
  lastInteractionTick: number; // For decay calculation
  axioms?: AxiomDefinition; // For Manifold NPCs
  strategy?: Record<string, number>; // For Boss Adaptation
}

export interface StoryMetadata {
  id: string;
  title: string;
  excerpt: string;
  mode: NarrativeMode;
  lastUpdated: number;
  wordCount: number;
  coverImage: string | null;
}

export interface SavedStory extends StoryMetadata {
  segments: StorySegment[];
  engineState: EngineState;
}

export interface PlotDNA {
  metadata: {
    title: string;
    genre: string;
    intent: string;
    voice: string;
    summary: string;
  };
  blueprint: Blueprint;
  trajectory: Array<{
    beat: string;
    goal: string;
    metrics: {
      progression: number;
      intensity: number;
      viscosity: number;
      tension: number;
      manifold: number;
      causalDebt: number;
      auditError: number;
      exogenous?: number;
      theatricalVariance?: number;
      povRotation?: number;
      reserveCapacity?: number;
      stakes?: number;
      agency?: number;
      entropy?: number;
      informationGap?: number;
      resonance?: number;
    };
    activePins: string[];
  }>;
}
