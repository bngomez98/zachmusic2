import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';

interface TrackInfo {
  src: string;
  title: string;
}

function titleFromSrc(src: string): string {
  const name = src.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Unknown';
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const src = detail?.src as string;
      if (!src) return;
      setTrack({ src, title: detail?.title || titleFromSrc(src) });
    };
    window.addEventListener('zw:open-player', handler);
    return () => window.removeEventListener('zw:open-player', handler);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;

    if (el.src !== new URL(track.src, location.origin).href) {
      el.src = track.src;
      el.load();
    }
    el.play().catch(() => {});
  }, [track]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => { setPlaying(false); setCurrentTime(0); };

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * duration;
  };

  const close = () => {
    const el = audioRef.current;
    if (el) { el.pause(); el.currentTime = 0; }
    setTrack(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="metadata" muted={muted} />
      <AnimatePresence>
        {track && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[160] bg-surface/95 backdrop-blur-xl border-t border-white/10"
          >
            <div
              className="absolute top-0 left-0 h-[2px] bg-accent transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center gap-3 sm:gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 hover:bg-accent/90 transition-colors"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <Pause size={18} className="text-base fill-current" />
                ) : (
                  <Play size={18} className="text-base fill-current ml-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-main truncate">{track.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-text-muted/70 w-8 text-right flex-shrink-0">{fmt(currentTime)}</span>
                  <div
                    className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
                    onClick={seek}
                    role="slider"
                    aria-label="Seek"
                    aria-valuemin={0}
                    aria-valuemax={Math.floor(duration)}
                    aria-valuenow={Math.floor(currentTime)}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-accent rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted/70 w-8 flex-shrink-0">{fmt(duration)}</span>
                </div>
              </div>

              <button
                onClick={() => setMuted(!muted)}
                className="hidden sm:flex text-text-muted hover:text-accent transition-colors p-1.5"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={close}
                className="text-text-muted hover:text-accent transition-colors p-1.5"
                aria-label="Close player"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
