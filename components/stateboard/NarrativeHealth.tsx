import React from 'react';
import { Flag, X } from 'lucide-react';
import { AuditFlag } from '../../types';

interface NarrativeHealthProps {
  auditLog: AuditFlag[];
  onDismissAudit: (id: string) => void;
  onHighlightSegment: (segmentId: string) => void;
}

const NarrativeHealth: React.FC<NarrativeHealthProps> = ({ auditLog, onDismissAudit, onHighlightSegment }) => {
  if (!auditLog || auditLog.length === 0) return null;

  return (
    <section className="animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-2 text-orange-500 mb-2 uppercase tracking-wider font-bold">
        <Flag size={14} /> Narrative Health
      </div>
      <div className="space-y-2">
        {auditLog.map((flag) => (
          <div 
            key={flag.id} 
            className="bg-orange-950/20 border border-orange-900/50 p-2 rounded relative group cursor-pointer hover:bg-orange-950/40 transition-colors"
            onClick={() => flag.segmentId && onHighlightSegment(flag.segmentId)}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase font-bold text-orange-500 border border-orange-900/50 px-1 rounded">{flag.type}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDismissAudit(flag.id); }}
                className="text-slate-600 hover:text-slate-400"
              >
                <X size={10} />
              </button>
            </div>
            <p className="text-orange-200/80 text-[10px] mt-1 leading-snug">{flag.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NarrativeHealth;
