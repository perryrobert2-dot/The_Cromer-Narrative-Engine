import React from 'react';
import { Terminal, Star, Zap, AlertTriangle, Info } from 'lucide-react';

interface GameLogEntry {
  id: string;
  type: 'milestone' | 'chaos' | 'credit' | 'system';
  message: string;
  timestamp: number;
}

interface GameFeedProps {
  log: GameLogEntry[];
}

const GameFeed: React.FC<GameFeedProps> = ({ log }) => {
  const getIcon = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'milestone': return <Star size={10} className="text-emerald-400" />;
      case 'chaos': return <Zap size={10} className="text-purple-400" />;
      case 'credit': return <Star size={10} className="text-amber-400" />;
      case 'system': return <Info size={10} className="text-blue-400" />;
      default: return <Terminal size={10} className="text-slate-400" />;
    }
  };

  const getBgColor = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'milestone': return 'bg-emerald-950/20 border-emerald-900/30';
      case 'chaos': return 'bg-purple-950/20 border-purple-900/30';
      case 'credit': return 'bg-amber-950/20 border-amber-900/30';
      case 'system': return 'bg-blue-950/20 border-blue-900/30';
      default: return 'bg-slate-950 border-slate-800';
    }
  };

  return (
    <section className="space-y-2">
      <div className="text-[8px] text-slate-500 uppercase font-black tracking-tighter flex items-center gap-1">
        <Terminal size={8} /> Narrative Event Feed
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
        <div className="max-h-40 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {log.length === 0 && (
            <div className="text-[9px] text-slate-600 italic py-2 text-center">
              Awaiting narrative milestones...
            </div>
          )}
          {[...log].reverse().map((entry) => (
            <div 
              key={entry.id} 
              className={`p-1.5 border rounded text-[9px] flex gap-2 items-start transition-all animate-in fade-in slide-in-from-left-2 ${getBgColor(entry.type)}`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(entry.type)}</div>
              <div className="flex-1">
                <div className="text-slate-200 leading-tight">{entry.message}</div>
                <div className="text-[7px] text-slate-500 mt-0.5">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameFeed;
