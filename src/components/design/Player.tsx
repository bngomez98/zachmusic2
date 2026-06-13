import React, { useState } from 'react';

export default function Player() {
  const [playing, setPlaying] = useState(false);
  return (
    <section
      id="player"
      aria-label="Audio player"
      className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-4 sticky bottom-4"
    >
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause' : 'Play'}
        className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Love and Madness</p>
        <p className="text-xs text-muted-foreground truncate">Zachary Walker · Original · 2023</p>
      </div>

      <div className="hidden sm:block w-40 h-1 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: playing ? '40%' : '0%', transition: 'width 0.4s ease' }}
        />
      </div>
    </section>
  );
}
