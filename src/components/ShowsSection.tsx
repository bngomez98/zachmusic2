import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, Music, Send, CheckCircle, Flame, Sparkles, Mail, Phone } from 'lucide-react';
import { SHOWS } from '../data';

interface SetlistSong {
  id: string;
  title: string;
  artist: string;
  category: string;
  votes: number;
}

interface CustomRequest {
  id: string;
  songName: string;
  artistName: string;
  dedication?: string;
  timestamp: string;
}

const INITIAL_SETLIST: SetlistSong[] = [
  { id: '1', title: 'Something in the Orange', artist: 'Zach Bryan', category: 'Popular Request', votes: 124 },
  { id: '2', title: 'Love and Madness', artist: 'Zachary Walker (Original)', category: 'Original', votes: 198 },
  { id: '3', title: 'Feathered Indians', artist: 'Tyler Childers', category: 'Popular Request', votes: 97 },
  { id: '4', title: 'Harvest Moon', artist: 'Neil Young', category: 'Classic', votes: 76 },
  { id: '5', title: 'Cover Me Up', artist: 'Jason Isbell', category: 'Folk Cover', votes: 85 },
];

export default function ShowsSection() {
  const [setlist, setSetlist] = useState<SetlistSong[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  
  // Form input state
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [dedication, setDedication] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load from localStorage
    const savedSetlist = localStorage.getItem('zw_setlist');
    const savedVotes = localStorage.getItem('zw_voted_ids');
    const savedCustoms = localStorage.getItem('zw_custom_requests');

    if (savedSetlist) {
      setSetlist(JSON.parse(savedSetlist));
    } else {
      setSetlist(INITIAL_SETLIST);
    }

    if (savedVotes) {
      setVotedIds(JSON.parse(savedVotes));
    }

    if (savedCustoms) {
      setCustomRequests(JSON.parse(savedCustoms));
    }
  }, []);

  const handleVote = (id: string) => {
    if (votedIds.includes(id)) return; // prevent duplicate votes

    const updatedSetlist = setlist.map(song => {
      if (song.id === id) {
        return { ...song, votes: song.votes + 1 };
      }
      return song;
    });

    const updatedVotes = [...votedIds, id];
    
    setSetlist(updatedSetlist);
    setVotedIds(updatedVotes);

    localStorage.setItem('zw_setlist', JSON.stringify(updatedSetlist));
    localStorage.setItem('zw_voted_ids', JSON.stringify(updatedVotes));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName.trim()) {
      setErrorMsg('Please specify a song title.');
      return;
    }

    const newRequest: CustomRequest = {
      id: Math.random().toString(36).substr(2, 9),
      songName: songName.trim(),
      artistName: artistName.trim() || 'Traditional / Unknown',
      dedication: dedication.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedCustoms = [newRequest, ...customRequests];
    setCustomRequests(updatedCustoms);
    localStorage.setItem('zw_custom_requests', JSON.stringify(updatedCustoms));

    // Reset Form
    setSongName('');
    setArtistName('');
    setDedication('');
    setErrorMsg('');
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
    }, 4000);
  };

  const clearMyRequests = () => {
    setCustomRequests([]);
    localStorage.removeItem('zw_custom_requests');
  };

  const sortedSetlist = [...setlist].sort((a, b) => b.votes - a.votes);

  return (
    <section id="shows" className="bg-surface py-32 text-text-main border-y border-text-muted/10">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <span className="flex items-center justify-center gap-2 text-[12px] font-medium tracking-[0.08em] uppercase text-accent mb-2 leading-relaxed">
            <span className="w-4 h-[1px] bg-accent/60"></span>
            Live
            <span className="w-4 h-[1px] bg-accent/60"></span>
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight">Upcoming Shows</h2>
          <div className="w-10 h-[1px] bg-accent/40" />
        </div>

        <div className="flex flex-col mb-24 border-t border-text-muted/10">
          {SHOWS.map((show, i) => (
            <motion.div 
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-text-muted/10 hover:bg-white/[0.01] transition-all px-0 hover:px-6 -mx-0 hover:-mx-6 gap-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/[0.03] to-accent/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-500 ease-out" />
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16 w-full md:w-2/3 relative z-10">
                <div className="flex md:flex-col items-baseline md:items-center gap-3 md:gap-0 min-w-[100px]">
                   <span className="text-accent font-light tracking-[0.2em] uppercase text-xs sm:text-sm">{show.date.split(' ')[0]}</span>
                   <span className="text-text-main font-display font-medium text-4xl sm:text-5xl tracking-tighter group-hover:text-accent transition-colors duration-500">{show.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-semibold font-display tracking-tight mb-3 text-text-main group-hover:text-white transition-colors">{show.title}</h3>
                  <div className="text-text-muted text-sm tracking-wide font-light flex items-center gap-2 mb-2">
                    <span className="w-4 h-[1px] bg-text-muted/40 inline-block"></span>
                    {show.location}
                  </div>
                  {show.amenities && (
                    <div className="text-text-muted/60 text-xs tracking-wide font-light flex items-center gap-2 mb-2">
                      <span className="w-4 h-[1px] bg-transparent inline-block"></span>
                      • {show.amenities}
                    </div>
                  )}
                  <div className="text-text-muted/70 text-xs tracking-wide font-light flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-transparent inline-block"></span>
                    {show.time}
                  </div>
                </div>
              </div>
              
              <div className="md:text-right relative z-10 mt-4 md:mt-0">
                {show.isAvailable ? (
                  <a 
                    href={show.link}
                    target="_blank"
                    rel="noreferrer" 
                    className="inline-flex items-center justify-center border border-accent/40 text-text-main px-8 py-4 text-[10px] sm:text-xs tracking-[0.2em] font-semibold uppercase hover:border-accent hover:bg-accent hover:text-base transition-all duration-300 rounded-full"
                  >
                    Details
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center px-8 py-4 text-[10px] sm:text-xs tracking-[0.2em] font-semibold uppercase border border-base bg-base/50 text-text-muted/40 rounded-full cursor-not-allowed">
                    Sold Out
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Setlist Voting & Interactive Request Board */}
        <div className="border border-text-muted/10 rounded-lg p-8 md:p-12 bg-base/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full filter blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            {/* Left side: Interactive Leaderboard */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <Flame size={18} className="text-accent animate-pulse" />
                <h3 className="text-2xl font-display font-semibold tracking-tight">Request Board</h3>
              </div>
              <p className="text-text-muted text-sm mb-8 leading-relaxed font-light">
                Upvote the songs you'd like to hear at the next show.
              </p>

              <div className="space-y-4">
                {sortedSetlist.map((song) => {
                  const isVoted = votedIds.includes(song.id);
                  return (
                    <div 
                      key={song.id} 
                      className="flex items-center justify-between p-4 rounded bg-surface border border-white/[0.02] hover:border-accent/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-base flex items-center justify-center text-accent/80 border border-text-muted/10">
                          <Music size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-main font-sans">{song.title}</p>
                          <p className="text-[11px] text-text-muted uppercase tracking-wider">{song.artist}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleVote(song.id)}
                        disabled={isVoted}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs tracking-wider uppercase transition-all duration-300 font-mono ${
                          isVoted 
                            ? 'bg-accent/10 border border-accent/30 text-accent cursor-default' 
                            : 'bg-base border border-text-muted/10 text-text-muted hover:border-accent hover:text-accent hover:bg-accent/5 active:scale-95'
                        }`}
                      >
                        <ThumbsUp size={11} className={isVoted ? 'fill-accent' : ''} />
                        <span>{song.votes}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Booking & Inquiries */}
            <div className="w-full lg:w-[320px] flex flex-col justify-center">
              <div className="bg-surface/60 border border-white/5 p-8 rounded-2xl">
                <h4 className="text-xl font-display font-medium mb-4 flex items-center gap-2">
                   Booking & Inquiries
                </h4>
                <p className="text-text-muted text-xs mb-8 leading-relaxed font-light">
                  For private events, venue booking, or management inquiries, please reach out directly.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full border border-text-muted/10 bg-base flex flex-col items-center justify-center group-hover:border-accent/40 group-hover:bg-accent/5 transition-colors">
                      <Mail size={16} className="text-text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted/60 font-mono mb-1">Email</p>
                      <a href="mailto:mgmt@zacharywalkermusic.com" className="text-sm font-medium text-text-main group-hover:text-accent transition-colors">mgmt@zacharywalkermusic.com</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full border border-text-muted/10 bg-base flex items-center justify-center group-hover:border-accent/40 group-hover:bg-accent/5 transition-colors">
                      <Phone size={16} className="text-text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted/60 font-mono mb-1">Phone</p>
                      <a href="tel:+17854988881" className="text-sm font-medium text-text-main group-hover:text-accent transition-colors">785-498-8881</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

