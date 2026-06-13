import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RELEASES } from '../data';
import { Play, Pause, Volume2, VolumeX, BookOpen, Clock, X, Heart, SkipBack, SkipForward, Loader2 } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
  chords?: string;
}

const SONG_LYRICS: Record<number, LyricLine[]> = {
  1: [
    { time: 0, text: "[Guitar Strum]", chords: "Em" },
    { time: 5, text: "Walking down the dusty road", chords: "C" },
    { time: 10, text: "Looking back at what we know", chords: "G" },
    { time: 15, text: "All these words got left behind", chords: "D" },
    { time: 20, text: "Echoes of a different mind", chords: "Em" },
    { time: 25, text: "Underneath the starry sky", chords: "C" },
    { time: 30, text: "Watching all the clouds roll by", chords: "G" },
    { time: 35, text: "This is beauty, this is living...", chords: "D" },
  ],
  2: [
    { time: 0, text: "[Ambient lounge noise & guitar tune-up]" },
    { time: 5, text: "Saturday night in the neon light", chords: "G" },
    { time: 10, text: "Wheatfield breeze a cozy sight", chords: "C" },
    { time: 15, text: "Fingerstyle blues on the steel strings", chords: "Em" },
    { time: 20, text: "Listen close to what it brings...", chords: "D" },
  ]
};

const audioUrl = '/loveandmadness.mp3';

export default function MusicSection() {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [previousVolume, setPreviousVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const TIME_OFFSET = 32;

  const formatTime = (timeInSeconds: number) => {
    if (!isFinite(timeInSeconds) || isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  const safePlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
    } catch (err) {
      console.error('Playback failed', err);
      setErrorMsg('Playback blocked by your browser. Tap play again to start.');
      setIsPlaying(false);
    }
  }, []);

  const toggleTrack = (trackId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg(null);

    if (activeTrack === trackId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        safePlay();
      }
    } else {
      audioRef.current?.pause();
      setActiveTrack(trackId);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.currentTime = TIME_OFFSET;
        safePlay();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const actualCurrent = audioRef.current.currentTime;
    if (actualCurrent < TIME_OFFSET && isPlaying) {
      audioRef.current.currentTime = TIME_OFFSET;
      return;
    }
    const current = Math.max(0, actualCurrent - TIME_OFFSET);
    const dur = Math.max(1, audioRef.current.duration - TIME_OFFSET);
    setCurrentTime(current);
    setDuration(dur);
    setProgress((current / dur) * 100);
  };

  const handleProgress = () => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const buf = audioRef.current.buffered;
    if (buf.length > 0) {
      const end = buf.end(buf.length - 1);
      const dur = Math.max(1, audioRef.current.duration - TIME_OFFSET);
      const adjusted = Math.max(0, end - TIME_OFFSET);
      setBufferedEnd((adjusted / dur) * 100);
    }
  };

  const seekTo = (percentage: number) => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const dur = Math.max(1, audioRef.current.duration - TIME_OFFSET);
    audioRef.current.currentTime = TIME_OFFSET + percentage * dur;
    setProgress(percentage * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    seekTo(Math.max(0, Math.min(1, x / bounds.width)));
  };

  const handleSeekKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); handleSkip(-5); }
    if (e.key === 'ArrowRight') { e.preventDefault(); handleSkip(5); }
    if (e.key === 'Home') { e.preventDefault(); seekTo(0); }
    if (e.key === 'End') { e.preventDefault(); seekTo(0.999); }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handlePauseToggle(); }
  };

  const handlePauseToggle = () => {
    if (!activeTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      safePlay();
    }
  };

  const handleSkip = (delta: number) => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    const dur = Math.max(1, audioRef.current.duration - TIME_OFFSET);
    const current = Math.max(0, audioRef.current.currentTime - TIME_OFFSET);
    const newTime = Math.max(0, Math.min(current + delta, dur));
    audioRef.current.currentTime = TIME_OFFSET + newTime;
    setProgress((newTime / dur) * 100);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 0.8);
    }
  };

  const activeRelease = RELEASES.find(r => r.id === activeTrack);
  const activeLyrics = activeTrack ? SONG_LYRICS[activeTrack] || [] : [];
  const reversedLyrics = [...activeLyrics].reverse();
  const currentLyricLine = reversedLyrics.find(line => currentTime >= line.time) || activeLyrics[0];

  return (
    <section id="music" className="bg-base py-32 text-text-main relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent mb-2 leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60"></span>
            Discography
            <span className="w-4 h-[1px] bg-accent/60"></span>
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">Music</h2>
          <div className="w-10 h-[1px] bg-accent/40" />
          <p className="text-text-muted text-base">Original acoustic arrangements & performances</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-16">
          {RELEASES.map((release, i) => {
            const isThisActive = activeTrack === release.id;
            return (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => release.hasAudio ? toggleTrack(release.id, e) : undefined}
                className={`group ${release.hasAudio ? 'cursor-pointer' : 'cursor-default'} block border rounded-2xl overflow-hidden transition-all duration-700 bg-surface relative ${
                  isThisActive ? 'border-accent shadow-[0_0_40px_rgba(212,168,83,0.15)] scale-[1.01]' : 'border-white/5 hover:border-accent/40'
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <img
                    src={release.cover}
                    alt={release.title}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] opacity-80 group-hover:opacity-100 ease-out select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-base via-base/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />

                  {isThisActive && isPlaying && (
                    <div className="absolute top-4 left-4 z-20 bg-accent text-base px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-base animate-ping" />
                      Now Playing
                    </div>
                  )}

                  {release.hasAudio && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="relative w-20 h-20 rounded-full bg-accent/95 text-base flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-700 shadow-[0_0_40px_rgba(212,168,83,0.4)] group-hover:shadow-[0_0_60px_rgba(212,168,83,0.8)] backdrop-blur-md">
                        {isThisActive && buffering ? (
                          <Loader2 size={28} className="text-base animate-spin" />
                        ) : isThisActive && isPlaying ? (
                          <Pause size={28} className="text-base" />
                        ) : (
                          <Play size={28} className="fill-base ml-1 text-base" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <p className="text-accent text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold mb-3 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-accent/60 inline-block"></span>
                    {release.subtitle}
                  </p>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display tracking-tight mb-3 text-white group-hover:text-accent transition-colors drop-shadow-lg">{release.title}</h3>
                  <p className="text-text-muted/90 text-sm font-light leading-relaxed max-w-sm drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-700 mb-4">{release.description}</p>

                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    {release.hasAudio && (
                      <button
                        onClick={(e) => toggleTrack(release.id, e)}
                        className="px-4 py-2 bg-accent text-base text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-accent/90 transition-colors"
                      >
                        {isThisActive && isPlaying ? 'Pause Session' : 'Listen Now'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          preload="none"
          controlsList="nodownload noplaybackrate noremoteplayback"
          onContextMenu={(e) => e.preventDefault()}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => { setBuffering(false); setIsPlaying(true); }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setErrorMsg('Audio failed to load. Please try again later.')}
          className="hidden"
        />

        <AnimatePresence>
          {activeTrack && activeRelease && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="border border-text-muted/10 rounded-xl p-6 md:p-8 bg-surface/80 backdrop-blur-md relative overflow-hidden mt-8"
            >
              <button
                onClick={() => { audioRef.current?.pause(); setActiveTrack(null); setIsPlaying(false); }}
                className="absolute top-4 right-4 text-text-muted/50 hover:text-accent transition-colors p-1 z-20"
                title="Close Player"
                aria-label="Close Player"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 justify-between">

                {/* Artwork & Info */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-white/5 relative bg-base">
                    <img
                      src={activeRelease.cover}
                      alt={activeRelease.title}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-cover select-none"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-base/60">
                        <span className="flex gap-1 items-end h-5">
                          <span className="w-0.5 bg-accent h-5 animate-pulse" />
                          <span className="w-0.5 bg-accent h-3 animate-pulse [animation-delay:75ms]" />
                          <span className="w-0.5 bg-accent h-4 animate-pulse [animation-delay:150ms]" />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-display font-semibold tracking-tight text-text-main truncate">{activeRelease.title}</h4>
                    <p className="text-text-muted text-[11px] uppercase tracking-widest truncate">{activeRelease.subtitle}</p>
                  </div>
                </div>

                {/* Controls + progress */}
                <div className="flex-1 max-w-md w-full">
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <button
                      onClick={() => handleSkip(-15)}
                      className="text-text-muted hover:text-accent transition-colors flex items-center justify-center w-9 h-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-full"
                      title="Skip back 15s"
                      aria-label="Skip back 15 seconds"
                    >
                      <SkipBack size={16} />
                    </button>
                    <button
                      onClick={handlePauseToggle}
                      className="w-11 h-11 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-base flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {buffering ? <Loader2 size={16} className="animate-spin" /> : isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                    <button
                      onClick={() => handleSkip(15)}
                      className="text-text-muted hover:text-accent transition-colors flex items-center justify-center w-9 h-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-full"
                      title="Skip forward 15s"
                      aria-label="Skip forward 15 seconds"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>

                  {/* Live lyric line */}
                  <div className="text-center font-serif text-sm italic text-accent min-h-[24px] transition-all duration-300 mb-3 px-2">
                    {currentLyricLine ? (
                      <span className="inline-flex items-center gap-2 flex-wrap justify-center">
                        {currentLyricLine.chords && (
                          <span className="text-[10px] font-mono tracking-widest font-normal uppercase bg-accent/20 border border-accent/30 text-accent px-1.5 py-0.5 rounded not-italic">
                            {currentLyricLine.chords}
                          </span>
                        )}
                        <span>"{currentLyricLine.text}"</span>
                      </span>
                    ) : (
                      <span>Playing acoustic original...</span>
                    )}
                  </div>

                  {/* Progress + buffered */}
                  <div
                    ref={progressBarRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="Seek"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress)}
                    className="relative w-full h-1.5 bg-base/80 rounded-full overflow-hidden cursor-pointer group/seek focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    onClick={handleSeek}
                    onKeyDown={handleSeekKey}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-white/10"
                      style={{ width: `${bufferedEnd}%` }}
                    />
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-accent"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent border-2 border-base opacity-0 group-hover/seek:opacity-100 transition-opacity"
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted mt-2 font-mono">
                    <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(currentTime)} / {formatTime(duration)}</span>
                    <span className="flex items-center gap-1">
                      {buffering ? (
                        <><Loader2 size={10} className="animate-spin" /> Buffering</>
                      ) : (
                        <><Heart size={10} className="fill-accent stroke-accent" /> Playback Active</>
                      )}
                    </span>
                  </div>
                  {errorMsg && (
                    <p className="text-red-400/80 text-[11px] mt-2 text-center">{errorMsg}</p>
                  )}
                </div>

                {/* Volume & info */}
                <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-center lg:justify-end">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-text-muted hover:text-accent transition-colors p-1"
                      aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                    >
                      {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      aria-label="Volume"
                      className="w-20 accent-accent bg-base h-1 cursor-pointer rounded-full outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    aria-expanded={showLyrics}
                    className={`flex items-center gap-2 text-xs tracking-widest uppercase font-mono px-4 py-2 border rounded-sm transition-colors ${
                      showLyrics ? 'bg-accent border-accent text-base' : 'border-text-muted/20 text-text-muted hover:border-accent hover:text-accent'
                    }`}
                  >
                    <BookOpen size={12} /> Info
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showLyrics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8 pt-8 border-t border-text-muted/10 relative z-20"
                  >
                    <div className="max-w-2xl mx-auto text-center">
                      <h5 className="font-display font-medium text-lg text-accent mb-4">Discography Details</h5>
                      <p className="text-text-muted text-sm leading-relaxed font-light mb-6">
                        {activeRelease.description}
                      </p>

                      <div className="bg-base/60 p-6 border border-white/[0.02] rounded-xl flex flex-col sm:flex-row justify-center gap-8 items-center">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[#F5F0E8]/50 font-mono mb-1">Format</p>
                          <p className="text-sm text-text-main font-medium">Original Audio</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/5 hidden sm:block"></div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[#F5F0E8]/50 font-mono mb-1">Location</p>
                          <p className="text-sm text-text-main font-medium">Topeka, KS</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/5 hidden sm:block"></div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[#F5F0E8]/50 font-mono mb-1">Rights</p>
                          <p className="text-sm text-text-main font-medium">&copy; Zachary Walker</p>
                        </div>
                      </div>

                      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted/50 mt-6 font-mono">
                        All Rights Reserved &middot; Unauthorized Use Prohibited
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
