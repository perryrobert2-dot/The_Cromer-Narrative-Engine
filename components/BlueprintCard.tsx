import React from 'react';
import { Blueprint, SubversiveAnalysis } from '../types';
import { ShieldCheck, Map, Zap, Feather, Play, Layers, AlertOctagon, Flame } from 'lucide-react';

interface BlueprintCardProps {
  blueprint: Blueprint;
  subversive?: SubversiveAnalysis;
  onApply: (chaos?: SubversiveAnalysis['chaos_injection']) => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({ blueprint, subversive, onApply }) => {
  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-lg overflow-hidden shadow-2xl my-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-slate-950/50 p-4 border-b border-emerald-500/20 flex justify-between items-start">
        <div>
          <h3 className="font-mono text-emerald-400 text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={18} /> ARCHITECT BLUEPRINT
          </h3>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">{blueprint.title}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => onApply()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-900/50"
            >
                <Play size={14} fill="currentColor" /> Initialize
            </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
              <Feather size={12} /> Narrative Voice & Style
            </div>
            <p className="text-slate-300 font-serif italic text-sm border-l-2 border-emerald-500/30 pl-3">
              "{blueprint.tone_style}"
            </p>
          </div>

          <div>
            <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
              <Map size={12} /> World Logic
            </div>
            <p className="text-slate-400 text-xs font-mono leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
              {blueprint.world_logic}
            </p>
          </div>

          <div>
             <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
              <Zap size={12} /> Inciting Incident
            </div>
            <p className="text-slate-300 text-sm">
              {blueprint.inciting_incident}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
              <Layers size={12} /> Core Pillars
            </div>
            <ul className="grid grid-cols-1 gap-1">
              {(blueprint.pillars || []).map((pillar, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> {pillar}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
              <div className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold mb-2">Initial Pins</div>
              <ul className="space-y-1">
                {(blueprint.active_pins || []).map((pin, i) => (
                   <li key={i} className="text-[10px] text-slate-400 truncate">• {pin}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
              <div className="text-[10px] text-rose-500/70 uppercase tracking-widest font-bold mb-2">Narrative Debt</div>
              <ul className="space-y-1">
                {(blueprint.narrative_debt || []).map((debt, i) => (
                   <li key={i} className="text-[10px] text-slate-400 truncate">• {debt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* The Subversive Section (Overlay if exists) */}
        {subversive && (
            <div className="col-span-1 md:col-span-2 mt-4 border-t-2 border-orange-900/50 pt-4 bg-slate-950/30 -mx-6 px-6 pb-2">
                 <div className="flex items-center gap-2 text-orange-500 font-mono font-bold text-xs uppercase tracking-widest mb-2">
                    <AlertOctagon size={14} /> The Subversive Opinion
                 </div>
                 <div className="bg-orange-950/20 border border-orange-900/50 p-4 rounded text-orange-200/90 text-sm font-mono leading-relaxed relative">
                    <div className="absolute top-0 right-0 p-1 opacity-20">
                        <Flame size={48} />
                    </div>
                    <p className="mb-4">"{subversive.dissent}"</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs border-t border-orange-900/30 pt-3">
                         <div>
                            <span className="text-orange-500 uppercase font-bold text-[10px]">Chaos Injection:</span>
                            <p className="mt-1 text-slate-400">{subversive.chaos_injection.inciting_incident_twist}</p>
                         </div>
                         <div className="flex items-end justify-end">
                             <button 
                                onClick={() => onApply(subversive.chaos_injection)}
                                className="bg-orange-900/80 hover:bg-orange-800 text-orange-200 border border-orange-700/50 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg hover:shadow-orange-900/50 w-full md:w-auto justify-center"
                            >
                                <Flame size={12} /> Accept Chaos Protocol
                            </button>
                         </div>
                    </div>
                 </div>
            </div>
        )}

      </div>
      
      {/* Footer Logline */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-xs font-mono">{blueprint.logline}</p>
      </div>

    </div>
  );
};

export default BlueprintCard;