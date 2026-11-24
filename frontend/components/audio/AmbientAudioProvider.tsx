"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

interface AmbientAudioContextType {
  isMuted: boolean;
  isPlaying: boolean;
  toggleSound: () => void;
  volume: number;
}

const AmbientAudioContext = createContext<AmbientAudioContextType>({
  isMuted: true,
  isPlaying: false,
  toggleSound: () => {},
  volume: 0,
});

export const useAmbientAudio = () => useContext(AmbientAudioContext);

const TARGET_VOLUME = 0.45; // Gentle cinematic ambient level
const FADE_IN_MS = 1500;
const FADE_OUT_MS = 1200;
const STORAGE_KEY = "hirelens_ambient_audio";

export function AmbientAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeAnimRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);

  // Smooth Volume Lerp Function using high-precision performance.now()
  const fadeVolume = useCallback((targetVol: number, durationMs: number, onComplete?: () => void) => {
    if (fadeAnimRef.current) {
      cancelAnimationFrame(fadeAnimRef.current);
    }

    const audio = audioRef.current;
    if (!audio) return;

    const startVol = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth cosine easing curve (easeInOut)
      const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);
      const nextVol = startVol + (targetVol - startVol) * ease;

      const clampedVol = Math.max(0, Math.min(1, nextVol));
      audio.volume = clampedVol;
      setCurrentVolume(clampedVol);

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(step);
      } else {
        audio.volume = targetVol;
        setCurrentVolume(targetVol);
        if (onComplete) onComplete();
      }
    };

    fadeAnimRef.current = requestAnimationFrame(step);
  }, []);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio("/audio/interstellar-theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    // Safety fallback for seamless looping
    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener("ended", handleEnded);

    // Read stored user preference
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState === "unmuted") {
        // We know the user previously wanted sound.
        // We comply with browser autoplay by waiting for the first user interaction
        const startOnFirstGesture = () => {
          window.removeEventListener("pointerdown", startOnFirstGesture);
          window.removeEventListener("keydown", startOnFirstGesture);
          if (audioRef.current) {
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              setIsMuted(false);
              fadeVolume(TARGET_VOLUME, FADE_IN_MS);
            }).catch(() => {});
          }
        };

        window.addEventListener("pointerdown", startOnFirstGesture, { once: true });
        window.addEventListener("keydown", startOnFirstGesture, { once: true });
      }
    } catch {
      // localStorage may be unavailable in some private browsing modes
    }

    return () => {
      if (fadeAnimRef.current) cancelAnimationFrame(fadeAnimRef.current);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, [fadeVolume]);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      // Unmute & Fade In
      setIsMuted(false);
      try {
        localStorage.setItem(STORAGE_KEY, "unmuted");
      } catch {}

      audio.play().then(() => {
        setIsPlaying(true);
        fadeVolume(TARGET_VOLUME, FADE_IN_MS);
      }).catch((err) => {
        console.warn("Audio playback gesture required:", err);
      });
    } else {
      // Mute & Fade Out
      setIsMuted(true);
      try {
        localStorage.setItem(STORAGE_KEY, "muted");
      } catch {}

      fadeVolume(0, FADE_OUT_MS, () => {
        audio.pause();
        setIsPlaying(false);
      });
    }
  };

  return (
    <AmbientAudioContext.Provider
      value={{
        isMuted,
        isPlaying,
        toggleSound,
        volume: currentVolume,
      }}
    >
      {children}
    </AmbientAudioContext.Provider>
  );
}
