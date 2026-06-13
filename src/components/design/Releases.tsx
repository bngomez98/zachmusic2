import React from 'react';
import ReleaseCard from './ReleaseCard';

const sample = [
  { title: 'Golden Hour', description: 'A short EP blending acoustic textures and cinematic strings.', date: '2025' },
  { title: 'Midwest Roads', description: 'Full-length album exploring home, travel, and the open road.', date: '2024' },
  { title: 'Live at The Barn', description: 'Recorded live performances with minimal production.', date: '2023' },
];

export default function Releases(){
  return (
    <section id="releases">
      <h2 className="text-2xl font-semibold mb-4">Featured Releases</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sample.map((r) => (
          <ReleaseCard key={r.title} title={r.title} description={r.description} date={r.date} />
        ))}
      </div>
    </section>
  );
}
