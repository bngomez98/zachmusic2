import React from 'react';
import Layout from '@/components/design/Layout';
import Hero from '@/components/design/Hero';
import Releases from '@/components/design/Releases';
import Tracks from '@/components/design/Tracks';
import About from '@/components/design/About';
import Contact from '@/components/design/Contact';
import Player from '@/components/design/Player';
import Footer from '@/components/design/Footer';

export default function App(){
  return (
    <Layout>
      <div className="space-y-10">
        <Hero />

        <Releases />

        <Tracks />

        <About />

        <Contact />

        <Player />

        <Footer />
      </div>
    </Layout>
  );
}
