import React, { useRef, useState, useEffect } from 'react';
import { BookOpen, Download, Upload, Save, FileJson, FileText, ScrollText, Hash, Fingerprint } from 'lucide-react';

interface SystemOpsProps {
  onOpenLibrary: () => void;
  onSave: () => void;
  onExportManuscript: () => void;
  onExportTranscript: () => void;
  onExportPlotDNA: () => void;
  onLoad: (file: File) => void;
  onIngestNovel: (file: File, usePro?: boolean) => void;
  onRestoreState: (stateStr: string) => void;
}

const SystemOps: React.FC<SystemOpsProps> = ({
  onOpenLibrary,
  onSave,
  onExportManuscript,
  onExportTranscript,
  onExportPlotDNA,
  onLoad,
  onIngestNovel,
  onRestoreState
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const novelInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLoad(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNovelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const usePro = window.confirm("Use Gemini 3.1 Pro for high-accuracy analysis? (Cancel for Flash Lite)");
      onIngestNovel(e.target.files[0], usePro);
    }
    if (novelInputRef.current) novelInputRef.current.value = '';
  };

  return (
    <div className="p-4 border-t border-slate-800 grid grid-cols-4 gap-2 relative">
      <button onClick={onOpenLibrary} className="col-span-1 flex flex-col items-center justify-center p-2 rounded bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-900/50 transition-colors">
        <BookOpen size={16} className="mb-1" />
        <span className="text-[10px]">LIB</span>
      </button>
      
      <div className="relative" ref={exportMenuRef}>
        <button 
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="w-full h-full flex flex-col items-center justify-center p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <Download size={16} className="mb-1" />
          <span className="text-[10px]">EXP</span>
        </button>
        
        {showExportMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 shadow-xl rounded-lg overflow-hidden z-50 flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-200">
            <button 
              onClick={() => { onSave(); setShowExportMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left transition-colors border-b border-slate-800"
            >
              <FileJson size={14} className="text-blue-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">JSON Backup</div>
                <div className="text-[10px] text-slate-500">Full State & History</div>
              </div>
            </button>
            <button 
              onClick={() => { onExportManuscript(); setShowExportMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left transition-colors border-b border-slate-800"
            >
              <FileText size={14} className="text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Manuscript (.txt)</div>
                <div className="text-[10px] text-slate-500">Clean Prose Only</div>
              </div>
            </button>
            <button 
              onClick={() => { onExportTranscript(); setShowExportMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left transition-colors border-b border-slate-800"
            >
              <ScrollText size={14} className="text-amber-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Transcript (.txt)</div>
                <div className="text-[10px] text-slate-500">Full Audit Log</div>
              </div>
            </button>
            <button 
              onClick={() => { onExportPlotDNA(); setShowExportMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left transition-colors"
            >
              <Fingerprint size={14} className="text-purple-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Plot DNA (.json)</div>
                <div className="text-[10px] text-slate-500">Numerical Trajectory</div>
              </div>
            </button>
          </div>
        )}
      </div>

      <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Import JSON Backup or Plot DNA">
        <Upload size={16} className="mb-1" />
        <span className="text-[10px]">IMP</span>
      </button>

      <button onClick={() => novelInputRef.current?.click()} className="flex flex-col items-center justify-center p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Ingest Novel (.txt) for DNA Extraction">
        <FileText size={16} className="mb-1 text-amber-500" />
        <span className="text-[10px]">INGEST</span>
      </button>

      <button 
        onClick={() => {
          const stateStr = prompt("Paste Checkpoint State (JSON):");
          if (stateStr) onRestoreState(stateStr);
        }}
        className="flex flex-col items-center justify-center p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        title="Restore from Checkpoint (Numbers)"
      >
        <Hash size={16} className="mb-1" />
        <span className="text-[10px]">CHK</span>
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".json"
      />
      <input 
        type="file" 
        ref={novelInputRef} 
        onChange={handleNovelChange} 
        className="hidden" 
        accept=".txt,.md"
      />
    </div>
  );
};

export default SystemOps;
