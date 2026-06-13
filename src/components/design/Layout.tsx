import React from 'react';
import Header from './Header';

type Props = { children: React.ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
