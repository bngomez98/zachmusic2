import React from 'react';
import Button from '@/components/design/Button';

export default function Header(){
  return (
    <header className="w-full border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a href="#" className="text-lg font-semibold">Zach Music</a>
          <nav className="hidden md:flex items-center gap-3">
            <a href="#releases" className="text-sm text-muted-foreground hover:text-foreground">Releases</a>
            <a href="#tracks" className="text-sm text-muted-foreground hover:text-foreground">Tracks</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-input text-muted-foreground px-3 py-2 rounded-md">
            <svg className="w-4 h-4 mr-2 text-muted-foreground" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5"/></svg>
            <input className="bg-transparent outline-none text-sm" placeholder="Search tracks, releases..." aria-label="Search" />
          </div>

          <Button variant="ghost">Sign in</Button>
        </div>
      </div>
    </header>
  );
}
