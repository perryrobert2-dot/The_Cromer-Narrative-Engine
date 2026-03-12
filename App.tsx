import React, { useState } from 'react';
import { useCromerEngine } from './hooks/useCromerEngine';

// Components
import NarrativeLog from './components/NarrativeLog';
import ControlDeck from './components/ControlDeck';
import StateBoard from './components/StateBoard';
import LibraryModal from './components/LibraryModal';

// Hooks
import { useTTS } from './hooks/useTTS';
import { usePersistence } from './hooks/usePersistence';
import { getInitialPhysics } from './src/constants/cartridges';

const App: React.FC = () => {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState(false);
  
  // Hooks
  const { 
    voices, selectedVoice, setVoice, speak, cancel: stopSpeaking, isSpeaking, isSupported: ttsSupported 
  } = useTTS();

  const { 
    saveToDB, loadFromDB, exportJSON, exportManuscript, exportTranscript, exportPlotDNA 
  } = usePersistence();

  const {
    segments,
    engineState,
    setEngineState,
    narrativeMode,
    setNarrativeMode,
    coverImage,
    isLoading,
    generationStage,
    setGenerationStage,
    isGeneratingCover,
    ttsEnabled,
    setTtsEnabled,
    ingestionChoicePending,
    setIngestionChoicePending,
    totalTokens,
    lastContextTokens,
    updateEngineState,
    handleApplyBlueprint,
    handleInteraction,
    handleRecalibrateState,
    handleFlashback,
    handleNewStory,
    handleLoadStory,
    handleUpdateSegmentText,
    handleBranch,
    handleRestoreState,
    handleImportJSON,
    handleIngestNovel,
    handleGenerateCoverImage
  } = useCromerEngine({
    speak,
    stopSpeaking,
    saveToDB,
    loadFromDB
  });

  const handleHighlightSegment = (segmentId: string) => {
    setHighlightedSegmentId(segmentId);
    setTimeout(() => setHighlightedSegmentId(null), 3000);
  };

  const handleDismissAudit = (id: string) => {
    setEngineState(prev => ({ ...prev, AUDIT_LOG: prev.AUDIT_LOG.filter(f => f.id !== id) }));
  };

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <LibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onLoadStory={handleLoadStory} onNewStory={handleNewStory} />
      
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden absolute top-4 right-4 z-50 bg-slate-800/90 backdrop-blur p-2 rounded text-slate-200 border border-slate-700">
        {sidebarOpen ? 'Hide HUD' : 'Show HUD'}
      </button>

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-800`}>
        <StateBoard 
            state={engineState} coverImage={coverImage} isGeneratingCover={isGeneratingCover} totalTokens={totalTokens} lastContextTokens={lastContextTokens}
            ttsSupported={ttsSupported} ttsVoices={voices} ttsSelectedVoice={selectedVoice} ttsEnabled={ttsEnabled} isSpeaking={isSpeaking}
            onSetTTSVoice={setVoice} onToggleTTS={setTtsEnabled} onStopTTS={stopSpeaking}
            onSave={() => exportJSON(engineState, segments)} onExportManuscript={() => exportManuscript(engineState, segments)} 
            onExportTranscript={() => exportTranscript(engineState, segments)}
            onExportPlotDNA={() => exportPlotDNA(engineState, segments)}
            onLoad={handleImportJSON} onIngestNovel={handleIngestNovel} onGenerateCover={handleGenerateCoverImage} onOpenLibrary={() => setIsLibraryOpen(true)}
            onUpdateBannedTerms={(terms) => setEngineState(prev => ({ ...prev, BANNED_TERMS: terms }))}
            onRecalibrate={handleRecalibrateState} isLoading={isLoading} onDismissAudit={handleDismissAudit} onHighlightSegment={handleHighlightSegment}
            readerMode={readerMode} onToggleReaderMode={() => setReaderMode(!readerMode)}
            onRestoreState={handleRestoreState}
            onUpdateEngineState={updateEngineState}
            gameModeEnabled={engineState.GAME_MODE_ENABLED || false}
            onToggleGameMode={(enabled) => updateEngineState({ GAME_MODE_ENABLED: enabled })}
            onReset={handleNewStory}
        />
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {ingestionChoicePending && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4 font-serif">Novel DNA Extracted</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                The engine has successfully reverse-engineered the narrative structure of the ingested text. 
                How would you like to proceed?
              </p>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => {
                    handleApplyBlueprint(ingestionChoicePending);
                    setIngestionChoicePending(null);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  REWRITE (New Style)
                </button>
                <button 
                  onClick={() => setIngestionChoicePending(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-xl transition-all border border-slate-700"
                >
                  CONTINUE (Original Thread)
                </button>
              </div>
            </div>
          </div>
        )}
        <NarrativeLog 
          segments={segments} 
          isLoading={isLoading} 
          onApplyBlueprint={handleApplyBlueprint} 
          onSpeak={ttsSupported ? speak : undefined} 
          onUpdateSegmentText={handleUpdateSegmentText} 
          onBranch={handleBranch}
          highlightedSegmentId={highlightedSegmentId} 
        />
        <ControlDeck 
          onSend={handleInteraction} 
          onFlashback={handleFlashback} 
          isLoading={isLoading} 
          generationStage={generationStage}
          hasStarted={segments.length > 0} 
          selectedMode={narrativeMode} 
          onModeChange={setNarrativeMode}
          selectedGenre={engineState.GENRE}
          onGenreChange={(genre) => updateEngineState({ GENRE: genre, PHYSICS: getInitialPhysics() })}
        />

        {generationStage === 'ERROR' && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/30">
                <span className="text-red-500 text-3xl font-bold">!</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 font-serif">Turn Generation Incomplete</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                The narrative manifold encountered a critical error. Previous state has been preserved.
              </p>
              <button 
                onClick={() => setGenerationStage('IDLE')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-xl transition-all border border-slate-700 uppercase tracking-widest text-xs"
              >
                Acknowledge & Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
