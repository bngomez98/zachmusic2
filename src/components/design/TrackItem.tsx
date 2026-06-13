import React from 'react';

type Props = {
  index?: number;
  title: string;
  album?: string;
  duration?: string;
};

export default function TrackItem({ index, title, album, duration }: Props){
  return (
    <div className="flex items-center justify-between p-3 bg-popover border border-border rounded-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-[#111] to-[#222] flex items-center justify-center text-sm">{index}</div>
        <div>
          <div className="font-medium">{title}</div>
          {album && <div className="text-sm text-muted-foreground">{album}</div>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {duration && <div className="text-sm text-muted-foreground">{duration}</div>}
        <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm">Play</button>
      </div>
    </div>
  );
}
