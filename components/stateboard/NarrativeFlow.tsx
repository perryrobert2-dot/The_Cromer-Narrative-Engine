import React from 'react';
import { Sliders, Zap, Wind, Activity } from 'lucide-react';
import { EngineState, NarrativeIntent } from '../../types';

interface NarrativeFlowProps {
  state: EngineState;
  onUpdateState: (updates: Partial<EngineState>) => void;
}

const NarrativeFlow: React.FC<NarrativeFlowProps> = ({ state, onUpdateState }) => {
  const intents: NarrativeIntent[] = ['Cozy', 'Epic', 'Gritty', 'Satirical', 'Clinical', 'Nostalgic'];

  return (
    <section className="p-4 border-b border-slate-800 space-y-4">
      <div className="flex items-center gap-2 text-slate-500 uppercase tracking-wider font-bold mb-2">
        <Sliders size={14} /> Narrative Flow
      </div>

      {/* Style Picker */}
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
          <Zap size={10} /> Narrative Intent
        </label>
        <div className="grid grid-cols-3 gap-1">
          {intents.map(intent => (
            <button
              key={intent}
              onClick={() => onUpdateState({ INTENT: intent })}
              className={`px-1 py-1.5 rounded text-[9px] uppercase font-bold border transition-all ${
                state.INTENT === intent
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              {intent}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 pt-2">
        {/* Intensity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Activity size={10} /> Intensity
            </label>
            <span className="text-[10px] font-mono text-blue-400">{state.INTENSITY}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={state.INTENSITY}
            onChange={(e) => onUpdateState({ INTENSITY: parseInt(e.target.value) })}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Viscosity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Wind size={10} /> Viscosity
            </label>
            <span className="text-[10px] font-mono text-emerald-400">{(state.VISCOSITY * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.VISCOSITY}
            onChange={(e) => onUpdateState({ VISCOSITY: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[8px] text-slate-600 italic">Prose density and detail level.</p>
        </div>

        {/* Surface Tension */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Activity size={10} /> Surface Tension
            </label>
            <span className="text-[10px] font-mono text-rose-400">{(state.SURFACE_TENSION * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.SURFACE_TENSION}
            onChange={(e) => onUpdateState({ SURFACE_TENSION: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <p className="text-[8px] text-slate-600 italic">Narrative instability and danger.</p>
        </div>
      </div>
    </section>
  );
};

export default NarrativeFlow;
