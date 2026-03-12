import React from 'react';
import { Target, Anchor, AlertTriangle } from 'lucide-react';

interface TacticalAnchorsProps {
  currentGoal: string;
  grandObjective?: string;
  activePins: string[];
  narrativeDebt: string[];
}

const TacticalAnchors: React.FC<TacticalAnchorsProps> = ({ currentGoal, grandObjective, activePins, narrativeDebt }) => {
  return (
    <div className="space-y-6">
      {/* Grand Objective (Point Z) */}
      {grandObjective && grandObjective !== "Undefined" && (
        <section>
          <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase tracking-wider font-bold">
            <Target size={14} className="text-emerald-500" /> Point Z (The End)
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded text-emerald-100/90 leading-relaxed italic text-xs">
            {grandObjective}
          </div>
        </section>
      )}

      {/* Current Goal */}
      <section>
        <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase tracking-wider font-bold">
          <Target size={14} /> Current Goal
        </div>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded text-slate-200 leading-relaxed border-l-4 border-l-blue-500">
          {currentGoal}
        </div>
      </section>

      {/* Active Pins */}
      <section>
        <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase tracking-wider font-bold">
          <Anchor size={14} /> Active Pins
        </div>
        <ul className="space-y-2">
          {(!activePins || activePins.length === 0) && <li className="text-slate-700 italic text-xs">No established pins.</li>}
          {(activePins || []).map((pin, idx) => (
            <li key={idx} className="bg-slate-800/50 p-2 rounded text-amber-200/80 border border-slate-700/50 text-xs">
              {pin}
            </li>
          ))}
        </ul>
      </section>

      {/* Narrative Debt */}
      <section>
        <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase tracking-wider font-bold">
          <AlertTriangle size={14} /> Narrative Debt
        </div>
        <ul className="space-y-2">
          {(!narrativeDebt || narrativeDebt.length === 0) && <li className="text-slate-700 italic text-xs">No debt.</li>}
          {(narrativeDebt || []).map((debt, idx) => (
            <li key={idx} className="bg-slate-800/50 p-2 rounded text-rose-300/80 border border-slate-700/50 text-xs">
              {debt}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default TacticalAnchors;
