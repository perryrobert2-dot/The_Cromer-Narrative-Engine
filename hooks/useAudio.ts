import { useState, useEffect, useCallback } from 'react';

export function useAudio() {
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsSelectedVoice, setTtsSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsSupported(true);
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setTtsVoices(voices);
        if (voices.length > 0 && !ttsSelectedVoice) {
          const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
          setTtsSelectedVoice(preferred);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [ttsSelectedVoice]);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !ttsSupported || !ttsSelectedVoice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = ttsSelectedVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, ttsSupported, ttsSelectedVoice]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    ttsSupported,
    ttsVoices,
    ttsSelectedVoice,
    ttsEnabled,
    isSpeaking,
    setTtsSelectedVoice,
    setTtsEnabled,
    speak,
    stopSpeaking
  };
}
