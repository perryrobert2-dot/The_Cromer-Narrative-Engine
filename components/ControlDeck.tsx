import React, { useState, KeyboardEvent } from 'react';
import { Send, Play, Terminal, ChevronDown, History } from 'lucide-react';
import { NarrativeMode, GenerationStage } from '../types';

interface ControlDeckProps {
  onSend: (text: string) => void;
  onFlashback?: () => void;
  isLoading: boolean;
  generationStage: GenerationStage;
  hasStarted: boolean;
  selectedMode: NarrativeMode;
  onModeChange: (mode: NarrativeMode) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

const ControlDeck: React.FC<ControlDeckProps> = ({ 
  onSend, 
  onFlashback,
  isLoading, 
  generationStage,
  hasStarted,
  selectedMode,
  onModeChange,
  selectedGenre,
  onGenreChange
}) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (isLoading) return;
    // Allow empty input to act as a "Continue" command
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modes: NarrativeMode[] = [
    'Short Story',
    'Novella',
    'Novel',
    'Open Ended Web Serial'
  ];

  const availableGenres = [
    'Noir Procedural',
    'System Apocalypse',
    'Cyberpunk',
    'High Fantasy',
    'Space Opera'
  ];

  const toggleGenre = (genre: string) => {
    const currentGenres = selectedGenre.split(' + ').filter(g => g.trim() !== '');
    let newGenres: string[];
    
    if (currentGenres.includes(genre)) {
      newGenres = currentGenres.filter(g => g !== genre);
    } else {
      newGenres = [...currentGenres, genre];
    }
    
    onGenreChange(newGenres.join(' + ') || 'Neutral');
  };

  const stages: { key: GenerationStage; label: string }[] = [
    { key: 'ARCHITECT', label: 'Architect' },
    { key: 'CALCULATOR', label: 'Calculator' },
    { key: 'SUBVERSIVE', label: 'Subversive' },
    { key: 'PATHMAKER', label: 'Pathmaker' },
    { key: 'AUDITOR', label: 'Auditor' },
    { key: 'CORRECTOR', label: 'Corrector' },
    { key: 'WEAVER', label: 'Weaver' },
    { key: 'ARCHIVIST', label: 'Archivist' },
    { key: 'SAVING', label: 'Finalizing' }
  ];

  const activeStages = stages.filter(s => {
    if (generationStage === 'WEAVER') return s.key === 'WEAVER';
    if (generationStage === 'ARCHIVIST') return s.key === 'ARCHIVIST';
    if (generationStage === 'ARCHITECT') return ['ARCHITECT', 'SAVING'].includes(s.key);
    return !['WEAVER', 'ARCHIVIST'].includes(s.key);
  });

  return (
    <div className="bg-slate-950 border-t border-slate-800 p-4 md:p-6 shrink-0 transition-all duration-500 pb-[max(1rem,env(safe-area-inset-bottom))]">
      
      {/* Generation Stages Progress */}
      {isLoading && (
        <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between gap-2 px-2">
          {activeStages.map((s, i) => {
            const isPast = activeStages.findIndex(st => st.key === generationStage) > i;
            const isCurrent = generationStage === s.key;
            return (
              <div key={s.key} className="flex-1 flex flex-col gap-1.5">
                <div className={`h-1 rounded-full transition-all duration-500 ${
                  isPast ? 'bg-blue-500' : isCurrent ? 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-slate-800'
                }`} />
                <span className={`text-[8px] uppercase tracking-tighter font-mono text-center truncate ${
                  isCurrent ? 'text-blue-400 font-bold' : isPast ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode & Genre Selectors - Only visible when not started */}
      {!hasStarted && (
        <div className="max-w-3xl mx-auto mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
           <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-3">
               <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Format:</label>
               <div className="relative group">
                 <select 
                   value={selectedMode}
                   onChange={(e) => onModeChange(e.target.value as NarrativeMode)}
                   className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono py-1.5 pl-3 pr-8 rounded focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-800 transition-colors uppercase tracking-wider"
                   disabled={isLoading}
                 >
                   {modes.map(m => (
                     <option key={m} value={m} className="bg-slate-900 text-slate-200">{m}</option>
                   ))}
                 </select>
                 <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-400" size={12} />
               </div>
             </div>

             <div className="flex items-center gap-3">
               <label className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Genre Cartridges:</label>
               <div className="flex flex-wrap gap-2">
                 {availableGenres.map(g => {
                   const isActive = selectedGenre.includes(g);
                   return (
                     <button
                       key={g}
                       onClick={() => toggleGenre(g)}
                       disabled={isLoading}
                       className={`text-[9px] px-2 py-1 rounded border font-mono transition-all ${
                         isActive 
                           ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                           : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                       }`}
                     >
                       {g}
                     </button>
                   );
                 })}
               </div>
             </div>
           </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex gap-4 items-end">
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-inner relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Generating narrative..." : hasStarted ? "Direct the narrative or press Enter to continue..." : `Enter premise for ${selectedMode}... (e.g. 'Cyberpunk Noir')`}
            className={`w-full bg-transparent border-none p-3 text-slate-200 placeholder-slate-500 focus:ring-0 resize-none font-mono text-sm h-14 md:h-16 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
            disabled={isLoading}
          />
          {hasStarted && (
            <button
              onClick={onFlashback}
              disabled={isLoading}
              title="Trigger Flashback (Topology Expansion)"
              className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-all border border-slate-700"
            >
              <History size={14} />
            </button>
          )}
        </div>
        
        <button
          onClick={handleSend}
          disabled={isLoading}
          className={`h-14 md:h-16 px-6 rounded-lg flex items-center justify-center transition-all font-bold tracking-wide uppercase text-xs md:text-sm min-w-[140px]
            ${isLoading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : hasStarted 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2"><Terminal className="animate-spin" size={16} /> Processing</span>
          ) : !hasStarted ? (
             <span className="flex items-center gap-2"><Play size={16} /> Initialize</span>
          ) : (
             <span className="flex items-center gap-2"><Send size={16} /> Execute</span>
          )}
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto mt-2 text-center flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
         <span>Protocol v2.1 // {hasStarted ? "Active" : "Ready"}</span>
         {hasStarted && <span className="text-emerald-500/50">{selectedMode} Mode</span>}
      </div>
    </div>
  );
};

export default ControlDeck;