import { Type, ThinkingLevel } from "@google/genai";
import { EngineState, StorySegment, NarrativeMode, Blueprint, TokenUsage, AuditFlag, GenerationStage, PhysicsPayload } from '../../../types';
import { CORE_BANNED_TERMS, MODEL_NAME, MODEL_PRO } from '../../../constants';
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
        PHASE_TICKS: { type: Type.NUMBER },
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
                metaphorFrequency: { type: Type.NUMBER },
                temperature: { type: Type.NUMBER },
                abstractness: { type: Type.NUMBER }
              }
            }
          }
        },
        FAIL_SAFES: {
          type: Type.OBJECT,
          properties: {
            STALL_PROTECTION: { type: Type.STRING },
            MAX_PHASE_DURATION: { type: Type.NUMBER },
            LOOP_PENALTY: { type: Type.STRING },
            TRANSITION_PRIORITY: { type: Type.ARRAY, items: { type: Type.STRING } },
            OVERRIDE_CONDITION: { type: Type.STRING }
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
    onStageChange: (stage: GenerationStage) => void,
    forceInitialization: boolean = false,
    antagonistMirroring: boolean = false,
    image?: string
  ): Promise<PipelineResult> {
    
    const isInitialization = forceInitialization || historyForCompute.length === 0 || engineState.PHASE.includes('0 - Initialization');

    if (isInitialization) {
      // Step 1: Dynamic Physics Initialization (Only if not already provided by wizard)
      let physics = engineState.PHYSICS;
      let banned_terms: string[] = engineState.BANNED_TERMS || [];

      if (!forceInitialization) {
        onStageChange('CALCULATOR');
        const initRes = await initializeNarrativePhysics(effectiveInput, engineState.GENRE, engineState.AXIOMS);
        physics = initRes.physics;
        banned_terms = initRes.banned_terms;
      }

      // Step 2: Architect Phase
      onStageChange('ARCHITECT');
      const architectPrompt = ARCHITECT_INSTRUCTION + 
        `\nBLACKLIST: ${[...CORE_BANNED_TERMS, ...banned_terms].join(', ')}` +
        `\nVOICE VECTORS: Density: ${engineState.AESTHETICS.VOICE.density}, Temperature: ${engineState.AESTHETICS.VOICE.temperature}, Abstractness: ${engineState.AESTHETICS.VOICE.abstractness}` +
        (antagonistMirroring ? "\n### ANTAGONIST MIRRORING ENABLED: Start with a visceral World-Hook (The Antagonist/Force) that contrasts with the protagonist's upcoming entry. Focus on 'Meat and Blood' vs 'Nerves and Will'." : "");

      const res = await generateNextSegment(
        [{ id: 'init', role: 'user', text: effectiveInput, timestamp: 0 } as StorySegment], 
        undefined, 
        architectPrompt,
        MODEL_PRO,
        {
          responseMimeType: "application/json",
          responseSchema: ARCHITECT_SCHEMA,
          thinkingLevel: ThinkingLevel.HIGH
        },
        image
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
      
      // 3. Semantic Drift Fail-safe (Loop Detection)
      let tempOverride = undefined;
      let blackSwanInstruction = "";
      
      if (historyForCompute.length >= 3) {
        const last3 = historyForCompute.slice(-3).map(s => s.text.toLowerCase());
        const words = last3.map(t => new Set(t.split(/\s+/)));
        
        // Check for common specific "stagnation" words
        const stagnationWords = ['clinical', 'brutal', 'serrated', 'visceral', 'cold', 'metallic'];
        const stagnationDetected = stagnationWords.some(word => 
          last3.every(text => text.includes(word))
        );

        if (stagnationDetected) {
          tempOverride = 0.8;
          blackSwanInstruction = "\n### ENTROPY EVENT TRIGGERED: Vocab Stagnation Detected. You must introduce a 'Black Swan' event—a narrative element that cannot be derived from the current room or character. Shift the tone dramatically.";
        }
      }

      const { content, thought, usage, auditFlags: proseFlags } = await ProseProcessor.generate(
        targetState,
        effectiveInput + blackSwanInstruction,
        historyForCompute,
        narrativeMode,
        engineState,
        image,
        tempOverride
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
