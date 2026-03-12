import { useState, useMemo, useCallback } from 'react';
import { EngineState, StorySegment, DEFAULT_STATE, NarrativeMode, Blueprint, GenerationStage } from '../types';

export function useCromerState() {
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [engineState, setEngineState] = useState<EngineState>(DEFAULT_STATE);
  const [narrativeMode, setNarrativeMode] = useState<NarrativeMode>('Short Story');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStage, setGenerationStage] = useState<GenerationStage>('IDLE');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ingestionChoicePending, setIngestionChoicePending] = useState<Blueprint | null>(null);
  const [pendingTurn, setPendingTurn] = useState<{ segment: StorySegment, targetState: EngineState } | null>(null);

  const totalTokens = useMemo(() => segments.reduce((acc, seg) => acc + (seg.usage?.total || 0), 0), [segments]);
  const lastContextTokens = useMemo(() => {
    const lastModelSeg = [...segments].reverse().find(s => s.role === 'model' && s.usage);
    return lastModelSeg?.usage?.input || 0;
  }, [segments]);

  const updateEngineState = useCallback((state: Partial<EngineState>) => {
    setEngineState(prev => {
      const newState = { ...prev, ...state };
      
      if (state.AESTHETICS) {
        newState.AESTHETICS = {
          STYLE: state.AESTHETICS.STYLE || prev.AESTHETICS.STYLE,
          VOICE: { ...prev.AESTHETICS.VOICE, ...(state.AESTHETICS.VOICE || {}) }
        };
      }

      if (state.PHYSICS) {
        newState.PHYSICS = state.PHYSICS;
      }
      
      if (state.GRAPH) newState.GRAPH = { 
        nodes: state.GRAPH.nodes || prev.GRAPH.nodes || [], 
        edges: state.GRAPH.edges || prev.GRAPH.edges || [] 
      };
      
      newState.BANNED_TERMS = (state.BANNED_TERMS && Array.isArray(state.BANNED_TERMS) && state.BANNED_TERMS.length > 0) ? state.BANNED_TERMS : prev.BANNED_TERMS;
      newState.ACTIVE_PINS = (state.ACTIVE_PINS && Array.isArray(state.ACTIVE_PINS) && state.ACTIVE_PINS.length > 0) ? state.ACTIVE_PINS : prev.ACTIVE_PINS;
      newState.NARRATIVE_DEBT = (state.NARRATIVE_DEBT && Array.isArray(state.NARRATIVE_DEBT) && state.NARRATIVE_DEBT.length > 0) ? state.NARRATIVE_DEBT : prev.NARRATIVE_DEBT;
      newState.PILLARS = (state.PILLARS && Array.isArray(state.PILLARS) && state.PILLARS.length > 0) ? state.PILLARS : prev.PILLARS;
      
      return newState;
    });
  }, []);

  return {
    currentStoryId, setCurrentStoryId,
    segments, setSegments,
    engineState, setEngineState,
    narrativeMode, setNarrativeMode,
    coverImage, setCoverImage,
    isLoading, setIsLoading,
    generationStage, setGenerationStage,
    isGeneratingCover, setIsGeneratingCover,
    ttsEnabled, setTtsEnabled,
    ingestionChoicePending, setIngestionChoicePending,
    pendingTurn, setPendingTurn,
    totalTokens, lastContextTokens,
    updateEngineState
  };
}
