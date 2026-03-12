import React, { useState } from 'react';
import { Volume2, StopCircle } from 'lucide-react';

interface AudioControlProps {
  ttsSupported: boolean;
  ttsVoices: SpeechSynthesisVoice[];
  ttsSelectedVoice: SpeechSynthesisVoice | null;
  ttsEnabled: boolean;
  isSpeaking: boolean;
  onSetTTSVoice: (voice: SpeechSynthesisVoice) => void;
  onToggleTTS: (enabled: boolean) => void;
  onStopTTS: () => void;
}

const AudioControl: React.FC<AudioControlProps> = ({
  ttsSupported,
  ttsVoices,
  ttsSelectedVoice,
  ttsEnabled,
  isSpeaking,
  onSetTTSVoice,
  onToggleTTS,
  onStopTTS
}) => {
  const [showAudio, setShowAudio] = useState(true);

  if (!ttsSupported) return null;

  return (
    <section>
      <div 
        className="flex justify-between items-center text-slate-500 mb-2 uppercase tracking-wider font-bold cursor-pointer hover:text-slate-300" 
        onClick={() => setShowAudio(!showAudio)}
      >
        <span className="flex items-center gap-2"><Volume2 size={14} /> Audio Link</span>
        <span className="text-[10px]">{showAudio ? '▼' : '▶'}</span>
      </div>
      
      {showAudio && (
        <div className="bg-slate-950 border border-slate-800 p-2 rounded animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Auto-Read</span>
            <button 
              onClick={() => onToggleTTS(!ttsEnabled)}
              className={`w-8 h-4 rounded-full relative transition-colors ${ttsEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${ttsEnabled ? 'left-4.5' : 'left-0.5'}`} style={{ left: ttsEnabled ? 'calc(100% - 14px)' : '2px' }}></span>
            </button>
          </div>
          
          <select 
            value={ttsSelectedVoice?.voiceURI || ''}
            onChange={(e) => {
              const voice = ttsVoices.find(v => v.voiceURI === e.target.value);
              if (voice) onSetTTSVoice(voice);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-200 p-1 mb-2 focus:outline-none"
          >
            {ttsVoices.map((v, idx) => (
              <option key={`${v.voiceURI}-${idx}`} value={v.voiceURI} className="bg-slate-900 text-slate-200">
                {v.name.replace('Google', '').substring(0,25)} ({v.lang})
              </option>
            ))}
          </select>

          {isSpeaking && (
            <button 
              onClick={onStopTTS}
              className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded py-1 text-[10px]"
            >
              <StopCircle size={10} /> STOP AUDIO
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default AudioControl;
