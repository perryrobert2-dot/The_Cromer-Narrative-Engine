import { useEffect, useCallback } from 'react';
import { EngineState, StorySegment, NarrativeMode } from '../types';

// Sub-hooks
import { useCromerState } from './useCromerState';
import { useCromerActions } from './useCromerActions';
import { useCromerPersistence } from './useCromerPersistence';

interface UseCromerEngineProps {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  saveToDB: (id: string, state: EngineState, segments: StorySegment[], coverImage: string | null, mode: NarrativeMode) => Promise<void>;
  loadFromDB: (id: string) => Promise<any>;
}

export function useCromerEngine({ speak, stopSpeaking, saveToDB, loadFromDB }: UseCromerEngineProps) {
  const state = useCromerState();
  
  const {
    currentStoryId, setCurrentStoryId,
    segments, setSegments,
    engineState, setEngineState,
    narrativeMode, setNarrativeMode,
    coverImage, setCoverImage,
    isLoading, setIsLoading,
    generationStage, setGenerationStage,
    isGeneratingCover, setIsGeneratingCover,
    ttsEnabled,
    ingestionChoicePending, setIngestionChoicePending,
    updateEngineState
  } = state;

  // Auto-Persistence
  useEffect(() => {
    if (segments.length > 0) {
      const storyId = currentStoryId || crypto.randomUUID();
      if (!currentStoryId) setCurrentStoryId(storyId);

      const timer = setTimeout(() => {
        saveToDB(storyId, engineState, segments, coverImage, narrativeMode);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [segments, engineState, coverImage, narrativeMode, currentStoryId, saveToDB, setCurrentStoryId]);

  // Auto-play TTS
  useEffect(() => {
    if (ttsEnabled && segments.length > 0) {
      const last = segments[segments.length - 1];
      if (last.role === 'model' && !last.blueprint) {
        setTimeout(() => speak(last.text), 500);
      }
    }
  }, [segments, ttsEnabled, speak]);

  const actions = useCromerActions({
    segments,
    setSegments,
    engineState,
    setEngineState,
    narrativeMode,
    isLoading,
    setIsLoading,
    generationStage,
    setGenerationStage,
    setNarrativeMode,
    updateEngineState,
    stopSpeaking,
    pendingTurn: state.pendingTurn,
    setPendingTurn: state.setPendingTurn
  });

  const persistence = useCromerPersistence({
    setCurrentStoryId,
    setSegments,
    setEngineState,
    setNarrativeMode,
    setCoverImage,
    setIsLoading,
    setIngestionChoicePending,
    stopSpeaking,
    loadFromDB
  });

  const handleUpdateSegmentText = useCallback((segmentId: string, newText: string) => {
    setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, text: newText } : s));
  }, [setSegments]);

  const handleBranch = useCallback((segmentId: string) => {
    const index = segments.findIndex(s => s.id === segmentId);
    if (index === -1) return;

    const targetSegment = segments[index];
    const newSegments = segments.slice(0, index + 1);
    
    setSegments(newSegments);
    if (targetSegment.state) {
      setEngineState(targetSegment.state);
    }
    
    stopSpeaking();
  }, [segments, setSegments, setEngineState, stopSpeaking]);

  const handleRestoreState = useCallback((stateStr: string) => {
    try {
      const state = JSON.parse(stateStr);
      if (state && typeof state === 'object' && 'GENRE' in state) {
        setEngineState(state);
        setSegments(prev => [...prev, {
          id: Date.now().toString() + '-sys',
          role: 'model',
          text: "/// SYSTEM ALERT: ENGINE STATE RESTORED FROM CHECKPOINT. ///",
          timestamp: Date.now()
        }]);
      }
    } catch (e) {}
  }, [setEngineState, setSegments]);

  const handleGenerateCoverImage = async () => {
    if (!segments.length || isGeneratingCover) return;
    setIsGeneratingCover(true);
    try {
        const context = `Genre/Setting: ${engineState.ACTIVE_PINS.join(', ')}\nGoal: ${engineState.CURRENT_GOAL}\nIntensity: ${engineState.INTENSITY}/10`;
        const { generateCoverIllustration } = await import('../services/gemini');
        const base64Image = await generateCoverIllustration(context);
        setCoverImage(base64Image);
    } catch (e) { console.error("Cover generation failed", e); }
    finally { setIsGeneratingCover(false); }
  };

  return {
    ...state,
    ...actions,
    ...persistence,
    handleUpdateSegmentText,
    handleBranch,
    handleRestoreState,
    handleGenerateCoverImage,
    handleInitialize: actions.handleInitialize
  };
}
