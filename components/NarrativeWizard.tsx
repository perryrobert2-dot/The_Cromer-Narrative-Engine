import React, { useState } from 'react';
import { GENRE_PRESETS, GenrePreset } from '../src/constants/presets';
import { AxiomDefinition, NarrativeIntent, NarrativeMode } from '../types';
import { 
  Sparkles, Target, Shield, Zap, ChevronRight, ChevronLeft, Play, Settings2,
  Gamepad2, Mountain, Moon, Eye, Skull, Cpu, Sword, Search,
  BookOpen, Wand2, Ghost, FlaskConical, Heart, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GENRE_ICONS: Record<string, any> = {
  'litrpg': Gamepad2,
  'cultivation': Mountain,
  'shifter': Moon,
  'thriller': Eye,
  'grimdark': Skull,
  'cyberpunk': Cpu,
  'fantasy': Sword,
  'noir': Search,
  'default': BookOpen
};

interface NarrativeWizardProps {
  onInitialize: (config: {
    genre: string;
    intent: NarrativeIntent;
    axioms: AxiomDefinition;
    grand_objective: string;
    pillars: string[];
    initial_prompt: string;
    mode: NarrativeMode;
    antagonistMirroring: boolean;
    voice: string;
    style: string;
    density: number;
    temperature: number;
    abstractness: number;
  }) => void;
}

const NarrativeWizard: React.FC<NarrativeWizardProps> = ({ onInitialize }) => {
  const [step, setStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([GENRE_PRESETS[0].name]);
  const [customGenreName, setCustomGenreName] = useState("Solarpunk Mystery");
  const [customAxioms, setCustomAxioms] = useState<AxiomDefinition>(GENRE_PRESETS[0].axioms);
  const [isCustom, setIsCustom] = useState(false);
  
  const [grandObjective, setGrandObjective] = useState(GENRE_PRESETS[0].lodge || "");
  const [pillars, setPillars] = useState<string[]>(GENRE_PRESETS[0].pillars || ["", "", ""]);
  const [initialPrompt, setInitialPrompt] = useState(GENRE_PRESETS[0].spark || "");
  const [mode, setMode] = useState<NarrativeMode>('Novella');
  const [antagonistMirroring, setAntagonistMirroring] = useState(true);
  
  const [voice, setVoice] = useState(GENRE_PRESETS[0].style || "Hard-boiled");
  const [style, setStyle] = useState("Neutral/Adaptive");
  const [density, setDensity] = useState(0.7);
  const [temperature, setTemperature] = useState(0.3);
  const [abstractness, setAbstractness] = useState(0.2);
  const [image, setImage] = useState<string | null>(null);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleGenre = (genreId: string) => {
    const preset = GENRE_PRESETS.find(p => p.id === genreId);
    if (!preset) return;

    const isAlreadySelected = selectedGenres.includes(preset.name);

    if (isAlreadySelected) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter(g => g !== preset.name));
      } else {
        // If it's the only one, allow re-prefilling as a "reset"
        if (preset.lodge) setGrandObjective(preset.lodge);
        if (preset.pillars) setPillars([...preset.pillars]);
        if (preset.spark) setInitialPrompt(preset.spark);
        if (preset.style) setVoice(preset.style);
        setCustomAxioms(preset.axioms);
      }
    } else {
      setSelectedGenres([...selectedGenres, preset.name]);
      // Prefill logic
      if (preset.lodge) setGrandObjective(preset.lodge);
      if (preset.pillars) setPillars([...preset.pillars]);
      if (preset.spark) setInitialPrompt(preset.spark);
      if (preset.style) setVoice(preset.style);
      setCustomAxioms(preset.axioms);
    }
  };

  const handleInitialize = () => {
    const primaryPreset = GENRE_PRESETS.find(p => selectedGenres.includes(p.name)) || GENRE_PRESETS[0];
    onInitialize({
      genre: isCustom ? customGenreName : selectedGenres.join(' + '),
      intent: primaryPreset.intent,
      axioms: isCustom ? customAxioms : primaryPreset.axioms,
      grand_objective: grandObjective,
      pillars: pillars.filter(p => p.trim() !== ""),
      initial_prompt: initialPrompt,
      mode,
      antagonistMirroring,
      voice,
      style,
      density,
      temperature,
      abstractness,
      image: image || undefined
    });
  };

  const updatePillar = (index: number, value: string) => {
    const newPillars = [...pillars];
    newPillars[index] = value;
    setPillars(newPillars);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-950 p-8 border-r border-slate-800 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">CROMER</h1>
          </div>

          <nav className="space-y-6 flex-1">
            {[
              { id: 1, label: 'Axioms', icon: Zap },
              { id: 2, label: 'The Lodge', icon: Target },
              { id: 3, label: 'Pillars', icon: Shield },
              { id: 4, label: 'The Spark', icon: Play },
              { id: 5, label: 'Aesthetics', icon: Sparkles },
            ].map(s => (
              <div 
                key={s.id}
                className={`flex items-center gap-3 transition-colors ${step === s.id ? 'text-emerald-400' : step > s.id ? 'text-slate-400' : 'text-slate-600'}`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono ${step === s.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className="text-sm font-medium uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-800">
             <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Pantomime Protocol v1.1</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Define the Physics</h2>
                  <p className="text-slate-400">Select genres to create a hybrid manifold or customize the axioms.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {GENRE_PRESETS.map(preset => {
                    const Icon = GENRE_ICONS[preset.id] || GENRE_ICONS.default;
                    const isSelected = selectedGenres.includes(preset.name) && !isCustom;
                    
                    return (
                      <button
                        key={preset.id}
                        onClick={() => { toggleGenre(preset.id); setIsCustom(false); }}
                        className={`group relative p-4 rounded-2xl border text-left transition-all h-32 flex flex-col justify-between overflow-hidden ${isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800'}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-600 group-hover:text-slate-400'}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <span className="block text-[10px] font-mono uppercase tracking-widest opacity-50 mb-1">{preset.intent}</span>
                          <span className="text-xs font-bold uppercase tracking-wider leading-tight">{preset.name}</span>
                        </div>
                        {/* Decorative background icon */}
                        <Icon size={64} className={`absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-110 ${isSelected ? 'text-emerald-500' : 'text-white'}`} />
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      if (!isCustom) {
                        setCustomGenreName(selectedGenres.join(' + '));
                      }
                      setIsCustom(true);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all h-32 flex flex-col justify-between ${isCustom ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCustom ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-600'}`}>
                      <Settings2 size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Custom Hybrid</span>
                  </button>
                </div>

                {isCustom && (
                  <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Custom Genre Name</label>
                      <input 
                        className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-base text-white focus:border-blue-500 outline-none font-display font-bold"
                        placeholder="e.g., Solarpunk Mystery, Biopunk Horror..."
                        value={customGenreName}
                        onChange={e => setCustomGenreName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Primary Resource</label>
                        <input 
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-sm text-white focus:border-blue-500 outline-none"
                          value={customAxioms.currency}
                          onChange={e => setCustomAxioms({...customAxioms, currency: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Environmental Friction</label>
                        <input 
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-sm text-white focus:border-blue-500 outline-none"
                          value={customAxioms.friction}
                          onChange={e => setCustomAxioms({...customAxioms, friction: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Narrative Penalty</label>
                        <input 
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-sm text-white focus:border-blue-500 outline-none"
                          value={customAxioms.penalty}
                          onChange={e => setCustomAxioms({...customAxioms, penalty: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Recovery Rate (0-1)</label>
                        <input 
                          type="number" step="0.1" min="0" max="1"
                          className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-sm text-white focus:border-blue-500 outline-none"
                          value={customAxioms.recoveryRate}
                          onChange={e => setCustomAxioms({...customAxioms, recoveryRate: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">The Lodge</h2>
                  <p className="text-slate-400">Define the implicit ending. What is the "Win State" at the bottom of the hill?</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Grand Objective (Point Z)</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-lg text-white font-serif focus:border-emerald-500 outline-none min-h-[150px]"
                    placeholder="e.g., The protagonist uncovers the ancient conspiracy and restores balance to the realm, regardless of the personal cost."
                    value={grandObjective}
                    onChange={e => setGrandObjective(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 italic">This coordinate acts as narrative gravity, pulling the story toward resolution regardless of the path taken.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Story Length (Topology Scale)</label>
                  <div className="flex gap-4">
                    {(['Short Story', 'Novella', 'Novel', 'Open Ended Web Serial'] as NarrativeMode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg border text-xs font-mono transition-all ${mode === m ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Narrative Pillars</h2>
                  <p className="text-slate-400">Define 3 core truths about this world. These are the "Hard Constraints" of the topology.</p>
                </div>

                <div className="space-y-4">
                  {pillars.map((p, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <span className="text-slate-700 font-mono text-xs">0{i+1}</span>
                      <input 
                        className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:border-emerald-500 outline-none"
                        placeholder={`Pillar ${i+1}...`}
                        value={p}
                        onChange={e => updatePillar(i, e.target.value)}
                      />
                    </div>
                  ))}
                  <button 
                    onClick={() => setPillars([...pillars, ""])}
                    className="text-[10px] text-slate-500 hover:text-emerald-400 uppercase font-mono tracking-widest transition-colors"
                  >
                    + Add Pillar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">The Spark</h2>
                  <p className="text-slate-400">The inciting incident. How does the descent begin?</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Initial Prompt</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        id="wizard-image" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                      <label 
                        htmlFor="wizard-image"
                        className={`text-[10px] px-2 py-1 rounded border font-mono cursor-pointer transition-all ${image ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                      >
                        {image ? '✓ Image Attached' : '+ Attach Mind Map/Reference'}
                      </label>
                    </div>
                  </div>
                  {image && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-emerald-500/50 group">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImage(null)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-mono uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-lg text-white font-serif focus:border-emerald-500 outline-none min-h-[150px]"
                    placeholder="Describe the opening scene..."
                    value={initialPrompt}
                    onChange={e => setInitialPrompt(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                   <div className="flex items-center gap-3">
                      <Shield size={20} className="text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Antagonist Mirroring</h4>
                        <p className="text-xs text-slate-500">Generate a world-hook (The Antagonist) to contrast with the protagonist.</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setAntagonistMirroring(!antagonistMirroring)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${antagonistMirroring ? 'bg-emerald-600' : 'bg-slate-700'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${antagonistMirroring ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Voice Vectors</h2>
                  <p className="text-slate-400">Calibrate the narrative voice along these continuums.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Primary Voice Style</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:border-emerald-500 outline-none"
                      placeholder="e.g., Hard-boiled, Mythic..."
                      value={voice}
                      onChange={e => setVoice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Tone Style</label>
                    <input 
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:border-emerald-500 outline-none"
                      placeholder="e.g., Melancholic, Clinical..."
                      value={style}
                      onChange={e => setStyle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Linguistic Density</label>
                      <span className="text-xs font-mono text-emerald-400">{Math.round(density * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1"
                      className="w-full accent-emerald-500"
                      value={density}
                      onChange={e => setDensity(parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 uppercase font-mono">
                      <span>Sparse</span>
                      <span>Ornate</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Emotional Temperature</label>
                      <span className="text-xs font-mono text-emerald-400">{Math.round(temperature * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1"
                      className="w-full accent-emerald-500"
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 uppercase font-mono">
                      <span>Clinical</span>
                      <span>Empathetic</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Abstractness</label>
                      <span className="text-xs font-mono text-emerald-400">{Math.round(abstractness * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1"
                      className="w-full accent-emerald-500"
                      value={abstractness}
                      onChange={e => setAbstractness(parseFloat(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 uppercase font-mono">
                      <span>Concrete</span>
                      <span>Surreal</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                   <div className="flex items-center gap-3 text-emerald-400 mb-2">
                      <Sparkles size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Final Calibration</span>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed">
                     The engine will now lock these aesthetics. The story will respect your pillars and topology, meandering as needed but always pulling toward your Grand Objective.
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="mt-auto pt-8 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase font-mono text-xs tracking-widest"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button 
                onClick={handleNext}
                disabled={step === 2 && !grandObjective}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleInitialize}
                disabled={!initialPrompt}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-emerald-600/30 animate-pulse hover:animate-none"
              >
                Initialize Engine <Play size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NarrativeWizard;
