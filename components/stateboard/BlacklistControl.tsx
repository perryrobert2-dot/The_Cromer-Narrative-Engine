import React, { useState } from 'react';
import { Ban, Plus, X, Lock } from 'lucide-react';
import { CORE_BANNED_TERMS } from '../../constants';

interface BlacklistControlProps {
  bannedTerms: string[];
  onUpdateBannedTerms: (terms: string[]) => void;
}

const BlacklistControl: React.FC<BlacklistControlProps> = ({ bannedTerms, onUpdateBannedTerms }) => {
  const [newBanTerm, setNewBanTerm] = useState('');

  const handleAddBan = () => {
    if (newBanTerm.trim()) {
      const updated = [...(bannedTerms || []), newBanTerm.trim()];
      onUpdateBannedTerms(updated);
      setNewBanTerm('');
    }
  };

  const handleRemoveBan = (term: string) => {
    const updated = (bannedTerms || []).filter(t => t !== term);
    onUpdateBannedTerms(updated);
  };

  return (
    <section>
      <div className="flex items-center gap-2 text-slate-500 mb-2 uppercase tracking-wider font-bold">
        <Ban size={14} /> The Blacklist
      </div>
      <div className="bg-slate-950 border border-slate-800 p-2 rounded">
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            value={newBanTerm}
            onChange={(e) => setNewBanTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBan()}
            placeholder="Ban a trope..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500"
          />
          <button onClick={handleAddBan} className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-1 rounded">
            <Plus size={14} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
          {/* Core Locked Terms */}
          {CORE_BANNED_TERMS.map((term, i) => (
            <span key={`core-${i}`} className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 text-slate-500 rounded px-2 py-1 text-[10px] cursor-help" title="System Locked Term">
              <Lock size={8} /> {term}
            </span>
          ))}

          {/* User Terms */}
          {(bannedTerms || []).map((term, i) => (
            <span key={`user-${i}`} className="inline-flex items-center gap-1 bg-red-950/30 border border-red-900/50 text-red-400/80 rounded px-2 py-1 text-[10px]">
              {term}
              <button onClick={() => handleRemoveBan(term)} className="hover:text-red-200"><X size={10} /></button>
            </span>
          ))}
          
          {(!bannedTerms || bannedTerms.length === 0) && CORE_BANNED_TERMS.length === 0 && (
            <span className="text-[10px] text-slate-600 italic px-1">No restrictions active.</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlacklistControl;
