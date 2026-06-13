import React from 'react';

type Props = {
  title: string;
  description?: string;
  date?: string;
};

export default function ReleaseCard({ title, description, date }: Props) {
  return (
    <article className="bg-card rounded-lg p-4 border border-border flex flex-col">
      <div className="h-40 rounded-md bg-gradient-to-br from-[#111] to-[#222] mb-3 flex items-end p-3">
        <div className="bg-black/40 backdrop-blur-sm rounded px-2 py-1 text-xs">{date ?? '2026'}</div>
      </div>
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      <div className="mt-auto pt-4">
        <a className="inline-block px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm" href="#">Listen</a>
      </div>
    </article>
  );
}
