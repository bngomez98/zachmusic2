import img1 from './assets/images/regenerated_image_1781019034434.jpg';

export const LINKS = {
  instagram: 'https://www.instagram.com/za.chary5068/',
  facebook: 'https://www.facebook.com/profile.php?id=61565838372447',
  facebookEvent: 'https://www.facebook.com/events/936053559031406/',
  facebookMusicPage: 'https://www.facebook.com/p/Topcityzachary-61565838372447/',
  tiktok: 'https://www.tiktok.com/@fullmetalzcw',
  youtube: 'https://www.youtube.com/@fullmetalzcw',
  twitch: 'https://www.twitch.tv/fullmetalzcw',
  spotify: 'https://open.spotify.com/artist/fullmetalzcw',
  paypal: 'https://www.paypal.com/paypalme/fullmetalzcw',
  cashapp: 'https://cash.app/$fullmetalzcw',
  venmo: 'https://venmo.com/u/fullmetalzcw',
  gofundme: 'https://www.gofundme.com/f/help-a-single-father-fight-for-custody-84ajp',
};

export interface Show {
  id: number;
  /** ISO date string (YYYY-MM-DD) — used for accurate past/upcoming sorting */
  dateISO: string;
  /** Display label, e.g. "AUG 01" */
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
    dateISO: '2026-07-17',
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
    dateISO: '2026-08-01',
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
    dateISO: '2026-08-28',
    date: 'AUG 28',
    time: '6:30-9:30pm CST',
    title: 'Live at B&B Theatres Topeka',
    location: 'B&B Theatres Topeka Wheatfield 9, Topeka, KS',
    amenities: 'Full-service bar, kitchen, indoor & outdoor seating',
    link: LINKS.facebookEvent,
    isAvailable: true,
  },
];

export const RELEASES = [
  {
    id: 1,
    title: 'Love and Madness',
    subtitle: 'Original Audio — April 2023',
    description:
      'Original song written and performed by Zachary Walker, published by Zachary Walker Music, all rights reserved.',
    ctaLink: 'https://www.instagram.com/reel/CVGU0RfpJSL/',
    cover: img1,
    hasAudio: true,
    audioUrl: '/loveandmadness.mp3',
  },
];
