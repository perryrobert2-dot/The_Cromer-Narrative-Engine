import { useState, useEffect, useCallback } from 'react';

interface TTSHook {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  isSpeaking: boolean;
  isSupported: boolean;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  speak: (text: string) => void;
  cancel: () => void;
}

export const useTTS = (): TTSHook => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        // Sort to prioritize Google voices, then English
        available.sort((a, b) => {
           const aGoogle = a.name.includes('Google');
           const bGoogle = b.name.includes('Google');
           if (aGoogle && !bGoogle) return -1;
           if (!aGoogle && bGoogle) return 1;
           return 0;
        });
        setVoices(available);

        // Set default voice (Google US English if available, else first available)
        const defaultVoice = available.find(v => v.name.includes('Google US English')) 
                          || available.find(v => v.lang.startsWith('en')) 
                          || available[0];
        if (defaultVoice) {
            setSelectedVoice(defaultVoice);
        }
      };

      loadVoices();
      
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !selectedVoice) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    voices,
    selectedVoice,
    isSpeaking,
    isSupported,
    setVoice: setSelectedVoice,
    speak,
    cancel
  };
};