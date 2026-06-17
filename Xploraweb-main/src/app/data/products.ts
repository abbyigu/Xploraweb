export type ExperienceCategory = 'xplorators' | 'xploratours' | 'xploranights' | 'xploratorsplus' | 'limoilou' | 'cartier';

export const EXPERIENCE_CATEGORIES: { id: ExperienceCategory; name: string; tagline: string }[] = [
  // Xplorators (free self-guided) and Xploratours (guided tours) hidden for the moment
  { id: 'xploratorsplus', name: 'Xplorators+',           tagline: 'Go deeper · Stories, context & local access' },
  { id: 'xploranights',  name: 'Xplora Nights',          tagline: 'The nights worth going out for' },
  { id: 'limoilou',      name: 'Xplorators · Limoilou',  tagline: 'Discover Limoilou · Neighbourhood routes' },
  { id: 'cartier',       name: 'Xplorators · Cartier',   tagline: 'Discover Cartier · Neighbourhood routes' },
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
  rating?: number;       // 0–5, AllTrails-style
  reviewCount?: number;
  // detail page fields
  longDescription?: string;
  includes?: string[];
  toBring?: string[];
  meetingPoint?: string;
  languages?: string[];
  hostName?: string;
  hostBio?: string;
  highlights?: string[];
  itinerary?: string[];
  neighbourhood?: string;
  vibes?: string[];
  availableDates?: string[]; // ISO dates e.g. ["2026-06-15", "2026-06-22"]
  availableTimes?: string[]; // 24-h e.g. ["10:00", "14:00", "18:00"]
  // event-specific (xploranights)
  eventDate?: string;   // ISO date: '2026-05-15'
  eventTime?: string;   // display string: '8:00 PM'
  eventType?: 'recurring' | 'seasonal' | 'one-time';
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
    itinerary: [
      'Place des Arts, Saint-Roch — Start at this open-air gallery anchoring the creative quarter',
      'Rue Saint-Joseph Est — Walk the main artery of Saint-Roch, lined with indie cafés and boutiques',
      'Mural at Chemin Sainte-Foy — A four-storey mural painted by a local collective; best seen from across the street',
      'Café Largo — A neighbourhood staple with exposed brick and rotating art on the walls; worth a stop',
      'Escalier Casse-Cou — The oldest staircase in North America, connecting Lower Town to Old Quebec',
      'Rue du Trésor — Open-air gallery where local artists sell prints and originals year-round',
      'Terrasse Dufferin — End your route here for a panoramic view of the St. Lawrence River',
    ],
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
    itinerary: [
      'Parc de la Rivière-Saint-Charles — A 32km linear park along the river; start near the Dorchester bridge',
      'Domaine Maizerets — Hidden arboretum with over 200 tree species, a pond, and heritage greenhouses',
      'Parc du Bois-de-Coulonge — Former lieutenant-governor estate turned public park with river views',
      'Plaines d\'Abraham — Historic battlefield turned urban park at the heart of the city',
      'Bassin Louise — Waterfront promenade with sailboats, terraces, and views of the port',
      'Parc de la Chute-Montmorency — End with Québec\'s most dramatic natural sight: a waterfall taller than Niagara',
    ],
  },
  {
    id: 'exp-9',
    name: 'Hidden Staircases & Passages',
    description: 'Secret shortcuts and forgotten corridors of Old Quebec',
    price: 0,
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Free',
    duration: 'Go at your own pace',
    difficulty: 'Easy',
    category: 'xplorators',
    itinerary: [
      'Escalier Casse-Cou — The steepest and oldest staircase in North America, connecting Petit-Champlain to Old Quebec',
      'Passage du Chien-d\'Or — A narrow alley tucked behind the post office with a carved stone golden dog above the door',
      'Escalier du Faubourg — A lesser-known staircase locals use as a shortcut between Saint-Jean-Baptiste and Saint-Roch',
      'Rue Sous-le-Fort — A one-lane street running beneath the cliff face; look up for the best view of the Château',
      'Tunnel under the Citadelle — A short pedestrian passage carved through the old fortifications',
      'Côte de la Montagne — The historic road connecting Upper and Lower Town, lined with 17th century stone walls',
    ],
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
  {
    id: 'exp-10',
    name: 'Old Port Food & History Walk',
    description: 'Taste local flavours while uncovering 400 years of history',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '3 hours',
    spots: 8,
    difficulty: 'Easy',
    category: 'xploratours',
  },
  {
    id: 'exp-maguire-tours',
    name: 'Xploratours · Maguire',
    description: 'Guided walk through one of Québec City\'s most charming streets',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '2 hours',
    spots: 8,
    difficulty: 'Easy',
    category: 'xploratours',
    neighbourhood: 'Maguire',
    highlights: [
      'Small group — max 8 people',
      'Local host with real neighbourhood knowledge',
      'Stops at places not on any tourist map',
      'Includes a tasting stop along the route',
    ],
    includes: [
      'Guided 2-hour walk with local host',
      'One tasting stop (bagels or pastry)',
      'Digital recap with all stop addresses after the tour',
    ],
    toBring: [
      'Comfortable walking shoes',
      'Light layer (mornings can be cool)',
    ],
    meetingPoint: 'Corner of Avenue Maguire & Rue du Chalutier — details sent on booking',
    languages: ['English', 'Français'],
    itinerary: [
      'Meet at the corner — quick intro, no fluff',
      'Boulangerie stop — first tasting, story of the baker',
      'The main strip walk — architecture, shopfronts, what changed and what hasn\'t',
      'Hidden courtyard — the one locals use as a shortcut',
      'Neighbourhood café — off-menu order if you want it',
      'Parc de Sillery lookout — wrap-up with a view',
    ],
  },
  // Xplorators+
  {
    id: 'exp-maguire-plus',
    name: 'Xplorators+ · Maguire',
    description: 'The full Maguire story — deeper context, insider stops & member pricing',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Members',
    duration: 'Go at your own pace',
    spots: undefined,
    difficulty: 'Easy',
    category: 'xploratorsplus',
    neighbourhood: 'Maguire',
    highlights: [
      'Everything in Xplorators · Maguire, plus',
      'Audio narration at every stop',
      'Insider stops not on the free route',
      'Historical context and neighbourhood stories',
      'Member pricing ($15 → $10 with membership)',
    ],
    includes: [
      'Full self-guided route with audio at each stop',
      'Extended itinerary with 3 bonus insider locations',
      'Neighbourhood history notes',
    ],
    toBring: [
      'Earbuds or headphones for audio',
      'Walking shoes',
      'An appetite',
    ],
    meetingPoint: 'Start anywhere on the route — route begins at the north end of Avenue Maguire',
    languages: ['English', 'Français'],
    itinerary: [
      'North end of Maguire — audio intro sets the scene; 2-minute listen before you start walking',
      'First bagel stop — extended audio on the history of this block and who used to live here',
      'Rue Marly detour — bonus stop not on the free route; a courtyard with a story',
      'The old pharmacy — now a café, but the tile work inside is original 1940s',
      'Hidden passage — audio explains why this alley existed and what it connected',
      'Lookout point — final audio note, a local\'s perspective on why this neighbourhood matters',
    ],
  },
  // Xplora Nights
  {
    id: 'exp-6',
    name: 'Nightlife Tour',
    description: 'Best bars, clubs, and late-night eats in Old Quebec and Saint-Roch',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'New',
    duration: 'Evening',
    spots: 5,
    difficulty: 'Easy',
    category: 'xploranights',
    eventDate: '2026-05-15',
    eventTime: '9:00 PM',
    eventType: 'one-time',
    meetingPoint: 'Place D\'Youville — corner entrance, Old Quebec',
    languages: ['English', 'Français'],
  },
  {
    id: 'exp-8',
    name: 'Rooftop 5 à 7',
    description: 'Members-only drinks and views on the best rooftop terrace in the city',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Members Only',
    duration: 'Evening',
    spots: 20,
    difficulty: 'Easy',
    category: 'xploranights',
    eventDate: '2026-05-16',
    eventTime: '5:00 PM',
    eventType: 'recurring',
    meetingPoint: 'Le Perché Rooftop — 263 Rue Saint-Vallier O, Saint-Roch',
    languages: ['English', 'Français'],
  },
  {
    id: 'exp-11',
    name: 'Jazz & Cocktails Evening',
    description: 'Live jazz, craft cocktails, and the best hidden bars in the city',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Popular',
    duration: 'Evening',
    spots: 10,
    difficulty: 'Easy',
    category: 'xploranights',
    eventDate: '2026-05-22',
    eventTime: '7:30 PM',
    eventType: 'seasonal',
    meetingPoint: 'Chez Maurice — 575 Grande Allée Est, Montcalm',
    languages: ['English'],
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
    name: 'Québec City Map Print',
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
    name: 'Xplora Membership — Monthly',
    description: 'Early access, member pricing, guest pass, monthly 5 à 7, insider perks & surprise upgrades',
    price: 1000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: '/month',
  },
  {
    id: 'member-yearly',
    name: 'Xplora Membership — Yearly',
    description: 'Everything in monthly — save $20 by paying annually',
    price: 10000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: 'Best Value',
  },
];
