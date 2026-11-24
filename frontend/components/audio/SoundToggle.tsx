"use client";

import { useAmbientAudio } from "./AmbientAudioProvider";
import { Volume2, VolumeX } from "lucide-react";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { isMuted, toggleSound } = useAmbientAudio();

  return (
    <button
      onClick={toggleSound}
      type="button"
      className={`relative h-9 px-3 rounded-full border transition-all flex items-center gap-2 apple-press cursor-pointer select-none ${
        !isMuted
          ? "border-accent/40 bg-accent/10 text-accent glow-cyan shadow-sm"
          : "border-border/70 hover:bg-secondary/80 text-muted hover:text-foreground"
      } ${className}`}
      aria-label={isMuted ? "Unmute Interstellar Ambient Theme" : "Mute Interstellar Ambient Theme"}
      title={
        isMuted
          ? "Play Ambient Theme (Hans Zimmer — Interstellar)"
          : "Mute Ambient Theme (Hans Zimmer — Interstellar)"
      }
    >
      {/* Icon */}
      {!isMuted ? (
        <Volume2 className="h-4 w-4 text-accent shrink-0 animate-pulse" strokeWidth={1.75} />
      ) : (
        <VolumeX className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
      )}

      {/* Track Label on Desktop */}
      <span className="hidden xl:inline text-[11px] font-medium tracking-tight">
        {!isMuted ? "Interstellar" : "Sound Off"}
      </span>

      {/* Mini Equalizer Wave Visualizer (Active when unmuted) */}
      {!isMuted ? (
        <div className="flex items-end gap-0.5 h-3.5 px-0.5" aria-hidden="true">
          <span className="w-0.5 bg-accent rounded-full animate-eq-1" />
          <span className="w-0.5 bg-accent rounded-full animate-eq-2" />
          <span className="w-0.5 bg-accent rounded-full animate-eq-3" />
        </div>
      ) : null}
    </button>
  );
}
