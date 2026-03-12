import React, { useState } from 'react';
import { EngineState } from '../types';
import { RefreshCw, Eye, EyeOff, Activity, RotateCcw, Cpu, Globe, Settings, MessageSquare } from 'lucide-react';

// Sub-components
import VisualsSection from './stateboard/VisualsSection';
import NarrativePhysics from './stateboard/NarrativePhysics';
import AudioControl from './stateboard/AudioControl';
import WorldBible from './stateboard/WorldBible';
import NarrativeHealth from './stateboard/NarrativeHealth';
import TapestryGraph from './stateboard/TapestryGraph';
import TacticalAnchors from './stateboard/TacticalAnchors';
import BlacklistControl from './stateboard/BlacklistControl';
import SystemOps from './stateboard/SystemOps';
import GameFeed from './stateboard/GameFeed';
import WorldEntities from './stateboard/WorldEntities';

interface StateBoardProps {
  state: EngineState;
  coverImage: string | null;
  isGeneratingCover: boolean;
  totalTokens: number;
  lastContextTokens: number;
  isLoading?: boolean;
  ttsSupported: boolean;
  ttsVoices: SpeechSynthesisVoice[];
  ttsSelectedVoice: SpeechSynthesisVoice | null;
  ttsEnabled: boolean;
  isSpeaking: boolean;
  onSetTTSVoice: (voice: SpeechSynthesisVoice) => void;
  onToggleTTS: (enabled: boolean) => void;
  onStopTTS: () => void;
  onSave: () => void;
  onExportManuscript: () => void;
  onExportTranscript: () => void;
  onExportPlotDNA: () => void;
  onLoad: (file: File) => void;
  onIngestNovel: (file: File, usePro?: boolean) => void;
  onGenerateCover: () => void;
  onOpenLibrary: () => void;
  onUpdateBannedTerms: (terms: string[]) => void;
  onRecalibrate: () => void;
  onDismissAudit: (id: string) => void;
  onHighlightSegment: (segmentId: string) => void;
  onRestoreState: (stateStr: string) => void;
  onUpdateEngineState: (state: Partial<EngineState>) => void;
  readerMode: boolean;
  onToggleReaderMode: () => void;
  gameModeEnabled: boolean;
  onToggleGameMode: (enabled: boolean) => void;
  onReset: () => void;
  pendingTurn: { segment: any, targetState: any } | null;
  onAcceptSuggestion: () => void;
  onRejectSuggestion: () => void;
  onRequestRewrite: () => void;
}

const StateBoard: React.FC<StateBoardProps> = (props) => {
  const { state, isLoading, onRecalibrate, onUpdateEngineState, gameModeEnabled, onToggleGameMode, pendingTurn } = props;
  const [activeTab, setActiveTab] = useState<'engine' | 'world' | 'system' | 'critic'>(pendingTurn ? 'critic' : 'engine');

  const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center py-2 border-b-2 transition-all ${
        activeTab === id 
          ? 'border-blue-500 text-blue-400 bg-slate-800/50' 
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
      }`}
    >
      <Icon size={16} />
      <span className="text-[9px] mt-1 uppercase font-bold tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="bg-slate-900 border-r border-slate-800 h-full flex flex-col w-80 shrink-0 font-mono text-xs md:text-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950">
        <h2 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">Cromer Engine v3.1</h2>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full animate-pulse ${state.INTENSITY > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></span>
             <span className="text-slate-100 font-bold">ONLINE</span>
           </div>
           <div className="flex items-center gap-3">
             <button 
                onClick={props.onToggleReaderMode}
                className={`text-[10px] flex items-center gap-1 transition-colors ${props.readerMode ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                title={props.readerMode ? "Disable Reader Mode (Show Spoilers)" : "Enable Reader Mode (Hide Spoilers)"}
             >
                {props.readerMode ? <EyeOff size={12} /> : <Eye size={12} />}
                {props.readerMode ? 'READER' : 'WRITER'}
             </button>
             <button 
                onClick={onRecalibrate}
                disabled={isLoading}
                className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
             >
                <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} /> RECALIBRATE
             </button>
             <button 
                onClick={props.onReset}
                disabled={isLoading}
                className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors"
                title="Reset story and re-initialize"
             >
                <RotateCcw size={10} /> RESET
             </button>
           </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/50">
        <TabButton id="engine" icon={Cpu} label="Engine" />
        <TabButton id="world" icon={Globe} label="World" />
        <TabButton id="system" icon={Settings} label="System" />
        <TabButton id="critic" icon={MessageSquare} label="Critic" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'engine' && (
          <>
            <section className="bg-slate-950 border border-slate-800 p-3 rounded space-y-2">
              <div className="text-[8px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
                <Activity size={8} /> Engine Persona Status
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${state.PHASE.includes('Initialization') ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></div>
                  <span className="text-[9px] text-slate-400 uppercase">Architect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${!isLoading ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                  <span className="text-[9px] text-slate-400 uppercase">Calculator</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${(state.AUDIT_LOG?.length || 0) > 0 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-[9px] text-slate-400 uppercase">Auditor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] text-slate-400 uppercase">Corrector</span>
                </div>
              </div>
            </section>

            <section>
              <div className="text-slate-500 mb-2 uppercase tracking-wider font-bold">Phase</div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded">
                <div className="text-xl font-bold text-blue-400 mb-1 truncate">{state.PHASE}</div>
              </div>
            </section>

            <NarrativePhysics 
                physics={state.PHYSICS}
                intensity={state.INTENSITY} 
                onUpdateState={onUpdateEngineState}
            />

            <GameFeed log={state.GAME_LOG || []} />

            <div className="mt-3 flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800/50">
              <div className="flex items-center gap-2">
                <Activity size={12} className={gameModeEnabled ? "text-orange-400" : "text-slate-500"} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Simulation Mode</span>
              </div>
              <button 
                onClick={() => onToggleGameMode(!gameModeEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${gameModeEnabled ? 'bg-orange-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${gameModeEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </>
        )}

        {activeTab === 'world' && (
          <>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Genre</div>
                    <div className="text-[10px] text-blue-300 font-bold truncate">{state.GENRE}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2 rounded">
                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Voice</div>
                    <div className="text-[10px] text-emerald-400 font-bold truncate">{state.AESTHETICS.VOICE.primary}</div>
                </div>
            </div>

            <WorldBible 
                toneStyle={state.AESTHETICS.STYLE} 
                worldLogic={state.WORLD_LOGIC} 
                pillars={state.PILLARS} 
            />

            <WorldEntities entities={state.WORLD_ENTITIES || {}} />

            <div className={props.readerMode ? "blur-sm pointer-events-none select-none opacity-50 transition-all duration-500" : "transition-all duration-500"}>
              <TapestryGraph graph={state.GRAPH} />
            </div>
            
            <div className={props.readerMode ? "blur-sm pointer-events-none select-none opacity-50 transition-all duration-500" : "transition-all duration-500"}>
              <TacticalAnchors 
                  currentGoal={state.CURRENT_GOAL} 
                  grandObjective={state.GRAND_OBJECTIVE}
                  activePins={state.ACTIVE_PINS} 
                  narrativeDebt={state.NARRATIVE_DEBT} 
              />
            </div>
          </>
        )}

        {activeTab === 'system' && (
          <>
            <VisualsSection coverImage={props.coverImage} isGeneratingCover={props.isGeneratingCover} onGenerateCover={props.onGenerateCover} />

            <AudioControl 
                ttsSupported={props.ttsSupported} ttsVoices={props.ttsVoices} ttsSelectedVoice={props.ttsSelectedVoice} 
                ttsEnabled={props.ttsEnabled} isSpeaking={props.isSpeaking} 
                onSetTTSVoice={props.onSetTTSVoice} onToggleTTS={props.onToggleTTS} onStopTTS={props.onStopTTS} 
            />

            <NarrativeHealth auditLog={state.AUDIT_LOG} onDismissAudit={props.onDismissAudit} onHighlightSegment={props.onHighlightSegment} />

            <BlacklistControl bannedTerms={state.BANNED_TERMS} onUpdateBannedTerms={props.onUpdateBannedTerms} />

            <section>
                <div className="text-slate-500 mb-2 uppercase tracking-wider font-bold">Efficiency</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase">Context</div>
                        <div className="text-emerald-400 font-mono">{props.lastContextTokens.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase">Total</div>
                        <div className="text-blue-400 font-mono">{props.totalTokens.toLocaleString()}</div>
                    </div>
                </div>
            </section>

            <SystemOps 
              onOpenLibrary={props.onOpenLibrary} onSave={props.onSave} 
              onExportManuscript={props.onExportManuscript} onExportTranscript={props.onExportTranscript} 
              onExportPlotDNA={props.onExportPlotDNA}
              onLoad={props.onLoad} onIngestNovel={props.onIngestNovel} onRestoreState={props.onRestoreState}
            />
          </>
        )}

        {activeTab === 'critic' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded text-center">
              <MessageSquare className="mx-auto text-blue-400 mb-2" size={24} />
              <h3 className="text-slate-200 font-bold uppercase tracking-widest text-xs">Subversive Critic</h3>
              <p className="text-[10px] text-slate-500 mt-2">
                The critic reviews narrative prose and suggests stylistic subversions before finalization.
              </p>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Critic Status</span>
                <button 
                  onClick={() => onUpdateEngineState({ 
                    CRITIC_STATE: { 
                      ...(state.CRITIC_STATE || { isEnabled: false, activeLens: '', history: [] }), 
                      isEnabled: !state.CRITIC_STATE?.isEnabled 
                    } 
                  })}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${state.CRITIC_STATE?.isEnabled ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                >
                  {state.CRITIC_STATE?.isEnabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>
              <p className="text-[9px] text-slate-500 italic">
                {state.CRITIC_STATE?.isEnabled 
                  ? "The critic will review each turn and suggest subversions." 
                  : "Enable to receive stylistic critiques and suggested edits."}
              </p>
            </div>

            {pendingTurn && pendingTurn.segment.criticSuggestion && (
              <div className="bg-slate-950 border border-blue-900/50 p-4 rounded space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Suggestion: {pendingTurn.segment.criticSuggestion.lens}</span>
                </div>
                
                <div className="text-[11px] text-slate-300 leading-relaxed italic border-l-2 border-slate-800 pl-3">
                  "{pendingTurn.segment.criticSuggestion.critique}"
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Suggested Edit:</div>
                  <div className="text-[10px] text-emerald-300/90 bg-emerald-950/20 p-2 rounded border border-emerald-900/30 leading-relaxed">
                    {pendingTurn.segment.criticSuggestion.suggestedEdit}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button 
                    onClick={props.onAcceptSuggestion}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-[10px] uppercase tracking-widest transition-all"
                  >
                    Accept Edit
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={props.onRejectSuggestion}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded text-[10px] uppercase tracking-widest border border-slate-700 transition-all"
                    >
                      Keep Original
                    </button>
                    <button 
                      onClick={props.onRequestRewrite}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded text-[10px] uppercase tracking-widest border border-slate-700 transition-all"
                    >
                      Rewrite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!pendingTurn && state.CRITIC_STATE?.isEnabled && (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded">
                <p className="text-[10px] text-slate-600 italic">Awaiting next turn for analysis...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StateBoard;
