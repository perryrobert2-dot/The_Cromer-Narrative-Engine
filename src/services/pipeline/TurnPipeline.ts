import { Type } from "@google/genai";
import { EngineState, StorySegment, NarrativeMode, Blueprint, TokenUsage, AuditFlag, GenerationStage, PhysicsPayload } from '../../../types';
import { CORE_BANNED_TERMS, MODEL_NAME } from '../../../constants';
import { ARCHITECT_INSTRUCTION } from '../../constants/prompts';
import { generateNextSegment, initializeNarrativePhysics } from '../../../services/gemini';
import { parseResponse } from '../../utils/parser';
import { cleanProse } from '../../utils/cleaner';
import { LogicProcessor } from './LogicProcessor';
import { ProseProcessor } from './ProseProcessor';
import { CriticProcessor } from './CriticProcessor';

const ARCHITECT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    blueprint: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        logline: { type: Type.STRING },
        pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
        world_logic: { type: Type.STRING },
        tone_style: { type: Type.STRING },
        protagonist_conflict: { type: Type.STRING },
        inciting_incident: { type: Type.STRING },
        active_pins: { type: Type.ARRAY, items: { type: Type.STRING } },
        narrative_debt: { type: Type.ARRAY, items: { type: Type.STRING } },
        grand_objective: { type: Type.STRING }
      },
      required: ["title", "logline", "pillars", "world_logic", "tone_style", "active_pins", "narrative_debt", "grand_objective"]
    },
    state: {
      type: Type.OBJECT,
      properties: {
        PHASE: { type: Type.STRING },
        GENRE: { type: Type.STRING },
        INTENT: { type: Type.STRING },
        AESTHETICS: {
          type: Type.OBJECT,
          properties: {
            STYLE: { type: Type.STRING },
            VOICE: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                density: { type: Type.NUMBER },
                metaphorFrequency: { type: Type.NUMBER }
              }
            }
          }
        },
        CURRENT_GOAL: { type: Type.STRING },
        INTENSITY: { type: Type.NUMBER }
      }
    },
    content: { type: Type.STRING }
  },
  required: ["blueprint", "state", "content"]
};

export interface PipelineResult {
  targetState: EngineState;
  content: string;
  thought?: string;
  usage?: TokenUsage;
  blueprint?: Blueprint;
  auditFlags: AuditFlag[];
  deltaDebt?: number;
  criticSuggestion?: any;
}

export class TurnPipeline {
  static async run(
    engineState: EngineState,
    effectiveInput: string,
    historyForCompute: StorySegment[],
    narrativeMode: NarrativeMode,
    onStageChange: (stage: GenerationStage) => void
  ): Promise<PipelineResult> {
    
    const isInitialization = historyForCompute.length === 0 || engineState.PHASE.includes('0 - Initialization');

    if (isInitialization) {
      // Step 1: Dynamic Physics Initialization
      onStageChange('CALCULATOR'); // Reusing CALCULATOR stage for physics init
      const { physics, banned_terms } = await initializeNarrativePhysics(effectiveInput, engineState.GENRE, engineState.AXIOMS);

      // Step 2: Architect Phase
      onStageChange('ARCHITECT');
      const res = await generateNextSegment(
        [{ id: 'init', role: 'user', text: effectiveInput, timestamp: 0 } as StorySegment], 
        undefined, 
        ARCHITECT_INSTRUCTION + `\nBLACKLIST: ${[...CORE_BANNED_TERMS, ...banned_terms].join(', ')}`,
        MODEL_NAME,
        {
          responseMimeType: "application/json",
          responseSchema: ARCHITECT_SCHEMA
        }
      );
      const parsed = parseResponse(res.text);
      
      const targetState: EngineState = {
        ...engineState,
        ...(parsed.state || {}),
        PHASE: parsed.state?.PHASE || "1 - Baseline (Protocol Active)",
        GENETIC_ANCHOR: JSON.stringify(parsed.state || engineState),
        SIGNIFICANCE_MAP: {},
        PHYSICS: physics,
        BANNED_TERMS: banned_terms
      };

      if (parsed.blueprint) {
        targetState.TITLE = parsed.blueprint.title || targetState.TITLE;
        targetState.LOGLINE = parsed.blueprint.logline || targetState.LOGLINE;
        targetState.WORLD_LOGIC = parsed.blueprint.world_logic || targetState.WORLD_LOGIC;
        targetState.AESTHETICS.STYLE = parsed.blueprint.tone_style || targetState.AESTHETICS.STYLE;
        targetState.PILLARS = parsed.blueprint.pillars || targetState.PILLARS;
        targetState.ACTIVE_PINS = parsed.blueprint.active_pins || targetState.ACTIVE_PINS;
        targetState.NARRATIVE_DEBT = parsed.blueprint.narrative_debt || targetState.NARRATIVE_DEBT;
        targetState.GRAND_OBJECTIVE = parsed.blueprint.grand_objective || targetState.GRAND_OBJECTIVE;
      }

      // Initialize default entities for nLOD demonstration
      targetState.WORLD_ENTITIES = {
        'mayor_001': {
          id: 'mayor_001',
          name: 'Mayor of Oakhaven',
          lod: 'Vector',
          phase: 'Diplomatic',
          goal: 'Maintain order',
          metrics: { affinity: 0.5, fear: 0.1, debt: 0 },
          memory: [],
          lastInteractionTick: 0
        },
        'dragon_001': {
          id: 'dragon_001',
          name: 'The Obsidian Drake',
          lod: 'Manifold',
          phase: 'Slumber',
          goal: 'Guard the hoard',
          metrics: { tension: 0.2, hunger: 0.1 },
          strategy: { counter_measure: 0 },
          lastInteractionTick: 0
        }
      };

      return {
        targetState,
        content: cleanProse(parsed.content),
        thought: parsed.thought,
        blueprint: parsed.blueprint,
        usage: res.usage,
        auditFlags: []
      };
    } else {
      // Standard Flow
      onStageChange('CALCULATOR');
      const { targetState, auditFlags: logicFlags, deltaDebt } = await LogicProcessor.calculate(
        engineState, 
        effectiveInput, 
        historyForCompute, 
        narrativeMode
      );

      onStageChange('PATHMAKER');
      const { content, thought, usage, auditFlags: proseFlags } = await ProseProcessor.generate(
        targetState,
        effectiveInput,
        historyForCompute,
        narrativeMode,
        engineState
      );

      let criticSuggestion = null;
      if (engineState.CRITIC_STATE?.isEnabled) {
        onStageChange('SUBVERSIVE'); // Using SUBVERSIVE stage for Critic
        criticSuggestion = await CriticProcessor.critique(content, engineState);
        if (criticSuggestion) {
          targetState.CRITIC_STATE = CriticProcessor.getNextState(engineState, criticSuggestion.lens);
        }
      }

      return {
        targetState,
        content,
        thought,
        usage,
        auditFlags: [...logicFlags, ...proseFlags],
        deltaDebt,
        criticSuggestion
      };
    }
  }
}
