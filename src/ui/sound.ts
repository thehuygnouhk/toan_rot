import { useSyncExternalStore } from 'react';

// Âm thanh nhỏ xinh tạo bằng Web Audio — không cần file âm thanh.
const KEY = 'toanrot.sound';
const listeners = new Set<() => void>();

function readSetting(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

let soundOn = readSetting();

export function setSoundOn(on: boolean) {
  soundOn = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* trình duyệt chặn lưu trữ: vẫn dùng trong phiên này */
  }
  if (!on) window.speechSynthesis?.cancel();
  listeners.forEach((l) => l());
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => soundOn,
  );
}

export function isSoundOn() {
  return soundOn;
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (!soundOn) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.18) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  correct: () => {
    tone(1046.5, 0, 0.18, 'sine');
    tone(1318.5, 0.1, 0.28, 'sine');
  },
  /** Tiếng "bụp" nhẹ, không gây sợ. */
  tryAgain: () => tone(330, 0, 0.18, 'triangle', 0.1),
  reward: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.25, 'sine', 0.15)),
  fill: () => tone(880 + Math.random() * 200, 0, 0.15, 'sine', 0.1),
};
