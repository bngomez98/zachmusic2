import React from 'react';
import TrackItem from './TrackItem';

const tracks = [
  { title: 'Open Road', album: 'Midwest Roads', duration: '3:42' },
  { title: 'Flicker', album: 'Golden Hour', duration: '2:58' },
  { title: 'Homeward', album: 'Midwest Roads', duration: '4:05' },
  { title: 'Back Porch', album: 'Live at The Barn', duration: '3:12' },
];

export default function Tracks(){
  return (
    <section id="tracks">
      <h2 className="text-2xl font-semibold mb-4">Latest Tracks</h2>
      <div className="space-y-3">
        {tracks.map((t, i) => (
          <TrackItem key={t.title} index={i + 1} title={t.title} album={t.album} duration={t.duration} />
        ))}
      </div>
    </section>
  );
}
