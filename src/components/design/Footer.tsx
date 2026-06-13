import React from 'react';

export default function Footer(){
  return (
    <footer className="mt-16 border-t border-border bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Zach Music</div>
          <div className="text-sm text-muted-foreground mt-2">© {new Date().getFullYear()} Zach Music. All rights reserved.</div>
        </div>

        <nav className="flex items-center gap-3">
          <a href="#releases" className="text-sm text-muted-foreground hover:text-foreground">Releases</a>
          <a href="#tracks" className="text-sm text-muted-foreground hover:text-foreground">Tracks</a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
