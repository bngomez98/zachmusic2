export const LINKS = {
  instagram: 'https://www.instagram.com/zacharywalkermusic/',
  facebook: 'https://www.facebook.com/zacharywalkermusic',
  youtube: 'https://www.youtube.com/@zacharywalkermusic',
  tiktok: 'https://www.tiktok.com/@zacharywalkermusic',
  facebookEvent: 'https://www.facebook.com/zacharywalkermusic',
  email: 'mgmt@zacharywalkermusic.com',
  booking: 'booking@zacharywalkermusic.com',
};

export interface Show {
  id: number;
  date: string;
  time: string;
  title: string;
  location: string;
  amenities?: string;
  link: string;
  isAvailable: boolean;
}

export const SHOWS: Show[] = [
  {
    id: 1,
    date: 'JUL 17',
    time: '6:30-9:30pm CST',
    title: 'Live at B&B Theatres Topeka',
    location: 'B&B Theatres Topeka Wheatfield 9, Topeka, KS',
    amenities: 'Full-service bar, kitchen, indoor & outdoor seating',
    link: LINKS.facebookEvent,
    isAvailable: true,
  },
  {
    id: 2,
    date: 'AUG 01',
    time: '6:30-9:30pm CST',
    title: 'Live at B&B Theatres Topeka',
    location: 'B&B Theatres Topeka Wheatfield 9, Topeka, KS',
    amenities: 'Full-service bar, kitchen, indoor & outdoor seating',
    link: LINKS.facebookEvent,
    isAvailable: true,
  },
  {
    id: 3,
    date: 'AUG 28',
    time: '6:30-9:30pm CST',
    title: 'Live at B&B Theatres Topeka',
    location: 'B&B Theatres Topeka Wheatfield 9, Topeka, KS',
    link: LINKS.facebookEvent,
    isAvailable: true,
  },
];

import img1 from './assets/images/regenerated_image_1781019034434.jpg';
import img2 from './assets/images/regenerated_image_1781019035202.jpg';

export const RELEASES = [
  {
    id: 1,
    title: 'Love and Madness',
    subtitle: 'Original — 2023',
    description: 'Original song written and performed by Zachary Walker, published by Zachary Walker Music, all rights reserved.',
    ctaLink: '#',
    videoUrl: '/loveandmadness.mp4',
    audioUrl: '/loveandmadness.mp3',
    cover: img1,
    hasAudio: true,
  },
  {
    id: 2,
    title: 'Coming Soon',
    subtitle: 'New Release — Late 2026',
    description: 'New original recordings from the debut EP currently in production.',
    ctaLink: '#',
    cover: img2,
    hasAudio: false,
  },
];

export const GALLERY = [
  {
    src: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=1200',
    caption: 'Love and Madness — Original Session 2023',
    orientation: 'landscape',
    likes: '142',
    comments: '19',
    link: LINKS.instagram,
  },
  {
    src: 'https://images.unsplash.com/photo-1485038101637-2d4833df1b35?auto=format&fit=crop&q=80&w=800&h=1200',
    caption: 'Live at B&B Theatres Topeka Wheatfield 9',
    orientation: 'portrait',
    likes: '118',
    comments: '14',
    link: LINKS.instagram,
  },
  {
    src: 'https://images.unsplash.com/photo-1516280440502-ad9e1c312fb1?auto=format&fit=crop&q=80&w=1200',
    caption: 'Late night songwriting and fingerstyle sessions',
    orientation: 'landscape',
    likes: '186',
    comments: '28',
    link: LINKS.instagram,
  },
];
