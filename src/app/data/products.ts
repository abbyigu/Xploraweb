export type ExperienceCategory = 'xplorators' | 'xploratours' | 'xploranights' | 'xploratorsplus';

export const EXPERIENCE_CATEGORIES: { id: ExperienceCategory; name: string; tagline: string }[] = [
  { id: 'xplorators',    name: 'Solo',    tagline: 'Self-guided · Explore at your own pace' },
  { id: 'xploratours',   name: 'Tours',   tagline: 'Guided group experiences' },
  { id: 'xploranights',  name: 'Nights',  tagline: 'The nights worth going out for' },
  { id: 'xploratorsplus', name: 'Solo+',  tagline: 'Self-guided · With stories & local context' },
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
  weeklyBookings?: number;
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
  faqs?: { q: string; a: string }[];
  title?: string;
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
    neighbourhood: 'Saint-Roch',
    vibes: ['artsy', 'cozy', 'hidden gem'],
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
    weeklyBookings: 12,
    meetingPoint: 'Start anywhere on the route — fully flexible',
    languages: ['English', 'Français'],
    faqs: [
      { q: 'Do I need to book in advance?', a: 'No — just save the route and go whenever you like. There\'s no set time and no group to meet.' },
      { q: 'How long does this route take?', a: 'Most people take 2–3 hours, but you can stretch it into a half-day if you stop for coffee and wander.' },
      { q: 'Is this suitable for kids?', a: 'Yes — the route is on flat, paved streets and mostly accessible. The staircase section (Escalier Casse-Cou) can be skipped.' },
      { q: 'What if I want a guide?', a: 'Check out the Xploratours version of this route — a local host leads a small group through the same area with stories, context, and a tasting stop.' },
    ],
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
    neighbourhood: 'Montcalm',
    vibes: ['outdoorsy', 'family-friendly'],
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
    neighbourhood: 'Vieux-Québec',
    vibes: ['adventurous', 'hidden gem'],
    itinerary: [
      'Escalier Casse-Cou — The steepest and oldest staircase in North America, connecting Petit-Champlain to Old Quebec',
      'Passage du Chien-d\'Or — A narrow alley tucked behind the post office with a carved stone golden dog above the door',
      'Escalier du Faubourg — A lesser-known staircase locals use as a shortcut between Saint-Jean-Baptiste and Saint-Roch',
      'Rue Sous-le-Fort — A one-lane street running beneath the cliff face; look up for the best view of the Château',
      'Tunnel under the Citadelle — A short pedestrian passage carved through the old fortifications',
      'Côte de la Montagne — The historic road connecting Upper and Lower Town, lined with 17th century stone walls',
    ],
  },
  {
    id: 'exp-maguire-tors',
    name: 'Xplorators · Maguire',
    description: 'Bagels, hidden stories & neighbourhood wandering',
    price: 0,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    ],
    type: 'experience',
    badge: 'Free',
    duration: 'Go at your own pace',
    spots: undefined,
    difficulty: 'Easy',
    category: 'xplorators',
    neighbourhood: 'Maguire',
    vibes: ['cozy', 'foodie', 'hidden gem'],
    longDescription: `Avenue Maguire is one of Québec City's most lived-in streets — not a tourist strip, just a real neighbourhood doing its thing. Bakeries that have been there for decades, a bagel counter that locals line up for on weekend mornings, courtyards you'd miss if you didn't slow down.\n\nThis self-guided route takes you through the length of Maguire and the side streets worth ducking into. No schedule, no group. Just the route, a few stops we love, and the neighbourhood doing what it does.\n\nWant the stories behind what you're seeing? Xplorators+ Maguire adds audio context and insider stops. Or join an Xploratours Maguire outing to explore it with a local host and a small group.`,
    highlights: [
      'Completely free — no booking required',
      'Best bagel stop on the route (we\'re serious)',
      'Hidden courtyard most people walk past',
      'Neighbourhood locals actually use',
      'Works at any pace — 1.5h to a full morning',
    ],
    includes: [
      'Digital route with all stops and addresses',
      'Brief note on each location',
      'Best time to visit each spot',
    ],
    toBring: [
      'Good walking shoes',
      'Your phone for the map',
      'An appetite — seriously',
    ],
    weeklyBookings: 9,
    meetingPoint: 'Start at either end of Avenue Maguire — fully flexible',
    languages: ['English', 'Français'],
    faqs: [
      { q: 'Do I need to book in advance?', a: 'Nope. Save the route and head out whenever — there\'s no time slot and no group.' },
      { q: 'How long is the route?', a: 'About 1.5 hours at a relaxed pace, or a full morning if you stop for a bagel and a coffee.' },
      { q: 'Is parking available nearby?', a: 'There\'s street parking on the side streets off Maguire. On weekday mornings it\'s usually easy to find a spot.' },
      { q: 'Can I do this with kids?', a: 'Yes — the route is flat and stroller-friendly. The bakery stop is a hit with kids.' },
    ],
    itinerary: [
      'Boulangerie artisanale — Start your morning here; the counter opens early and the lineup moves fast',
      'Avenue Maguire main strip — Walk the length of the street; take your time at the window displays',
      'Rue Marly side street — Turn here for a quieter residential block with some of the best front gardens on the route',
      'Hidden courtyard off Maguire — Look for the small passage on the east side; most people walk right past it',
      'Local coffee stop — A neighbourhood café that hasn\'t changed in 20 years; cash preferred',
      'Parc de Sillery — End of the route; a small park with a river-adjacent lookout worth the extra 10 minutes',
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
    weeklyBookings: 8,
    difficulty: 'Moderate',
    category: 'xploratours',
    neighbourhood: 'Vieux-Québec',
    vibes: ['adventurous', 'artsy'],
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
    neighbourhood: 'Saint-Roch',
    vibes: ['artsy', 'lively', 'foodie'],
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
    neighbourhood: 'Vieux-Québec',
    vibes: ['foodie', 'romantic', 'adventurous'],
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
    vibes: ['foodie', 'cozy', 'hidden gem'],
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
    weeklyBookings: 6,
    meetingPoint: 'Corner of Avenue Maguire & Rue du Chalutier — details sent on booking',
    languages: ['English', 'Français'],
    faqs: [
      { q: 'What\'s the group size?', a: 'Max 8 people — small enough that you can actually hear the host and ask questions.' },
      { q: 'Is the tasting stop included in the price?', a: 'Yes — one tasting stop (usually bagels or a pastry) is included. Anything extra you buy along the way is on you.' },
      { q: 'What if it rains?', a: 'The tour runs rain or shine. Dress for the weather — we walk the whole route regardless.' },
      { q: 'Can I cancel or reschedule?', a: 'Yes — cancel up to 48 hours before for a full refund. Within 48 hours we\'ll offer a credit toward another date.' },
      { q: 'Is this tour in English or French?', a: 'We offer it in both — select your preferred language when booking, or message us and we\'ll match your host.' },
    ],
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
    description: 'You already know where to go. Now find out why it matters.',
    price: 1500,
    image: '/maguire-staircase.jpeg',
    type: 'experience',
    badge: 'Members',
    duration: 'Go at your own pace',
    spots: undefined,
    difficulty: 'Easy',
    category: 'xploratorsplus',
    neighbourhood: 'Maguire',
    vibes: ['hidden gem', 'cozy', 'adventurous'],
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
    weeklyBookings: 4,
    meetingPoint: 'Start anywhere on the route — route begins at the north end of Avenue Maguire',
    languages: ['English', 'Français'],
    faqs: [
      { q: 'Do I need headphones?', a: 'Yes — earbuds work great. The audio is optimised for headphones so you can hear it clearly while walking in the city.' },
      { q: 'How is this different from the free Maguire route?', a: 'The free route gives you the stops. Solo+ adds audio narration at each stop — the history, the people, the stories behind what you\'re looking at — plus 3 insider locations not on the free map.' },
      { q: 'Can I pause and come back?', a: 'Yes — your route saves on your device. Come back the next morning and pick up where you left off.' },
      { q: 'What\'s the member price?', a: 'Members get Solo+ at $10 instead of $15. That\'s applied automatically at checkout if your membership is active.' },
    ],
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
    description: 'Best bars, clubs, and late-night eats',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'New',
    duration: 'Evening',
    spots: 5,
    difficulty: 'Easy',
    category: 'xploranights',
    neighbourhood: 'Saint-Jean-Baptiste',
    vibes: ['late night', 'lively', 'adventurous'],
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
    neighbourhood: 'Vieux-Québec',
    vibes: ['romantic', 'lively', 'late night'],
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
    spots: 3,
    weeklyBookings: 14,
    difficulty: 'Easy',
    category: 'xploranights',
    neighbourhood: 'Saint-Roch',
    vibes: ['romantic', 'cozy', 'late night'],
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
