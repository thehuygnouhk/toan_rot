import { useEffect, useState } from 'react';
import { isSoundOn } from './sound';

// Đọc to bằng giọng tiếng Việt có sẵn trong trình duyệt (Web Speech API).

function vietnameseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return voices.find((v) => v.lang.toLowerCase().startsWith('vi'));
}

export function speak(text: string) {
  const synth = window.speechSynthesis;
  if (!synth || !isSoundOn()) return;
  const voice = vietnameseVoice();
  if (!voice) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.9;
  synth.speak(u);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

/** Máy có giọng tiếng Việt không (danh sách giọng có thể tải chậm). */
export function useHasVietnameseVoice(): boolean {
  const [has, setHas] = useState(() => typeof window !== 'undefined' && !!vietnameseVoice());
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const update = () => setHas(!!vietnameseVoice());
    synth.addEventListener('voiceschanged', update);
    const timer = window.setTimeout(update, 500);
    return () => {
      synth.removeEventListener('voiceschanged', update);
      window.clearTimeout(timer);
    };
  }, []);
  return has;
}
