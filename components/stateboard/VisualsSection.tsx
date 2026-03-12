import React from 'react';
import { Image as ImageIcon, Loader } from 'lucide-react';

interface VisualsSectionProps {
  coverImage: string | null;
  isGeneratingCover: boolean;
  onGenerateCover: () => void;
}

const VisualsSection: React.FC<VisualsSectionProps> = ({ coverImage, isGeneratingCover, onGenerateCover }) => {
  return (
    <section>
      <div className="flex items-center justify-between text-slate-500 mb-2 uppercase tracking-wider font-bold">
        <span className="flex items-center gap-2"><ImageIcon size={14} /> Visuals</span>
        {coverImage && (
          <button onClick={onGenerateCover} disabled={isGeneratingCover} className="text-[10px] text-blue-400 hover:text-blue-300">
            {isGeneratingCover ? '...' : 'REGEN'}
          </button>
        )}
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden relative group min-h-[100px] flex items-center justify-center">
        {coverImage ? (
          <img src={coverImage} alt="Story Cover" className="w-full h-auto object-cover" />
        ) : (
          <button 
            onClick={onGenerateCover}
            disabled={isGeneratingCover}
            className="flex flex-col items-center justify-center p-6 text-slate-600 hover:text-blue-400 hover:bg-slate-900/50 w-full transition-colors"
          >
            {isGeneratingCover ? <Loader className="animate-spin mb-2" size={20}/> : <ImageIcon className="mb-2" size={20} />}
            <span className="text-[10px] uppercase">{isGeneratingCover ? "Generating..." : "Generate Cover"}</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default VisualsSection;
