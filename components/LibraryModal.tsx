import React, { useEffect, useState } from 'react';
import { StoryMetadata } from '../types';
import { getAllStoriesMetadata, deleteStoryById } from '../services/db';
import { BookOpen, Trash2, Plus, Clock, FileText } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadStory: (id: string) => void;
  onNewStory: (axioms?: any) => void;
}

const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, onLoadStory, onNewStory }) => {
  const [stories, setStories] = useState<StoryMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState<'none' | 'genre' | 'currency' | 'secondary' | 'friction' | 'penalty'>('none');
  const [customAxioms, setCustomAxioms] = useState({
    genre: '',
    currency: 'Mana',
    secondaryCurrency: 'Money',
    friction: 'Viscosity',
    penalty: 'Causal Debt',
    recoveryRate: 0.2,
    isTransactional: true
  });

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStoriesMetadata();
      setStories(data);
    } catch (e) {
      console.error("Failed to fetch stories", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStories();
      setWizardStep('none');
    }
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this story irrevocably?")) {
        await deleteStoryById(id);
        fetchStories();
    }
  };

  const startWizard = () => setWizardStep('genre');
  
  const finishWizard = () => {
    onNewStory({
      genre: customAxioms.genre,
      currency: customAxioms.currency,
      secondaryCurrency: customAxioms.secondaryCurrency,
      friction: customAxioms.friction,
      penalty: customAxioms.penalty,
      recoveryRate: customAxioms.recoveryRate,
      isTransactional: customAxioms.isTransactional
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-mono font-bold text-slate-200 flex items-center gap-3">
                <BookOpen className="text-blue-500" /> 
                {wizardStep === 'none' ? "Narrative Library" : "Genre Synthesis Wizard"}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors font-mono text-sm">
                [ESC]
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/30">
            {wizardStep === 'none' ? (
                isLoading ? (
                    <div className="text-center text-slate-500 mt-20 font-mono animate-pulse">ACCESSING DATABASE...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        {/* New Story Card */}
                        <button 
                            onClick={startWizard}
                            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
                        >
                            <div className="bg-slate-800 p-4 rounded-full mb-3 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                                <Plus size={24} className="text-emerald-500" />
                            </div>
                            <span className="font-mono text-sm text-slate-400 group-hover:text-emerald-400 tracking-widest">INIT NEW PROTOCOL</span>
                        </button>

                        {/* Story Cards */}
                        {stories.map(story => (
                            <div 
                                key={story.id}
                                onClick={() => { onLoadStory(story.id); onClose(); }}
                                className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all cursor-pointer group flex flex-col h-48 relative"
                            >
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleDelete(e, story.id)}
                                        className="p-2 bg-slate-900 rounded-full text-slate-500 hover:text-red-400 hover:bg-slate-800 border border-slate-700"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                            {story.mode}
                                        </span>
                                    </div>
                                    <h3 className="font-serif font-bold text-slate-200 text-lg line-clamp-1 mb-1 group-hover:text-blue-400 transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs line-clamp-3 font-serif italic leading-relaxed">
                                        {story.excerpt || "No content generated yet."}
                                    </p>
                                </div>
                                
                                <div className="bg-slate-900/80 p-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} /> {new Date(story.lastUpdated).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={10} /> {story.wordCount.toLocaleString()} w
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="max-w-2xl mx-auto py-10">
                    {wizardStep === 'genre' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Step 01: Narrative Domain</label>
                                <h3 className="text-2xl font-serif text-slate-100">What is the genre or setting?</h3>
                                <p className="text-slate-400 text-sm">Define the world. e.g., "Cyberpunk Regency", "LitRPG Apocalypse", "Noir Space Opera".</p>
                            </div>
                            <input 
                                autoFocus
                                type="text" 
                                value={customAxioms.genre}
                                onChange={e => setCustomAxioms({...customAxioms, genre: e.target.value})}
                                placeholder="Enter genre..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-serif text-lg"
                                onKeyDown={e => e.key === 'Enter' && customAxioms.genre && setWizardStep('currency')}
                            />
                            <button 
                                disabled={!customAxioms.genre}
                                onClick={() => setWizardStep('currency')}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-mono py-4 rounded-lg transition-colors tracking-widest uppercase text-sm"
                            >
                                Define Physics →
                            </button>
                        </div>
                    )}

                    {wizardStep === 'currency' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Step 02: Primary Currency</label>
                                <h3 className="text-2xl font-serif text-slate-100">What is the "Resource" of this world?</h3>
                                <p className="text-slate-400 text-sm">This is the fuel for actions. In LitRPG it's Mana; in Regency it's Reputation.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Mana', 'Reputation', 'Essence', 'Chrome Stability', 'Sanity', 'Cash'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setCustomAxioms({...customAxioms, currency: c})}
                                        className={`p-4 rounded-lg border font-mono text-sm transition-all ${customAxioms.currency === c ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={customAxioms.currency}
                                onChange={e => setCustomAxioms({...customAxioms, currency: e.target.value})}
                                placeholder="Or enter custom currency..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-emerald-500 outline-none font-mono text-sm"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setWizardStep('genre')} className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-lg font-mono text-sm hover:bg-slate-800">← Back</button>
                                <button onClick={() => setWizardStep('secondary')} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-mono text-sm tracking-widest uppercase">Next Step →</button>
                            </div>
                        </div>
                    )}

                    {wizardStep === 'secondary' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Step 03: Secondary Currency</label>
                                <h3 className="text-2xl font-serif text-slate-100">What is the "Secondary Resource"?</h3>
                                <p className="text-slate-400 text-sm">This is an auxiliary resource. e.g., Money, Health, Sanity, or Stamina.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Money', 'Health', 'Sanity', 'Stamina', 'Experience', 'None'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => setCustomAxioms({...customAxioms, secondaryCurrency: c === 'None' ? '' : c})}
                                        className={`p-4 rounded-lg border font-mono text-sm transition-all ${customAxioms.secondaryCurrency === (c === 'None' ? '' : c) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={customAxioms.secondaryCurrency}
                                onChange={e => setCustomAxioms({...customAxioms, secondaryCurrency: e.target.value})}
                                placeholder="Or enter custom secondary currency..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-emerald-500 outline-none font-mono text-sm"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setWizardStep('currency')} className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-lg font-mono text-sm hover:bg-slate-800">← Back</button>
                                <button onClick={() => setWizardStep('friction')} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-mono text-sm tracking-widest uppercase">Next Step →</button>
                            </div>
                        </div>
                    )}

                    {wizardStep === 'friction' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Step 04: World Friction</label>
                                <h3 className="text-2xl font-serif text-slate-100">What makes progress difficult?</h3>
                                <p className="text-slate-400 text-sm">This is the "Viscosity" of the world. High values make actions more expensive.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Viscosity', 'Social Propriety', 'Gravity', 'System Tier', 'Reality Resistance', 'Exhaustion'].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setCustomAxioms({...customAxioms, friction: f})}
                                        className={`p-4 rounded-lg border font-mono text-sm transition-all ${customAxioms.friction === f ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={customAxioms.friction}
                                onChange={e => setCustomAxioms({...customAxioms, friction: e.target.value})}
                                placeholder="Or enter custom friction..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-emerald-500 outline-none font-mono text-sm"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setWizardStep('secondary')} className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-lg font-mono text-sm hover:bg-slate-800">← Back</button>
                                <button onClick={() => setWizardStep('penalty')} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-mono text-sm tracking-widest uppercase">Next Step →</button>
                            </div>
                        </div>
                    )}

                    {wizardStep === 'penalty' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Step 05: The Penalty</label>
                                <h3 className="text-2xl font-serif text-slate-100">What is the cost of failure?</h3>
                                <p className="text-slate-400 text-sm">When you over-reach, this value increases. It represents the "Debt" to the world.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Causal Debt', 'System Anomaly', 'Social Exile', 'Corruption', 'Entropy', 'Heat'].map(p => (
                                    <button 
                                        key={p}
                                        onClick={() => setCustomAxioms({...customAxioms, penalty: p})}
                                        className={`p-4 rounded-lg border font-mono text-sm transition-all ${customAxioms.penalty === p ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={customAxioms.penalty}
                                onChange={e => setCustomAxioms({...customAxioms, penalty: e.target.value})}
                                placeholder="Or enter custom penalty..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:border-emerald-500 outline-none font-mono text-sm"
                            />
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setWizardStep('friction')} className="flex-1 border border-slate-700 text-slate-400 py-3 rounded-lg font-mono text-sm hover:bg-slate-800">← Back</button>
                                <button 
                                    onClick={finishWizard}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-mono text-sm tracking-[0.2em] uppercase font-bold shadow-lg shadow-blue-900/20"
                                >
                                    Synthesize Reality →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LibraryModal;