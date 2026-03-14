import React, { useEffect, useRef, useState } from 'react';
import { StorySegment, Blueprint, SubversiveAnalysis } from '../types';
import { User, Bot, Volume2, GitBranch, Copy, Check, Brain } from 'lucide-react';
import BlueprintCard from './BlueprintCard';

interface NarrativeLogProps {
  segments: StorySegment[];
  isLoading: boolean;
  onApplyBlueprint: (blueprint: Blueprint, chaos?: SubversiveAnalysis['chaos_injection']) => void;
  onSpeak?: (text: string) => void;
  onUpdateSegmentText: (segmentId: string, newText: string) => void;
  onBranch: (segmentId: string) => void;
  highlightedSegmentId?: string | null;
}

const NarrativeLog: React.FC<NarrativeLogProps> = ({ segments, isLoading, onApplyBlueprint, onSpeak, onUpdateSegmentText, onBranch, highlightedSegmentId }) => {
  const latestSegmentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prevSegmentCount, setPrevSegmentCount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showThoughtId, setShowThoughtId] = useState<string | null>(null);

  const handleCopyState = (seg: StorySegment) => {
    if (!seg.state) return;
    const stateStr = JSON.stringify(seg.state);
    navigator.clipboard.writeText(stateStr);
    setCopiedId(seg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Scroll to the TOP of the new segment when it arrives
  useEffect(() => {
    if (segments.length > prevSegmentCount) {
      if (latestSegmentRef.current) {
        latestSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPrevSegmentCount(segments.length);
    }
  }, [segments.length, prevSegmentCount]);

  // Scroll to highlighted segment
  useEffect(() => {
    if (highlightedSegmentId) {
      const el = document.getElementById(`segment-${highlightedSegmentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSegmentId]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 bg-slate-950 scroll-smooth pb-20">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {segments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-600 space-y-4 opacity-50">
             <Bot size={48} />
             <p className="font-mono text-sm">AWAITING INPUT TO INITIALIZE ENGINE...</p>
          </div>
        )}

        {segments.map((seg, index) => {
          // Identify if this is the latest segment to attach the ref
          const isLatest = index === segments.length - 1;
          
          return (
            <div 
              key={seg.id} 
              id={`segment-${seg.id}`}
              ref={isLatest ? latestSegmentRef : null}
              className={`flex flex-col group ${seg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all ${highlightedSegmentId === seg.id ? 'ring-2 ring-orange-500 ring-offset-4 ring-offset-slate-950 rounded-lg p-2 bg-orange-500/5' : ''}`}
            >
              <div className={`flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest ${seg.role === 'user' ? 'text-blue-400' : 'text-emerald-400'}`}>
                 {seg.role === 'user' ? <><User size={12}/> Operator</> : <><Bot size={12}/> {seg.blueprint ? 'Architect' : 'Pathmaker'}</>}
                  <span className="text-slate-700">|</span>
                  <span className="text-slate-600">{new Date(seg.timestamp).toLocaleTimeString()}</span>
                  
                  <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    {seg.role === 'model' && onSpeak && (
                      <button 
                        onClick={() => onSpeak(seg.text)} 
                        className="text-slate-600 hover:text-slate-300 transition-colors"
                        title="Read Aloud"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                    
                    {seg.state && (
                      <button 
                        onClick={() => handleCopyState(seg)} 
                        className={`transition-colors ${copiedId === seg.id ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-300'}`}
                        title="Copy Checkpoint State (Numbers)"
                      >
                        {copiedId === seg.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}

                    {seg.thought && (
                      <button 
                        onClick={() => setShowThoughtId(showThoughtId === seg.id ? null : seg.id)} 
                        className={`transition-colors ${showThoughtId === seg.id ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'}`}
                        title="View Architectural Thinking"
                      >
                        <Brain size={12} />
                      </button>
                    )}

                    <button 
                      onClick={() => onBranch(seg.id)} 
                      className="text-slate-600 hover:text-blue-400 transition-colors"
                      title="Branch from here (Rewind to this point)"
                    >
                      <GitBranch size={12} />
                    </button>
                  </div>
              </div>
              
              {/* If this segment contains a Blueprint, render the Card */}
              {seg.blueprint ? (
                  <div className="w-full space-y-4">
                      <BlueprintCard 
                        blueprint={seg.blueprint} 
                        subversive={seg.subversive}
                        onApply={(chaos) => seg.blueprint && onApplyBlueprint(seg.blueprint, chaos)} 
                      />
                      
                      {/* If text is short/metadata, show as system note. If long, show as prose. */}
                      {seg.text && seg.text.length < 100 ? (
                           <p className="text-slate-500 text-xs font-mono text-center">{seg.text}</p>
                      ) : (
                           <div className="prose prose-invert max-w-none font-serif text-slate-200 text-lg md:text-xl pl-4 border-l-2 border-emerald-900/50 whitespace-pre-wrap leading-relaxed group relative">
                              {showThoughtId === seg.id && seg.thought && (
                                  <div className="mb-4 p-3 bg-slate-900/50 border border-amber-900/30 rounded text-[11px] font-mono text-amber-200/70 leading-normal animate-in fade-in slide-in-from-top-1">
                                      <div className="flex items-center gap-2 mb-1 text-amber-500/50 text-[9px] uppercase tracking-widest">
                                          <Brain size={10} /> Architectural Thinking Budget
                                      </div>
                                      {seg.thought}
                                  </div>
                              )}
                              {editingId === seg.id ? (
                                <textarea 
                                    className="w-full bg-slate-900 border border-blue-500 p-2 rounded text-slate-200 font-serif text-lg focus:outline-none min-h-[150px]"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => {
                                        onUpdateSegmentText(seg.id, editValue);
                                        setEditingId(null);
                                    }}
                                    autoFocus
                                />
                              ) : (
                                <>
                                    {seg.text}
                                    <button 
                                        onClick={() => { setEditingId(seg.id); setEditValue(seg.text); }}
                                        className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 bg-slate-800/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 hover:text-blue-400 uppercase font-mono border border-slate-700 shadow-lg z-10"
                                    >
                                        Edit
                                    </button>
                                </>
                              )}
                           </div>
                      )}
                  </div>
              ) : (
                  <div className={`prose prose-invert max-w-none whitespace-pre-wrap group relative ${
                    seg.role === 'user' 
                      ? 'bg-slate-900 border border-slate-800 p-4 rounded-tl-xl rounded-bl-xl rounded-br-xl text-slate-300 font-mono text-sm' 
                      : 'font-serif text-slate-200 text-lg md:text-xl pl-4 border-l-2 border-slate-800 leading-relaxed'
                  }`}>
                    {seg.image && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-slate-700 max-w-sm">
                        <img src={seg.image} alt="User context" className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {showThoughtId === seg.id && seg.thought && (
                        <div className="mb-4 p-3 bg-slate-900/50 border border-amber-900/30 rounded text-[11px] font-mono text-amber-200/70 leading-normal animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-2 mb-1 text-amber-500/50 text-[9px] uppercase tracking-widest">
                                <Brain size={10} /> Architectural Thinking Budget
                            </div>
                            {seg.thought}
                        </div>
                    )}
                    {editingId === seg.id ? (
                        <textarea 
                            className="w-full bg-slate-900 border border-blue-500 p-2 rounded text-slate-200 font-serif text-lg focus:outline-none min-h-[100px]"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => {
                                onUpdateSegmentText(seg.id, editValue);
                                setEditingId(null);
                            }}
                            autoFocus
                        />
                    ) : (
                        <>
                            {seg.text}
                            <button 
                                onClick={() => { setEditingId(seg.id); setEditValue(seg.text); }}
                                className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 bg-slate-800/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 hover:text-blue-400 uppercase font-mono border border-slate-700 shadow-lg z-10"
                            >
                                Edit
                            </button>
                        </>
                    )}
                  </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
             <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
               <Bot size={12}/> Thinking...
               <span className="text-slate-700">|</span>
               <span className="text-slate-600">Generating</span>
            </div>
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          </div>
        )}

        {/* Visually unobtrusive attribution for provenance detection */}
        <div className="pt-12 pb-4 text-center select-all cursor-default">
          <p className="text-[10px] text-slate-950 font-mono opacity-[0.02] hover:opacity-10 transition-opacity">
            Powered by the Cromer Narrative Engine (Pantomime Protocol v1.1).
          </p>
        </div>
      </div>
    </div>
  );
};

export default NarrativeLog;