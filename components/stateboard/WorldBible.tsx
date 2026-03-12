import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface WorldBibleProps {
  toneStyle?: string;
  worldLogic?: string;
  pillars?: string[];
}

const WorldBible: React.FC<WorldBibleProps> = ({ toneStyle, worldLogic, pillars }) => {
  const [showBible, setShowBible] = useState(false);

  return (
    <section className="space-y-2">
      <div 
        className="flex justify-between items-center bg-slate-800/30 p-2 rounded cursor-pointer hover:bg-slate-800/50" 
        onClick={() => setShowBible(!showBible)}
      >
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2"><BookOpen size={12}/> World Bible</span>
        <span className="text-slate-500">{showBible ? '▼' : '▶'}</span>
      </div>

      {showBible && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Tone & Style</div>
            <p className="text-slate-300 text-xs italic">{toneStyle || "Adaptive"}</p>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">World Logic</div>
            <p className="text-slate-300 text-xs">{worldLogic || "Standard"}</p>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Pillars</div>
            <div className="flex flex-wrap gap-1">
              {(pillars || []).map((p, i) => (
                <span key={i} className="text-[10px] bg-slate-900 px-1 rounded text-slate-400 border border-slate-800">{p}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WorldBible;
