export type ExperienceCategory = 'xplorators' | 'xplorastories' | 'xploratours' | 'xploranights';

export const EXPERIENCE_CATEGORIES: { id: ExperienceCategory; name: string; tagline: string }[] = [
  { id: 'xplorators',    name: 'Xplora-tors',    tagline: 'Explore freely · Free & self-guided' },
  { id: 'xplorastories', name: 'Xplora-stories',  tagline: 'Discover hidden layers' },
  { id: 'xploratours',   name: 'Xplora-tours',    tagline: 'Experience together' },
  { id: 'xploranights',  name: 'Xplora Nights',   tagline: 'Special events & unforgettable evenings' },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents CAD
  image: string;
  images?: string[];
  type: 'experience' | 'merch' | 'membership';
  badge?: string;
  // experience-specific
  duration?: string;
  spots?: number;
  difficulty?: string;
  category?: ExperienceCategory;
  // detail page fields
  longDescription?: string;
  includes?: string[];
  toBring?: string[];
  meetingPoint?: string;
  languages?: string[];
  hostName?: string;
  hostBio?: string;
  highlights?: string[];
}

export const experiences: Product[] = [
  // Xplora-tors
  {
    id: 'exp-1',
    name: 'Artistic Soul of Quebec City',
    description: 'Street art, galleries, and indie cafes',
    price: 0,
    image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    images: [
      'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
      'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
      'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
      'https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    ],
    type: 'experience',
    badge: 'Free',
    duration: 'Go at your own pace',
    spots: undefined,
    difficulty: 'Easy',
    category: 'xplorators',
    longDescription: `Xplora-tors is your free, self-guided adventure through Québec City. We give you a curated list of locations — neighbourhoods, murals, courtyards, lookouts — and you explore on your own terms. No schedule, no group, no guide. Just you and the city.\n\nThis route takes you through Saint-Roch's street art corridor, a hidden staircase in Old Quebec, a riverside lookout most locals don't know about, and a few spots worth stopping at just to sit and take it in.\n\nWant to go deeper? Each location on this route has a story behind it. If you'd like that context — the history, the people, the hidden layers — check out Xplora-stories, our narrative-led experience that brings these same places to life. Or join an Xplora-tours outing to discover the city alongside other members.`,
    highlights: [
      'Completely free — no booking required',
      'Self-guided at your own pace',
      'Curated list of locations with addresses',
      'Works solo, with a friend, or with family',
      'Want more? Xplora-stories and Xplora-tours go deeper',
    ],
    includes: [
      'Digital route map with all locations',
      'Brief description of each stop',
      'Tips on best time to visit each spot',
    ],
    toBring: [
      'Comfortable walking shoes',
      'Your phone for the map',
      'A sense of curiosity',
    ],
    meetingPoint: 'Start anywhere on the route — fully flexible',
    languages: ['English', 'Français'],
  },
  {
    id: 'exp-5',
    name: 'Nature & Parks',
    description: 'Green spaces and waterfront trails',
    price: 0,
    image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Free',
    duration: 'Go at your own pace',
    spots: undefined,
    difficulty: 'Easy',
    category: 'xplorators',
  },
  // Xplora-stories
  {
    id: 'exp-4',
    name: 'Historic Old Quebec',
    description: 'Walk through centuries of history',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '3 hours',
    spots: 5,
    difficulty: 'Easy',
    category: 'xplorastories',
  },
  {
    id: 'exp-2',
    name: "Foodie's Paradise",
    description: 'Local markets and hidden culinary gems',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '4 hours',
    spots: 4,
    difficulty: 'Easy',
    category: 'xplorastories',
  },
  // Xplora-tours
  {
    id: 'exp-3',
    name: 'Urban Explorer',
    description: 'Architecture and city secrets',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: 'Half Day',
    spots: 6,
    difficulty: 'Moderate',
    category: 'xploratours',
  },
  {
    id: 'exp-7',
    name: 'Saint-Roch Neighbourhood Walk',
    description: 'Explore the creative heart of Québec City together',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '2 hours',
    spots: 8,
    difficulty: 'Easy',
    category: 'xploratours',
  },
  // Xplora Nights
  {
    id: 'exp-6',
    name: 'Nightlife Tour',
    description: 'Best bars, clubs, and late-night eats',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'New',
    duration: 'Evening',
    spots: 5,
    difficulty: 'Easy',
    category: 'xploranights',
  },
  {
    id: 'exp-8',
    name: 'Rooftop 5 à 7',
    description: 'Members-only evening on the best rooftop in the city',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Members Only',
    duration: 'Evening',
    spots: 20,
    difficulty: 'Easy',
    category: 'xploranights',
  },
];

export const merch: Product[] = [
  {
    id: 'merch-1',
    name: 'Xplora Tote Bag',
    description: 'Canvas tote — carry the city with you',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
  {
    id: 'merch-2',
    name: 'Xplora Water Bottle',
    description: 'Insulated 500ml — stay hydrated on every adventure',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
  {
    id: 'merch-3',
    name: 'Quebec City Map Print',
    description: 'Illustrated art print — 8×10 inch, ready to frame',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
  {
    id: 'merch-4',
    name: 'Xplora Cap',
    description: 'Adjustable embroidered cap',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
];

export const memberships: Product[] = [
  {
    id: 'member-monthly',
    name: 'Club Membership — Monthly',
    description: 'Early access, member pricing, guest pass, monthly 5 à 7, insider perks & surprise upgrades',
    price: 1000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: '/month',
  },
  {
    id: 'member-yearly',
    name: 'Club Membership — Yearly',
    description: 'Everything in monthly — save $20 by paying annually',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: 'Best Value',
  },
];
