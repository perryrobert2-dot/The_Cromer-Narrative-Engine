import React from 'react';
import { Type } from "@google/genai";
import { EngineState, StorySegment, Blueprint, SubversiveAnalysis, NarrativeMode, GenerationStage } from '../types';
import { CORE_BANNED_TERMS, MODEL_FLASH_LITE, MODEL_NAME } from '../constants';
import { getSystemInstruction, ARCHITECT_INSTRUCTION, REBUILD_INSTRUCTION, getComputeInstruction, FLASHBACK_INSTRUCTION, FLASHBACK_SCHEMA } from '../src/constants/prompts';
import { PHYSICS_CARTRIDGES, getSchemaForGenre, getInitialPhysicsForGenre } from '../src/constants/cartridges';
import { generateNextSegment, generateSubversiveAnalysis, generateSummary } from '../services/gemini';
import { parseResponse } from '../src/utils/parser';
import { NarrativeManifold } from '../src/utils/manifold';
import { TurnPipeline } from '../src/services/pipeline/TurnPipeline';
import { LogicProcessor } from '../src/services/pipeline/LogicProcessor';

interface UseCromerActionsProps {
  segments: StorySegment[];
  setSegments: React.Dispatch<React.SetStateAction<StorySegment[]>>;
  engineState: EngineState;
  setEngineState: React.Dispatch<React.SetStateAction<EngineState>>;
  narrativeMode: NarrativeMode;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  generationStage: GenerationStage;
  setGenerationStage: (stage: GenerationStage) => void;
  updateEngineState: (state: Partial<EngineState>) => void;
  stopSpeaking: () => void;
  pendingTurn: { segment: StorySegment, targetState: EngineState } | null;
  setPendingTurn: (turn: { segment: StorySegment, targetState: EngineState } | null) => void;
}

export function useCromerActions({
  segments,
  setSegments,
  engineState,
  setEngineState,
  narrativeMode,
  isLoading,
  setIsLoading,
  generationStage,
  setGenerationStage,
  updateEngineState,
  stopSpeaking,
  pendingTurn,
  setPendingTurn
}: UseCromerActionsProps) {

  const handleApplyBlueprint = (blueprint: Blueprint, chaos?: SubversiveAnalysis['chaos_injection']) => {
    const bPins = Array.isArray(blueprint.active_pins) ? blueprint.active_pins : [];
    const bDebt = Array.isArray(blueprint.narrative_debt) ? blueprint.narrative_debt : [];
    const cPins = chaos && Array.isArray(chaos.suggested_pins) ? chaos.suggested_pins : [];
    const cDebt = chaos && Array.isArray(chaos.suggested_debt) ? chaos.suggested_debt : [];

    const pins = [...bPins, ...cPins];
    const debt = [...bDebt, ...cDebt];
    const tone = chaos && chaos.tone_shift ? chaos.tone_shift : blueprint.tone_style;
    const goal = chaos && chaos.inciting_incident_twist ? `(CHAOS VARIANT) ${chaos.inciting_incident_twist}` : blueprint.inciting_incident;
    const pillars = blueprint.pillars || [];

    setEngineState(prev => {
        const newState = {
            ...prev,
            PHASE: "1 - Baseline (Protocol Active)",
            ACTIVE_PINS: pins,
            NARRATIVE_DEBT: debt,
            CURRENT_GOAL: "Establish Baseline.",
            INTENSITY: 1,
            TITLE: blueprint.title,
            LOGLINE: blueprint.logline,
            WORLD_LOGIC: blueprint.world_logic,
            AESTHETICS: {
              STYLE: tone,
              VOICE: prev.AESTHETICS.VOICE
            },
            PHYSICS: getInitialPhysicsForGenre(prev.GENRE, blueprint.axioms || prev.AXIOMS),
            AXIOMS: blueprint.axioms || prev.AXIOMS,
            PILLARS: pillars,
            GRAND_OBJECTIVE: blueprint.grand_objective,
            SIGNIFICANCE_MAP: {},
            CAUSAL_DEBT_LEDGER: 0
        };
        newState.GENETIC_ANCHOR = JSON.stringify(newState);
        return newState;
    });

    setSegments(prev => [...prev, {
        id: Date.now().toString() + '-sys',
        role: 'model',
        text: `PROTOCOL INITIALIZED ${chaos ? '[CHAOS MODE ACTIVE]' : ''}.\n\nStyle Locked: ${tone}\nStarting Vector: ${goal}\n\nAwaiting input to begin narrative generation.`,
        timestamp: Date.now()
    }]);

    setEngineState(prev => ({
      ...prev,
      GAME_LOG: [
        ...prev.GAME_LOG,
        { id: crypto.randomUUID(), type: 'system', message: `PROTOCOL INITIALIZED: ${blueprint.title}`, timestamp: Date.now() },
        ...(chaos ? [{ id: crypto.randomUUID(), type: 'chaos', message: `CHAOS INJECTED: ${chaos.inciting_incident_twist}`, timestamp: Date.now() }] : [])
      ]
    }));
  };

  const handleInteraction = async (input: string) => {
    setIsLoading(true);
    setGenerationStage('IDLE');
    stopSpeaking();

    let effectiveInput = input;
    if (!effectiveInput.trim()) {
        effectiveInput = segments.length === 0 
            ? "Begin story initialization." 
            : "Continue the narrative.";
    }

    if (input.trim()) {
      const userSeg: StorySegment = { id: Date.now().toString() + '-user', role: 'user', text: input, timestamp: Date.now() };
      setSegments(prev => [...prev, userSeg]);
    }

    try {
      const COMPRESSION_THRESHOLD = 3;
      const processedSegments = await Promise.all(segments.map(async (seg, idx) => {
        if (seg.role === 'model' && seg.text && !seg.summary && idx < segments.length - COMPRESSION_THRESHOLD) {
          const summary = await generateSummary(seg.text);
          return { ...seg, summary };
        }
        return seg;
      }));

      if (processedSegments.some((seg, idx) => seg.summary !== segments[idx].summary)) {
        setSegments(processedSegments);
      }

      const historyForCompute: StorySegment[] = processedSegments.map((seg, idx) => {
        if (seg.summary && idx < processedSegments.length - COMPRESSION_THRESHOLD) {
          return { ...seg, text: `[SUMMARY]: ${seg.summary}` };
        }
        return seg;
      });

      const result = await TurnPipeline.run(
        engineState,
        effectiveInput,
        historyForCompute,
        narrativeMode,
        setGenerationStage
      );

      const { targetState, content, thought, usage, blueprint, auditFlags, deltaDebt, criticSuggestion } = result;

      const botSegmentId = Date.now().toString() + '-bot';
      const fullState = { ...engineState, ...targetState };
      
      const botSegment: StorySegment = {
        id: botSegmentId,
        role: 'model',
        text: content,
        thought: thought,
        state: fullState,
        blueprint: blueprint,
        usage: usage,
        criticSuggestion: criticSuggestion,
        timestamp: Date.now()
      };

      if (criticSuggestion) {
        setPendingTurn({ segment: botSegment, targetState });
        setGenerationStage('IDLE');
        return;
      }

      // Game Mechanics
      const newGameEvents: any[] = [];
      if (deltaDebt !== undefined) {
        if (targetState.NARRATIVE_DEBT.length < engineState.NARRATIVE_DEBT.length) {
          targetState.PHYSICS.narrative_credit = Math.min(10, (targetState.PHYSICS.narrative_credit || 0) + 1);
          newGameEvents.push({ id: crypto.randomUUID(), type: 'credit', message: "DEBT RESOLVED: +1 Narrative Credit", timestamp: Date.now() });
        }
        const oldMilestone = Math.floor((engineState.PHYSICS.progression || 0) / 0.2);
        const newMilestone = Math.floor((targetState.PHYSICS.progression || 0) / 0.2);
        if (newMilestone > oldMilestone) {
          targetState.PHYSICS.narrative_credit = Math.min(10, (targetState.PHYSICS.narrative_credit || 0) + 1);
          newGameEvents.push({ id: crypto.randomUUID(), type: 'milestone', message: `MILESTONE REACHED: ${(newMilestone * 20)}% Progression (+1 Credit)`, timestamp: Date.now() });
        }
      }

      targetState.GAME_LOG = [...(engineState.GAME_LOG || []), ...newGameEvents].slice(-20);
      updateEngineState(targetState);

      setGenerationStage('SAVING');
      setSegments(prev => [...prev, botSegment]);

      if (auditFlags.length > 0) {
        const enrichedFlags = auditFlags.map(flag => ({
            ...flag, id: crypto.randomUUID(), segmentId: botSegmentId, timestamp: Date.now()
        }));
        setEngineState(prev => ({ ...prev, AUDIT_LOG: [...(prev.AUDIT_LOG || []), ...enrichedFlags] }));
      }
    } catch (error: any) {
      console.error("Interaction failed", error);
      const errorMessage = error?.message?.includes('429') || error?.message?.includes('quota')
        ? "SYSTEM ALERT: Narrative Manifold saturated (Rate Limit). Please wait a moment before the next turn."
        : `SYSTEM FAILURE: ${error?.message || "Connection Lost"}.`;
      
      setSegments(prev => [...prev, { id: Date.now().toString() + '-error', role: 'model', text: errorMessage, timestamp: Date.now() }]);
      setGenerationStage('ERROR');
    } finally {
      setIsLoading(false);
      if (generationStage !== 'ERROR') {
        setGenerationStage('IDLE');
      }
    }
  };

  const handleRecalibrateState = async () => {
    if (segments.length === 0) return;
    setIsLoading(true);
    setGenerationStage('WEAVER');
    try {
      const computeSchema = LogicProcessor.getDynamicComputeSchema(engineState.GENRE, engineState.AXIOMS);
      const { text } = await generateNextSegment(
        segments, 
        undefined, 
        REBUILD_INSTRUCTION,
        MODEL_NAME,
        {
          responseMimeType: "application/json",
          responseSchema: computeSchema
        }
      );
      const { state } = parseResponse(text);
      if (state) {
          updateEngineState(state);
          setSegments(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: "/// SYSTEM ALERT: NARRATIVE STATE RECALIBRATED. ///",
              timestamp: Date.now()
          }]);
      }
    } catch (error) { 
      console.error("Recalibrate failed", error); 
      setGenerationStage('ERROR');
    }
    finally { 
      setIsLoading(false); 
      if (generationStage !== 'ERROR') {
        setGenerationStage('IDLE');
      }
    }
  };

  const handleFlashback = async () => {
    if (segments.length === 0) return;
    setIsLoading(true);
    setGenerationStage('ARCHIVIST');
    stopSpeaking();

    try {
      const res = await generateNextSegment(
        segments, 
        undefined, 
        FLASHBACK_INSTRUCTION,
        MODEL_NAME,
        {
          responseMimeType: "application/json",
          responseSchema: FLASHBACK_SCHEMA
        }
      );
      const parsed = parseResponse(res.text);
      
      if (parsed.content) {
        const botSegmentId = Date.now().toString() + '-flashback';
        const targetState = parsed.state || {};
        
        const botSegment: StorySegment = {
          id: botSegmentId,
          role: 'model',
          text: `[FLASHBACK PROTOCOL ACTIVE]\n\n${parsed.content}`,
          state: { ...engineState, ...targetState },
          usage: res.usage,
          timestamp: Date.now()
        };

        updateEngineState(targetState);
        setSegments(prev => [...prev, botSegment]);
      }
    } catch (error) {
      console.error("Flashback failed", error);
      setGenerationStage('ERROR');
    } finally {
      setIsLoading(false);
      if (generationStage !== 'ERROR') {
        setGenerationStage('IDLE');
      }
    }
  };

  const handleAcceptSuggestion = () => {
    if (!pendingTurn) return;
    const { segment, targetState } = pendingTurn;
    const acceptedSegment = {
      ...segment,
      text: segment.criticSuggestion?.suggestedEdit || segment.text,
      criticSuggestion: { ...segment.criticSuggestion!, isAccepted: true }
    };
    finalizeTurn(acceptedSegment, targetState);
  };

  const handleRejectSuggestion = () => {
    if (!pendingTurn) return;
    const { segment, targetState } = pendingTurn;
    const rejectedSegment = {
      ...segment,
      criticSuggestion: { ...segment.criticSuggestion!, isAccepted: false }
    };
    finalizeTurn(rejectedSegment, targetState);
  };

  const handleRequestRewrite = async () => {
    if (!pendingTurn) return;
    const { segment } = pendingTurn;
    setPendingTurn(null);
    handleInteraction(`REWRITE REQUEST: ${segment.criticSuggestion?.critique || "Try a different approach."}`);
  };

  const finalizeTurn = (botSegment: StorySegment, targetState: EngineState) => {
    const newGameEvents: any[] = [];
    
    // Debt/Milestone logic (simplified for brevity, should match handleInteraction)
    if (targetState.NARRATIVE_DEBT.length < engineState.NARRATIVE_DEBT.length) {
      targetState.PHYSICS.narrative_credit = Math.min(10, (targetState.PHYSICS.narrative_credit || 0) + 1);
      newGameEvents.push({ id: crypto.randomUUID(), type: 'credit', message: "DEBT RESOLVED: +1 Narrative Credit", timestamp: Date.now() });
    }
    const oldMilestone = Math.floor((engineState.PHYSICS.progression || 0) / 0.2);
    const newMilestone = Math.floor((targetState.PHYSICS.progression || 0) / 0.2);
    if (newMilestone > oldMilestone) {
      targetState.PHYSICS.narrative_credit = Math.min(10, (targetState.PHYSICS.narrative_credit || 0) + 1);
      newGameEvents.push({ id: crypto.randomUUID(), type: 'milestone', message: `MILESTONE REACHED: ${(newMilestone * 20)}% Progression (+1 Credit)`, timestamp: Date.now() });
    }

    targetState.GAME_LOG = [...(engineState.GAME_LOG || []), ...newGameEvents].slice(-20);
    updateEngineState(targetState);

    setGenerationStage('SAVING');
    setSegments(prev => [...prev, botSegment]);
    setPendingTurn(null);
    setGenerationStage('IDLE');
  };

  return {
    handleApplyBlueprint,
    handleInteraction,
    handleRecalibrateState,
    handleFlashback,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleRequestRewrite
  };
}
