import React from 'react';
import { Activity, Zap, Box, Thermometer, Gauge } from 'lucide-react';

import { EngineState, PhysicsPayload } from '../../types';

interface NarrativePhysicsProps {
  physics: PhysicsPayload;
  intensity: number;
  onUpdateState: (state: Partial<EngineState>) => void;
}

const NarrativePhysics: React.FC<NarrativePhysicsProps> = ({ 
  physics, intensity, onUpdateState
}) => {
  const getIntensityColor = (val: number) => {
    if (val >= 8) return 'text-red-500 shadow-red-500/50';
    if (val >= 5) return 'text-amber-500 shadow-amber-500/50';
    return 'text-emerald-500 shadow-emerald-500/50';
  };

  const handlePhysicsUpdate = (key: string, value: any) => {
    onUpdateState({
      PHYSICS: {
        ...physics,
        [key]: value
      }
    });
  };

  // Group physics by type
  const tier1Keys = ['causal_debt', 'progression', 'pacing', 'introspection_density', 'action_intensity'];
  const tier2Keys = ['primary_resource', 'environmental_friction', 'protagonist_integrity'];

  const tier1Physics = Object.entries(physics).filter(([key, v]) => tier1Keys.includes(key) && typeof v === 'number');
  const tier2Physics = Object.entries(physics).filter(([key, v]) => tier2Keys.includes(key) && typeof v === 'object' && v !== null && 'value' in v);
  const otherPhysics = Object.entries(physics).filter(([key, v]) => 
    !tier1Keys.includes(key) && 
    !tier2Keys.includes(key) && 
    key !== 'narrative_credit' &&
    key !== 'intensity' &&
    (typeof v === 'number' || Array.isArray(v))
  );

  return (
    <div className="space-y-4">
      {/* Core Intensity */}
      <section className="bg-slate-950 border border-slate-800 p-3 rounded flex items-center justify-between relative">
        <div className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1 absolute top-2 left-2">
          <Activity size={10} /> Intensity
        </div>
        <div className={`text-2xl font-black ${getIntensityColor(intensity)} drop-shadow-lg transition-colors duration-300 ml-auto`}>
          {intensity}
        </div>
        <div className="text-slate-600 text-[10px] mb-0.5">/ 10</div>
      </section>

      {/* Tier 1: Core Constants */}
      {tier1Physics.length > 0 && (
        <section className="bg-slate-950 border border-blue-900/30 p-3 rounded space-y-3">
          <div className="text-[8px] text-blue-400 uppercase font-black tracking-tighter flex items-center gap-1 mb-1">
            <Gauge size={8} /> Core Constants
          </div>
          
          <div className="space-y-3">
            {tier1Physics.map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[7px] text-slate-500 uppercase font-mono">{key.replace(/_/g, ' ')}</span>
                  <span className="text-[9px] font-bold text-blue-300 font-mono">
                    {(value as number).toFixed(2)}
                  </span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={value as number} 
                  onChange={(e) => handlePhysicsUpdate(key, parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tier 2: Translatable Variables */}
      {tier2Physics.length > 0 && (
        <section className="bg-slate-950 border border-purple-900/30 p-3 rounded space-y-3">
          <div className="text-[8px] text-purple-400 uppercase font-black tracking-tighter flex items-center gap-1 mb-1">
            <Zap size={8} /> Genre Variables
          </div>
          
          <div className="space-y-3">
            {tier2Physics.map(([key, v]) => {
              const variable = v as any;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 uppercase font-mono">{key.replace(/_/g, ' ')}</span>
                      <span className="text-[9px] text-purple-300 font-bold uppercase tracking-tighter">{variable.label}</span>
                    </div>
                    <span className="text-[9px] font-bold text-purple-300 font-mono">
                      {variable.value.toFixed(2)}
                    </span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={variable.value} 
                    onChange={(e) => handlePhysicsUpdate(key, { ...variable, value: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="text-[8px] text-slate-600 italic leading-tight">
                    {variable.description}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Other Physics (Arrays, etc) */}
      {otherPhysics.length > 0 && (
        <section className="bg-slate-950 border border-emerald-900/30 p-3 rounded space-y-2">
          <div className="text-[8px] text-emerald-400 uppercase font-black tracking-tighter flex items-center gap-1 mb-1">
            <Box size={8} /> Material State
          </div>
          {otherPhysics.map(([key, val]) => {
            if (Array.isArray(val)) {
              return (
                <div key={key} className="space-y-1">
                  <div className="text-[7px] text-slate-500 uppercase font-mono mb-1">{key.replace(/_/g, ' ')}</div>
                  <div className="flex flex-wrap gap-1">
                    {(val as string[]).map((item, i) => (
                      <span key={i} className="text-[8px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/50">
                        {item}
                      </span>
                    ))}
                    {(val as string[]).length === 0 && <span className="text-[8px] text-slate-600 italic">Empty</span>}
                  </div>
                </div>
              );
            } else if (typeof val === 'number') {
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] text-slate-500 uppercase font-mono">{key.replace(/_/g, ' ')}</span>
                    <span className="text-[9px] font-bold text-emerald-300 font-mono">
                      {val.toFixed(2)}
                    </span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={val} 
                    onChange={(e) => handlePhysicsUpdate(key, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              );
            }
            return null;
          })}
        </section>
      )}

      {/* Narrative Credit - Keep as a special mechanic if needed, or move to physics */}
      {/* For now, let's see if it's in physics */}
      {physics.narrative_credit !== undefined && (
        <section>
          <div className="bg-slate-950 border border-slate-800 p-2 rounded flex items-center justify-between">
            <div className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Thermometer size={10} className="text-amber-400" /> Narrative Credit
            </div>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full border border-slate-800 ${i < physics.narrative_credit ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'bg-slate-900'}`}
                ></div>
              ))}
            </div>
          </div>
          {physics.narrative_credit > 0 && (
            <button 
              onClick={() => handlePhysicsUpdate('narrative_credit', physics.narrative_credit - 1)}
              className="w-full mt-2 py-1 bg-amber-900/20 hover:bg-amber-900/40 border border-amber-900/50 rounded text-[9px] text-amber-400 font-bold flex items-center justify-center gap-1 transition-all animate-pulse"
            >
              <Zap size={10} /> SPEND CREDIT: TRIGGER EPIPHANY
            </button>
          )}
        </section>
      )}
    </div>
  );
};

export default NarrativePhysics;
