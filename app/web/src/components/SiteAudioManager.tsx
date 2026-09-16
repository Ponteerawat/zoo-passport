"use client";

import { useEffect, useRef } from "react";

const MUSIC_KEY = "zoo_music_enabled";

export default function SiteAudioManager() {
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const isEnabled = () => localStorage.getItem(MUSIC_KEY) === "true";

    const playNote = () => {
      const ctx = ctxRef.current;
      if (!ctx || !isEnabled()) return;
      const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.value = notes[stepRef.current++ % notes.length];
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    };

    const startMusic = () => {
      if (!isEnabled()) return;
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new AudioContext();
      }
      void ctxRef.current.resume();
      unlockedRef.current = true;
      if (timerRef.current === null) {
        playNote();
        timerRef.current = window.setInterval(playNote, 900);
      }
    };

    const stopMusic = () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      ctxRef.current?.suspend();
    };

    const sync = () => {
      if (isEnabled()) startMusic();
      else stopMusic();
    };

    const unlock = () => {
      if (isEnabled()) startMusic();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("storage", sync);
    window.addEventListener("zoo-settings-change", sync);
    sync();

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("storage", sync);
      window.removeEventListener("zoo-settings-change", sync);
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return null;
}
