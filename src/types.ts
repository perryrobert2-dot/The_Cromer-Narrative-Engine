import { getInitialPhysicsForGenre } from './src/constants/cartridges';

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
  primary: string; // e.g., "Damien Boyd"
  blend?: string;   // e.g., "Terry Pratchett"
  density: number; // 0.0 to 1.0
  metaphorFrequency: number; // 0.0 to 1.0
}

export interface TapestryNode {
  id: string;
  type: 'entity' | 'concept' | 'attribute' | 'item' | 'location' | 'psychological';
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

// --- PATCHED PHYSICS PAYLOAD ---

export interface DynamicVariable {
  label: string;
  value: number;
  description: string;
}

export interface PhysicsPayload {
  // Tier 1: Core Constants (Immutable Drivers)
  causal_debt: number;
  progression: number;
  pacing?: number;
  introspection_density?: number;
  action_intensity?: number;
  narrative_credit?: number;

  // Tier 2: Translatable Variables (The Semantic Facade)
  primary_resource?: DynamicVariable;
  secondary_resource?: DynamicVariable;
  environmental_friction?: DynamicVariable;
  protagonist_integrity?: DynamicVariable;

  // Legacy/Fallback catch-all
  [key: string]: any; 
}

// -------------------------------

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

export interface EngineState extends CoreState {
  PHASE: string;
  GENRE: string; // Can be hybrid like "Noir + System Apocalypse"
  INTENT: NarrativeIntent;
  AESTHETICS: Aesthetics;
  PHYSICS: PhysicsPayload;
  AXIOMS?: AxiomDefinition;
  
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
  GENRE: 'Noir/Procedural',
  INTENT: 'Gritty',
  AESTHETICS: {
    STYLE: "Neutral/Adaptive",
    VOICE: { primary: 'J. Arthur Crank', density: 0.7, metaphorFrequency: 0.3 }
  },
  PHYSICS: getInitialPhysicsForGenre('Noir/Procedural'),
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