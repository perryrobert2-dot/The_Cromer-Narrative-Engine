import { useCallback } from 'react';
import { EngineState, StorySegment, DEFAULT_STATE, NarrativeMode, PlotDNA, Blueprint } from '../types';

interface UseCromerPersistenceProps {
  setCurrentStoryId: (id: string | null) => void;
  setSegments: (segments: StorySegment[]) => void;
  setEngineState: (state: EngineState) => void;
  setNarrativeMode: (mode: NarrativeMode) => void;
  setCoverImage: (image: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIngestionChoicePending: (blueprint: Blueprint | null) => void;
  stopSpeaking: () => void;
  loadFromDB: (id: string) => Promise<any>;
}

export function useCromerPersistence({
  setCurrentStoryId,
  setSegments,
  setEngineState,
  setNarrativeMode,
  setCoverImage,
  setIsLoading,
  setIngestionChoicePending,
  stopSpeaking,
  loadFromDB
}: UseCromerPersistenceProps) {

  const handleNewStory = useCallback((axioms?: any) => {
    stopSpeaking();
    setSegments([]);
    setEngineState({
      ...DEFAULT_STATE,
      PHASE: "0 - Initialization",
      GENRE: axioms?.genre || DEFAULT_STATE.GENRE,
      AXIOMS: axioms ? {
        currency: axioms.currency,
        friction: axioms.friction,
        penalty: axioms.penalty,
        recoveryRate: axioms.recoveryRate,
        isTransactional: axioms.isTransactional
      } : undefined
    });
    setNarrativeMode('Short Story');
    setCoverImage(null);
    setCurrentStoryId(null);
    setIngestionChoicePending(null);
  }, [setSegments, setEngineState, setNarrativeMode, setCoverImage, setCurrentStoryId, stopSpeaking, setIngestionChoicePending]);

  const handleLoadStory = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const story = await loadFromDB(id);
      if (story) {
        setCurrentStoryId(story.id);
        setSegments(story.segments || []);
        
        const loadedState = story.engineState || (story as any).state || {};
        setEngineState({ 
          ...DEFAULT_STATE, 
          ...loadedState,
          GRAPH: {
            nodes: loadedState.GRAPH?.nodes || [],
            edges: loadedState.GRAPH?.edges || []
          }
        });
        
        setNarrativeMode(story.mode || 'Short Story');
        setCoverImage(story.coverImage || null);
        stopSpeaking();
      }
    } catch (e) {
      console.error("Failed to load story", e);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromDB, setCurrentStoryId, setSegments, setEngineState, setNarrativeMode, setCoverImage, stopSpeaking, setIsLoading]);

  const handleImportJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const segments = data.segments || [];
        const state = data.engineState || data.state || null;
        
        if (segments.length > 0 && state) {
          setCurrentStoryId(null);
          setSegments(segments);
          setEngineState(state);
          setCoverImage(data.coverImage || null);
          if (data.narrativeMode) setNarrativeMode(data.narrativeMode);
          return;
        }

        if (data.metadata && data.trajectory) {
          const dna = data as PlotDNA;
          const lastBeat = dna.trajectory[dna.trajectory.length - 1];
          const reconstructedState: EngineState = {
            ...DEFAULT_STATE,
            TITLE: dna.metadata.title || "Imported DNA",
            GENRE: dna.metadata.genre as any || "Unknown",
            INTENT: dna.metadata.intent as any || "Unknown",
            AESTHETICS: {
              STYLE: "",
              VOICE: { ...DEFAULT_STATE.AESTHETICS.VOICE, primary: dna.metadata.voice || "Neutral" }
            },
            PHASE: "DNA RECONSTRUCTION",
            CURRENT_GOAL: lastBeat?.goal || "Continue from DNA.",
            INTENSITY: lastBeat?.metrics?.intensity || 1,
            ACTIVE_PINS: lastBeat?.activePins || [],
            PHYSICS: {
              ...DEFAULT_STATE.PHYSICS,
              progression: lastBeat?.metrics?.progression || 0,
              causal_debt_ledger: lastBeat?.metrics?.causalDebt || 0,
              audit_error: lastBeat?.metrics?.auditError || 0,
              exogenous_source: lastBeat?.metrics?.exogenous || 0,
              theatrical_variance: lastBeat?.metrics?.theatricalVariance || 0.5,
              pov_rotation: lastBeat?.metrics?.povRotation || 0,
              reserve_capacity: lastBeat?.metrics?.reserveCapacity || 5.0
            }
          };

          const importSegments: StorySegment[] = [];
          if (dna.blueprint) {
            importSegments.push({
              id: 'dna-blueprint',
              role: 'model',
              text: "/// DNA BLUEPRINT DETECTED ///\nWorld logic and initial parameters extracted.",
              blueprint: dna.blueprint,
              timestamp: Date.now()
            });
          }

          importSegments.push({
            id: 'dna-summary',
            role: 'model',
            text: `/// PLOT DNA IMPORTED ///\n\nTrajectory Steps: ${dna.trajectory.length}\nLast Known Goal: ${lastBeat?.goal}\n\nEngine state has been synchronized to the final beat of the DNA sequence. You can now re-render or continue the narrative from this mathematical anchor.`,
            state: reconstructedState,
            timestamp: Date.now()
          });

          setCurrentStoryId(null);
          setSegments(importSegments);
          setEngineState(reconstructedState);
          setCoverImage(null);
          return;
        }
      } catch (err) { 
        console.error("Import failed", err);
      }
    };
    reader.readAsText(file);
  }, [setCurrentStoryId, setSegments, setEngineState, setCoverImage, setNarrativeMode]);

  const handleIngestNovel = useCallback(async (file: File, usePro: boolean = false) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const { analyzeNovelDNA } = await import('../services/gemini');
      const { dna } = await analyzeNovelDNA(text, usePro);
      
      const lastBeat = dna.trajectory[dna.trajectory.length - 1];
      const reconstructedState: EngineState = {
        ...DEFAULT_STATE,
        TITLE: dna.metadata.title || "Ingested Novel DNA",
        GENRE: dna.metadata.genre as any || "Unknown",
        INTENT: dna.metadata.intent as any || "Unknown",
        AESTHETICS: {
          STYLE: dna.blueprint.tone_style || "",
          VOICE: { ...DEFAULT_STATE.AESTHETICS.VOICE, primary: dna.metadata.voice || "Neutral" }
        },
        PHASE: "NOVEL INGESTION",
        CURRENT_GOAL: lastBeat?.goal || "Continue from Ingested DNA.",
        INTENSITY: lastBeat?.metrics?.intensity || 1,
        ACTIVE_PINS: lastBeat?.activePins || [],
        PILLARS: dna.blueprint.pillars || [],
        WORLD_LOGIC: dna.blueprint.world_logic || "",
        LOGLINE: dna.blueprint.logline || "",
        PHYSICS: {
          ...DEFAULT_STATE.PHYSICS,
          progression: lastBeat?.metrics?.progression || 0,
          causal_debt_ledger: lastBeat?.metrics?.causalDebt || 0,
          audit_error: lastBeat?.metrics?.auditError || 0
        }
      };

      const importSegments: StorySegment[] = [
        {
          id: 'ingestion-blueprint',
          role: 'model',
          text: `/// NOVEL INGESTION COMPLETE ///\n\nTitle: ${dna.metadata.title}\nSummary: ${dna.metadata.summary}\n\nThe engine has extracted the underlying plot structure (DNA). You can now rewrite this story in a different style or continue from the final beat.`,
          blueprint: dna.blueprint,
          timestamp: Date.now()
        },
        {
          id: 'ingestion-state',
          role: 'model',
          text: `/// STATE SYNCHRONIZED ///\n\nTrajectory Steps: ${dna.trajectory.length}\nLast Known Goal: ${lastBeat?.goal}`,
          state: reconstructedState,
          timestamp: Date.now()
        }
      ];

      setCurrentStoryId(null);
      setSegments(importSegments);
      setEngineState(reconstructedState);
      setCoverImage(null);
      setNarrativeMode('Novel');
      setIngestionChoicePending(dna.blueprint);
    } catch (err) {
      console.error("Ingestion failed", err);
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentStoryId, setSegments, setEngineState, setCoverImage, setNarrativeMode, setIsLoading]);

  return {
    handleNewStory,
    handleLoadStory,
    handleImportJSON,
    handleIngestNovel
  };
}
