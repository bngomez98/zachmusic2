import React from 'react';

export default function About(){
  return (
    <section id="about" className="rounded-lg p-6 bg-card border border-border">
      <h2 className="text-2xl font-semibold mb-3">About</h2>
      <p className="text-sm text-muted-foreground">Zach (stage name) is a singer-songwriter and producer based in Topeka, Kansas. He writes intimate acoustic songs and produces cinematic arrangements for film and media. He also offers licensing and bespoke music services for projects.</p>
      <div className="mt-4">
        <a className="inline-block px-3 py-1 rounded-md bg-primary text-primary-foreground" href="#contact">Contact for bookings</a>
      </div>
    </section>
  );
}
