import { useCallback } from 'react';
import { EngineState, StorySegment, SavedStory, NarrativeMode } from '../types';
import { saveStoryToDB, getStoryById } from '../services/db';

export function usePersistence() {
  const saveToDB = useCallback(async (id: string, state: EngineState, segments: StorySegment[], coverImage: string | null, mode: NarrativeMode) => {
    const title = state.TITLE || (segments[0]?.role === 'user' ? segments[0].text.slice(0, 40) + '...' : 'Untitled Narrative');
    const lastBot = [...segments].reverse().find(s => s.role === 'model' && !s.blueprint);
    const excerpt = lastBot ? lastBot.text.slice(0, 150) + '...' : 'New Protocol Initialized.';

    const storyData: SavedStory = {
      id,
      title,
      excerpt,
      mode,
      lastUpdated: Date.now(),
      wordCount: segments.reduce((acc, s) => acc + s.text.split(' ').length, 0),
      engineState: state,
      segments,
      coverImage
    };
    await saveStoryToDB(storyData);
  }, []);

  const loadFromDB = useCallback(async (id: string) => {
    return await getStoryById(id);
  }, []);

  const exportJSON = useCallback((state: EngineState, segments: StorySegment[]) => {
    const data = JSON.stringify({ 
      state, 
      segments, 
      exportedAt: new Date().toISOString(),
      attribution: "Powered by the Cromer Narrative Engine (Pantomime Protocol v1.1)."
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cromer-state-${state.TITLE?.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
    a.click();
  }, []);

  const exportManuscript = useCallback((state: EngineState, segments: StorySegment[]) => {
    const header = `TITLE: ${state.TITLE || 'Untitled'}\nGENRE: ${state.GENRE}\nINTENT: ${state.INTENT}\nLOGLINE: ${state.LOGLINE || 'N/A'}\n\n${'='.repeat(40)}\n\n`;
    
    const prose = segments
      .filter(s => s.role === 'model' && !s.blueprint)
      .map(s => s.text)
      .join('\n\n');
      
    const footer = `\n\n${'='.repeat(40)}\nEND OF PROTOCOL\nPowered by the Cromer Narrative Engine (Pantomime Protocol v1.1).\nDate: ${new Date().toLocaleDateString()}`;
    
    const fullText = header + prose + footer;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.TITLE?.replace(/\s+/g, '-').toLowerCase() || 'manuscript'}.txt`;
    a.click();
  }, []);

  const exportTranscript = useCallback((state: EngineState, segments: StorySegment[]) => {
    const transcript = segments
      .map(s => `[${s.role.toUpperCase()}] ${s.blueprint ? '(ARCHITECT)' : ''}\n${s.text}\n`)
      .join('\n---\n\n');
    
    const attribution = `\n\nPowered by the Cromer Narrative Engine (Pantomime Protocol v1.1).`;
    const fullTranscript = transcript + attribution;
    
    const blob = new Blob([fullTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.TITLE?.replace(/\s+/g, '-').toLowerCase() || 'transcript'}.txt`;
    a.click();
  }, []);

  const exportPlotDNA = useCallback((state: EngineState, segments: StorySegment[]) => {
    const trajectory = segments
      .filter(s => s.state)
      .map(s => ({
        step: s.id,
        timestamp: s.timestamp,
        metrics: {
          progression: s.state?.PHYSICS.progression,
          intensity: s.state?.INTENSITY,
          viscosity: s.state?.PHYSICS.viscosity,
          tension: s.state?.PHYSICS.surface_tension,
          manifold: s.state?.PHYSICS.manifold_tension,
          causalDebt: s.state?.PHYSICS.causal_debt_ledger,
          auditError: s.state?.PHYSICS.audit_error,
          exogenous: s.state?.PHYSICS.exogenous_source,
          theatricalVariance: s.state?.PHYSICS.theatrical_variance,
          povRotation: s.state?.PHYSICS.pov_rotation,
          reserveCapacity: s.state?.PHYSICS.reserve_capacity
        },
        goal: s.state?.CURRENT_GOAL,
        activePins: s.state?.ACTIVE_PINS,
        graphNodes: s.state?.GRAPH?.nodes?.length || 0
      }));

    const dna = {
      metadata: {
        title: state.TITLE,
        genre: state.GENRE,
        intent: state.INTENT,
        voice: state.AESTHETICS.VOICE.primary,
        exportedAt: new Date().toISOString(),
        attribution: "Powered by the Cromer Narrative Engine (Pantomime Protocol v1.1)."
      },
      blueprint: segments.find(s => s.blueprint)?.blueprint,
      trajectory
    };

    const data = JSON.stringify(dna, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plot-dna-${state.TITLE?.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
    a.click();
  }, []);

  return {
    saveToDB,
    loadFromDB,
    exportJSON,
    exportManuscript,
    exportTranscript,
    exportPlotDNA
  };
}
