import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Props {
  src: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export default function VideoPlayer({ src, title, subtitle, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Disable right-click context menu on the video element to prevent "Save video as"
  const preventContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // Auto-hide controls after 2.5s of inactivity during playback
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 2500);
    }
  }, [playing]);

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }
  }, [playing]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play().catch(() => {}); setPlaying(true); }
    showControls();
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  };

  const handleEnded = () => { setPlaying(false); setProgress(0); setControlsVisible(true); };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || isNaN(v.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setProgress(pct * 100);
    showControls();
  };

  const skip = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
    showControls();
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentTime = duration ? (progress / 100) * duration : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Video player: ${title}`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          ref={containerRef}
          onClick={(e) => e.stopPropagation()}
          onMouseMove={showControls}
          className="relative w-full max-w-3xl bg-black rounded-xl overflow-hidden shadow-2xl select-none"
          style={{ cursor: controlsVisible ? 'default' : 'none' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close video player"
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Video element — no controls attribute = no native download button */}
          <video
            ref={videoRef}
            src={src}
            preload="metadata"
            playsInline
            onContextMenu={preventContextMenu}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onClick={toggle}
            className="w-full aspect-video bg-black block"
            aria-label={title}
            // Explicitly no 'controls' prop = browser chrome stripped
          />

          {/* Custom controls overlay */}
          <AnimatePresence>
            {controlsVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-4"
              >
                {/* Title row */}
                <div className="mb-3">
                  <p className="text-white text-sm font-semibold leading-tight">{title}</p>
                  {subtitle && <p className="text-white/50 text-xs">{subtitle}</p>}
                </div>

                {/* Seek bar */}
                <div
                  className="w-full h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer mb-3"
                  onClick={seek}
                  role="slider"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Video progress"
                >
                  <div
                    className="h-full bg-accent rounded-full transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Rewind 10s */}
                    <button
                      onClick={() => skip(-10)}
                      aria-label="Rewind 10 seconds"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <text x="7.5" y="15.5" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">10</text>
                      </svg>
                    </button>

                    {/* Play / Pause */}
                    <button
                      onClick={toggle}
                      aria-label={playing ? 'Pause' : 'Play'}
                      className="w-10 h-10 rounded-full bg-accent text-base flex items-center justify-center hover:bg-accent/90 transition-colors"
                    >
                      {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>

                    {/* Forward 10s */}
                    <button
                      onClick={() => skip(10)}
                      aria-label="Skip forward 10 seconds"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <text x="7.5" y="15.5" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">10</text>
                      </svg>
                    </button>

                    {/* Mute toggle */}
                    <button
                      onClick={() => {
                        const v = videoRef.current;
                        if (!v) return;
                        v.muted = !v.muted;
                        setMuted(v.muted);
                      }}
                      aria-label={muted ? 'Unmute' : 'Mute'}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>

                  {/* Time display */}
                  <span className="text-white/60 text-[11px] font-mono tabular-nums">
                    {fmt(currentTime)} / {fmt(duration)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
