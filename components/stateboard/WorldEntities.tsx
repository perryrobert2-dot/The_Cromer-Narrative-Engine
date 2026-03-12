import React from 'react';
import { EntityState } from '../../types';
import { Users, Shield, Zap, Brain } from 'lucide-react';

interface WorldEntitiesProps {
  entities: Record<string, EntityState>;
}

const WorldEntities: React.FC<WorldEntitiesProps> = ({ entities }) => {
  const entityList = Object.values(entities) as EntityState[];

  if (entityList.length === 0) {
    return (
      <div className="p-4 text-center border border-dashed border-slate-800 rounded">
        <p className="text-[10px] text-slate-600 italic">No background entities detected.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="text-slate-500 mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
        <Users size={14} /> Narrative LOD Entities
      </div>
      
      <div className="space-y-3">
        {entityList.map(entity => (
          <div key={entity.id} className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900/50 p-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${
                  entity.lod === 'Manifold' ? 'text-purple-400' : 
                  entity.lod === 'Vector' ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  {entity.name}
                </span>
                <span className="text-[8px] bg-slate-800 px-1 rounded text-slate-500 uppercase">{entity.lod}</span>
              </div>
              <div className="text-[8px] text-slate-500 uppercase">{entity.phase}</div>
            </div>

            {/* Body */}
            <div className="p-2 space-y-2">
              <div className="text-[9px] text-slate-400 italic leading-tight">
                Goal: {entity.goal}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(entity.metrics).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 uppercase">{key}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${Math.min(100, val * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono">{(val * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Memory / Strategy (LOD Specific) */}
              {entity.lod === 'Vector' && entity.memory && entity.memory.length > 0 && (
                <div className="pt-1 border-t border-slate-900">
                  <div className="text-[7px] text-slate-600 uppercase font-bold mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1"><Brain size={7} /> Salience Buffer</div>
                    {entity.memoryWeights && (
                      <span className="text-blue-400">{(Object.values(entity.memoryWeights)[0] * 100).toFixed(0)}% Retention</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entity.memory.map((m, i) => (
                      <span key={i} className="text-[7px] bg-slate-900 text-slate-500 px-1 rounded border border-slate-800">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entity.lod === 'Manifold' && entity.strategy && (
                <div className="pt-1 border-t border-slate-900">
                  <div className="text-[7px] text-purple-900/70 uppercase font-bold mb-1 flex items-center gap-1">
                    <Zap size={7} /> Adaptation Matrix
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(entity.strategy).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-[7px] text-slate-600 uppercase">{k}</span>
                        <span className="text-[7px] text-purple-400 font-mono">{(v * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorldEntities;
