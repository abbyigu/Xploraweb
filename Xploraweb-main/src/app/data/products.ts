export type ExperienceCategory = 'xplorators' | 'xploratours' | 'xploranights' | 'xploratorsplus' | 'limoilou' | 'cartier';

/** Distance/travel mode for a trail. Driving unlocks road-trip treks. */
export type TrailMode = 'walking' | 'driving';

/** Spot categories — used by the AI trek builder to assemble routes by interest. */
export const SPOT_CATEGORIES = ['Food', 'Cafe', 'Bar', 'Culture', 'Nature', 'Shopping', 'Family', 'History', 'Stays', 'Sweets'] as const;
export type SpotCategory = (typeof SPOT_CATEGORIES)[number];

/** Maps a canonical (English, DB-stored) spot category to its i18n key under `categories.*`. */
export const SPOT_CATEGORY_KEY: Record<string, string> = {
  Food: 'food', Cafe: 'cafe', Bar: 'bar', Culture: 'culture', Nature: 'nature',
  Shopping: 'shopping', Family: 'family', History: 'history', Stays: 'stays', Sweets: 'sweets',
};

/**
 * A Spot is a single, reusable place (a café, lookout, mural). Spots are the
 * atomic building blocks the AI assembles into trails/treks by vibe. They live
 * in their own library (xplora_spots) and carry NO distance or stop count —
 * those only make sense for a route.
 */
export interface Spot {
  id: string;
  name: string;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
  website?: string;
  michelinUrl?: string; // link to this spot's Michelin Guide page, if listed
  reservationUrl?: string; // link to book a table (e.g. OpenTable/Resy), if the spot takes reservations
  image?: string;
  neighbourhood?: string;
  vibes?: string[];
  category?: SpotCategory | string;
  isBrunch?: boolean;    // special highlight — spot is a great brunch pick
  isHotspot?: boolean;   // admin-curated — surfaced on the "Hotspots" home tile
  isLoved?: boolean;     // admin-curated — surfaced on the "Places We Love" home tile
  visitTime?: string;   // suggested time to spend, e.g. "20 min"
  priceRange?: string;  // relative cost, e.g. "$", "$$", "$$$"
  xploraTips?: string[]; // insider tips shown to explorers
  status?: string;
}

export const EXPERIENCE_CATEGORIES: { id: ExperienceCategory; name: string; tagline: string }[] = [
  { id: 'xplorators',    name: 'Xplorators',             tagline: 'Explore at your pace · Self-guided' },
  // Xplorators+, Xplora Nights, and Tours hidden for the moment
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
  spotIds?: string[];         // ordered references into the xplora_spots library
  spots?: Spot[];             // resolved spots (populated at read time when available)
  distance?: string;          // e.g. "2.4 km"
  distanceMode?: TrailMode;   // walking | driving
  neighbourhood?: string;
  vibes?: string[];
  availableDates?: string[]; // ISO dates e.g. ["2026-06-15", "2026-06-22"]
  availableTimes?: string[]; // 24-h e.g. ["10:00", "14:00", "18:00"]
  // event-specific (xploranights)
  eventDate?: string;   // ISO date: '2026-05-15'
  eventTime?: string;   // display string: '8:00 PM'
  eventType?: 'recurring' | 'seasonal' | 'one-time';

  // French counterparts for the static (non-DB) entries below. DB-backed
  // experiences/spots already carry their own `_fr` columns and go through
  // the `pick()` helper in useExperiences.ts/useSpots.ts instead.
  nameFr?: string;
  descriptionFr?: string;
  badgeFr?: string;
  durationFr?: string;
  difficultyFr?: string;
  longDescriptionFr?: string;
  includesFr?: string[];
  toBringFr?: string[];
  meetingPointFr?: string;
  highlightsFr?: string[];
  itineraryFr?: string[];
  eventTimeFr?: string;
}

/** Swaps in the `_fr` fields for the static experiences/merch above when the
 * current language is French, falling back to the English copy for anything
 * not yet translated. */
export function localizeProduct(p: Product, lang: string): Product {
  if (lang !== 'fr') return p;
  return {
    ...p,
    name: p.nameFr || p.name,
    description: p.descriptionFr || p.description,
    badge: p.badgeFr || p.badge,
    duration: p.durationFr || p.duration,
    difficulty: p.difficultyFr || p.difficulty,
    longDescription: p.longDescriptionFr || p.longDescription,
    includes: p.includesFr || p.includes,
    toBring: p.toBringFr || p.toBring,
    meetingPoint: p.meetingPointFr || p.meetingPoint,
    highlights: p.highlightsFr || p.highlights,
    itinerary: p.itineraryFr || p.itinerary,
    eventTime: p.eventTimeFr || p.eventTime,
  };
}

export const experiences: Product[] = [
  // Xplora-tors
  {
    id: 'exp-1',
    name: 'Artistic Soul of Quebec City',
    nameFr: 'L\'âme artistique de Québec',
    description: 'Street art, galleries, and indie cafes',
    descriptionFr: 'Art de rue, galeries et cafés indépendants',
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
    badgeFr: 'Gratuit',
    duration: 'Go at your own pace',
    durationFr: 'À votre rythme',
    spots: undefined,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xplorators',
    longDescription: `Xplora-tors is your free, self-guided adventure through Québec City. We give you a curated list of locations — neighbourhoods, murals, courtyards, lookouts — and you explore on your own terms. No schedule, no group, no guide. Just you and the city.\n\nThis route takes you through Saint-Roch's street art corridor, a hidden staircase in Old Quebec, a riverside lookout most locals don't know about, and a few spots worth stopping at just to sit and take it in.\n\nWant to go deeper? Each location on this route has a story behind it. If you'd like that context — the history, the people, the hidden layers — check out Xplora-stories, our narrative-led experience that brings these same places to life. Or join an Xplora-tours outing to discover the city alongside other members.`,
    longDescriptionFr: `Xplora-tors est votre aventure gratuite et autoguidée à travers Québec. Nous vous proposons une liste organisée d'endroits — quartiers, murales, cours intérieures, points de vue — et vous explorez à votre façon. Pas d'horaire, pas de groupe, pas de guide. Juste vous et la ville.\n\nCe parcours vous emmène à travers le corridor d'art urbain de Saint-Roch, un escalier caché du Vieux-Québec, un point de vue sur le fleuve que peu de gens du coin connaissent, et quelques arrêts qui valent la peine juste pour s'asseoir et prendre le temps.\n\nEnvie d'aller plus loin? Chaque endroit de ce parcours a une histoire derrière lui. Si vous voulez ce contexte — l'histoire, les gens, les couches cachées — découvrez Xplora-histoires, notre expérience narrative qui donne vie à ces mêmes lieux. Ou joignez-vous à une sortie Xplora-tours pour découvrir la ville avec d'autres membres.`,
    highlights: [
      'Completely free — no booking required',
      'Self-guided at your own pace',
      'Curated list of locations with addresses',
      'Works solo, with a friend, or with family',
      'Want more? Xplora-stories and Xplora-tours go deeper',
    ],
    highlightsFr: [
      'Entièrement gratuit — aucune réservation requise',
      'Autoguidé, à votre rythme',
      'Liste organisée de lieux avec adresses',
      'Fonctionne seul, entre amis ou en famille',
      'Envie de plus? Xplora-histoires et Xplora-tours vont plus loin',
    ],
    includes: [
      'Digital route map with all locations',
      'Brief description of each stop',
      'Tips on best time to visit each spot',
    ],
    includesFr: [
      'Carte numérique du parcours avec tous les lieux',
      'Brève description de chaque arrêt',
      'Conseils sur le meilleur moment pour visiter chaque endroit',
    ],
    toBring: [
      'Comfortable walking shoes',
      'Your phone for the map',
      'A sense of curiosity',
    ],
    toBringFr: [
      'Souliers de marche confortables',
      'Votre téléphone pour la carte',
      'Un brin de curiosité',
    ],
    meetingPoint: 'Start anywhere on the route — fully flexible',
    meetingPointFr: 'Commencez où vous voulez sur le parcours — entièrement flexible',
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
    itineraryFr: [
      'Place des Arts, Saint-Roch — Commencez à cette galerie à ciel ouvert qui ancre le quartier créatif',
      "Rue Saint-Joseph Est — Parcourez l'artère principale de Saint-Roch, bordée de cafés indépendants et de boutiques",
      "Murale du chemin Sainte-Foy — Une murale de quatre étages peinte par un collectif local; se voit mieux de l'autre côté de la rue",
      "Café Largo — Un incontournable du quartier avec brique apparente et art rotatif sur les murs; vaut l'arrêt",
      'Escalier Casse-Cou — Le plus vieil escalier en Amérique du Nord, reliant la Basse-Ville au Vieux-Québec',
      "Rue du Trésor — Galerie à ciel ouvert où des artistes locaux vendent estampes et œuvres originales toute l'année",
      'Terrasse Dufferin — Terminez votre parcours ici pour une vue panoramique sur le fleuve Saint-Laurent',
    ],
  },
  {
    id: 'exp-5',
    name: 'Nature & Parks',
    nameFr: 'Nature et parcs',
    description: 'Green spaces and waterfront trails',
    descriptionFr: 'Espaces verts et sentiers riverains',
    price: 0,
    image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Free',
    badgeFr: 'Gratuit',
    duration: 'Go at your own pace',
    durationFr: 'À votre rythme',
    spots: undefined,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xplorators',
    itinerary: [
      'Parc de la Rivière-Saint-Charles — A 32km linear park along the river; start near the Dorchester bridge',
      'Domaine Maizerets — Hidden arboretum with over 200 tree species, a pond, and heritage greenhouses',
      'Parc du Bois-de-Coulonge — Former lieutenant-governor estate turned public park with river views',
      'Plaines d\'Abraham — Historic battlefield turned urban park at the heart of the city',
      'Bassin Louise — Waterfront promenade with sailboats, terraces, and views of the port',
      'Parc de la Chute-Montmorency — End with Québec\'s most dramatic natural sight: a waterfall taller than Niagara',
    ],
    itineraryFr: [
      'Parc de la Rivière-Saint-Charles — Un parc linéaire de 32 km le long de la rivière; départ près du pont Dorchester',
      "Domaine Maizerets — Arboretum caché avec plus de 200 espèces d'arbres, un étang et des serres patrimoniales",
      'Parc du Bois-de-Coulonge — Ancien domaine du lieutenant-gouverneur devenu parc public avec vue sur le fleuve',
      "Plaines d'Abraham — Champ de bataille historique devenu parc urbain au cœur de la ville",
      'Bassin Louise — Promenade riveraine avec voiliers, terrasses et vue sur le port',
      'Parc de la Chute-Montmorency — Terminez avec le site naturel le plus spectaculaire de Québec : une chute plus haute que le Niagara',
    ],
  },
  {
    id: 'exp-9',
    name: 'Hidden Staircases & Passages',
    nameFr: 'Escaliers et passages cachés',
    description: 'Secret shortcuts and forgotten corridors of Old Quebec',
    descriptionFr: 'Raccourcis secrets et corridors oubliés du Vieux-Québec',
    price: 0,
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Free',
    badgeFr: 'Gratuit',
    duration: 'Go at your own pace',
    durationFr: 'À votre rythme',
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xplorators',
    itinerary: [
      'Escalier Casse-Cou — The steepest and oldest staircase in North America, connecting Petit-Champlain to Old Quebec',
      'Passage du Chien-d\'Or — A narrow alley tucked behind the post office with a carved stone golden dog above the door',
      'Escalier du Faubourg — A lesser-known staircase locals use as a shortcut between Saint-Jean-Baptiste and Saint-Roch',
      'Rue Sous-le-Fort — A one-lane street running beneath the cliff face; look up for the best view of the Château',
      'Tunnel under the Citadelle — A short pedestrian passage carved through the old fortifications',
      'Côte de la Montagne — The historic road connecting Upper and Lower Town, lined with 17th century stone walls',
    ],
    itineraryFr: [
      "Escalier Casse-Cou — L'escalier le plus abrupt et le plus vieux en Amérique du Nord, reliant le Petit-Champlain au Vieux-Québec",
      "Passage du Chien-d'Or — Une ruelle étroite cachée derrière le bureau de poste, avec un chien d'or sculpté au-dessus de la porte",
      "Escalier du Faubourg — Un escalier moins connu que les gens du coin utilisent comme raccourci entre Saint-Jean-Baptiste et Saint-Roch",
      'Rue Sous-le-Fort — Une rue à une voie qui longe le pied de la falaise; levez les yeux pour la meilleure vue sur le Château',
      'Tunnel sous la Citadelle — Un court passage piétonnier creusé à même les anciennes fortifications',
      'Côte de la Montagne — La route historique reliant la Haute-Ville et la Basse-Ville, bordée de murs de pierre du 17e siècle',
    ],
  },
  // Xplora-tours
  {
    id: 'exp-3',
    name: 'Urban Explorer',
    nameFr: 'Explorateur urbain',
    description: 'Architecture and city secrets',
    descriptionFr: 'Architecture et secrets de la ville',
    price: 4000,
    image: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: 'Half Day',
    durationFr: 'Demi-journée',
    spots: 6,
    difficulty: 'Moderate',
    difficultyFr: 'Modéré',
    category: 'xploratours',
  },
  {
    id: 'exp-7',
    name: 'Saint-Roch Neighbourhood Walk',
    nameFr: 'Balade dans le quartier Saint-Roch',
    description: 'Explore the creative heart of Québec City together',
    descriptionFr: 'Explorez ensemble le cœur créatif de Québec',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '2 hours',
    durationFr: '2 heures',
    spots: 8,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploratours',
  },
  {
    id: 'exp-10',
    name: 'Old Port Food & History Walk',
    nameFr: 'Balade gourmande et historique du Vieux-Port',
    description: 'Taste local flavours while uncovering 400 years of history',
    descriptionFr: "Goûtez aux saveurs locales tout en découvrant 400 ans d'histoire",
    price: 4500,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '3 hours',
    durationFr: '3 heures',
    spots: 8,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploratours',
  },
  {
    id: 'exp-maguire-tours',
    name: 'Xploratours · Maguire',
    description: 'Guided walk through one of Québec City\'s most charming streets',
    descriptionFr: 'Balade guidée dans l\'une des rues les plus charmantes de Québec',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: '2 hours',
    durationFr: '2 heures',
    spots: 8,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploratours',
    neighbourhood: 'Maguire',
    highlights: [
      'Small group — max 8 people',
      'Local host with real neighbourhood knowledge',
      'Stops at places not on any tourist map',
      'Includes a tasting stop along the route',
    ],
    highlightsFr: [
      'Petit groupe — maximum 8 personnes',
      'Hôte local avec une connaissance approfondie du quartier',
      'Arrêts dans des endroits absents des cartes touristiques',
      'Comprend un arrêt dégustation en cours de route',
    ],
    includes: [
      'Guided 2-hour walk with local host',
      'One tasting stop (bagels or pastry)',
      'Digital recap with all stop addresses after the tour',
    ],
    includesFr: [
      'Balade guidée de 2 heures avec un hôte local',
      'Un arrêt dégustation (bagels ou pâtisserie)',
      'Récapitulatif numérique avec les adresses de tous les arrêts après la visite',
    ],
    toBring: [
      'Comfortable walking shoes',
      'Light layer (mornings can be cool)',
    ],
    toBringFr: [
      'Souliers de marche confortables',
      'Une couche légère (les matins peuvent être frais)',
    ],
    meetingPoint: 'Corner of Avenue Maguire & Rue du Chalutier — details sent on booking',
    meetingPointFr: 'Coin de l\'avenue Maguire et de la rue du Chalutier — détails envoyés à la réservation',
    languages: ['English', 'Français'],
    itinerary: [
      'Meet at the corner — quick intro, no fluff',
      'Boulangerie stop — first tasting, story of the baker',
      'The main strip walk — architecture, shopfronts, what changed and what hasn\'t',
      'Hidden courtyard — the one locals use as a shortcut',
      'Neighbourhood café — off-menu order if you want it',
      'Parc de Sillery lookout — wrap-up with a view',
    ],
    itineraryFr: [
      'Rendez-vous au coin de rue — brève introduction, sans détour',
      'Arrêt boulangerie — première dégustation, histoire du boulanger',
      'Balade sur l\'artère principale — architecture, devantures, ce qui a changé et ce qui reste',
      'Cour cachée — celle que les gens du coin utilisent comme raccourci',
      'Café du quartier — commande hors-menu si vous le souhaitez',
      'Point de vue du parc de Sillery — conclusion avec vue',
    ],
  },
  // Xplorators+
  {
    id: 'exp-maguire-plus',
    name: 'Xplorators+ · Maguire',
    description: 'The full Maguire story — deeper context, insider stops & member pricing',
    descriptionFr: "L'histoire complète de Maguire — contexte approfondi, arrêts d'initiés et tarif membre",
    price: 1500,
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Members',
    badgeFr: 'Membres',
    duration: 'Go at your own pace',
    durationFr: 'À votre rythme',
    spots: undefined,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploratorsplus',
    neighbourhood: 'Maguire',
    highlights: [
      'Everything in Xplorators · Maguire, plus',
      'Audio narration at every stop',
      'Insider stops not on the free route',
      'Historical context and neighbourhood stories',
      'Member pricing ($15 → $10 with membership)',
    ],
    highlightsFr: [
      'Tout ce qui est inclus dans Xplorators · Maguire, plus',
      'Narration audio à chaque arrêt',
      "Arrêts d'initiés absents du parcours gratuit",
      'Contexte historique et anecdotes du quartier',
      "Tarif membre (15 $ → 10 $ avec l'abonnement)",
    ],
    includes: [
      'Full self-guided route with audio at each stop',
      'Extended itinerary with 3 bonus insider locations',
      'Neighbourhood history notes',
    ],
    includesFr: [
      'Parcours autoguidé complet avec audio à chaque arrêt',
      "Itinéraire étendu avec 3 arrêts bonus d'initiés",
      'Notes historiques sur le quartier',
    ],
    toBring: [
      'Earbuds or headphones for audio',
      'Walking shoes',
      'An appetite',
    ],
    toBringFr: [
      "Écouteurs pour l'audio",
      'Souliers de marche',
      "De l'appétit",
    ],
    meetingPoint: 'Start anywhere on the route — route begins at the north end of Avenue Maguire',
    meetingPointFr: "Commencez où vous voulez sur le parcours — il débute à l'extrémité nord de l'avenue Maguire",
    languages: ['English', 'Français'],
    itinerary: [
      'North end of Maguire — audio intro sets the scene; 2-minute listen before you start walking',
      'First bagel stop — extended audio on the history of this block and who used to live here',
      'Rue Marly detour — bonus stop not on the free route; a courtyard with a story',
      'The old pharmacy — now a café, but the tile work inside is original 1940s',
      'Hidden passage — audio explains why this alley existed and what it connected',
      'Lookout point — final audio note, a local\'s perspective on why this neighbourhood matters',
    ],
    itineraryFr: [
      "Extrémité nord de Maguire — l'intro audio plante le décor; 2 minutes d'écoute avant de commencer",
      "Premier arrêt bagel — audio détaillé sur l'histoire du coin et ses anciens résidents",
      "Détour rue Marly — arrêt bonus absent du parcours gratuit; une cour avec une histoire",
      "L'ancienne pharmacie — aujourd'hui un café, mais le carrelage intérieur date des années 1940",
      "Passage caché — l'audio explique pourquoi cette ruelle existait et ce qu'elle reliait",
      "Point de vue — dernière note audio, le regard d'un habitué sur l'importance de ce quartier",
    ],
  },
  // Xplora Nights
  {
    id: 'exp-6',
    name: 'Nightlife Tour',
    nameFr: 'Tournée de la vie nocturne',
    description: 'Best bars, clubs, and late-night eats in Old Quebec and Saint-Roch',
    descriptionFr: 'Les meilleurs bars, clubs et bouffe de fin de soirée du Vieux-Québec et de Saint-Roch',
    price: 6000,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'New',
    badgeFr: 'Nouveau',
    duration: 'Evening',
    durationFr: 'Soirée',
    spots: 5,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploranights',
    eventDate: '2026-05-15',
    eventTime: '9:00 PM',
    eventTimeFr: '21 h',
    eventType: 'one-time',
    meetingPoint: 'Place D\'Youville — corner entrance, Old Quebec',
    meetingPointFr: "Place D'Youville — entrée du coin, Vieux-Québec",
    languages: ['English', 'Français'],
  },
  {
    id: 'exp-8',
    name: 'Rooftop 5 à 7',
    nameFr: '5 à 7 sur les toits',
    description: 'Members-only drinks and views on the best rooftop terrace in the city',
    descriptionFr: 'Boissons et vue réservées aux membres sur la meilleure terrasse sur toit en ville',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Members Only',
    badgeFr: 'Membres seulement',
    duration: 'Evening',
    durationFr: 'Soirée',
    spots: 20,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploranights',
    eventDate: '2026-05-16',
    eventTime: '5:00 PM',
    eventTimeFr: '17 h',
    eventType: 'recurring',
    meetingPoint: 'Le Perché Rooftop — 263 Rue Saint-Vallier O, Saint-Roch',
    meetingPointFr: 'Le Perché Rooftop — 263, rue Saint-Vallier O., Saint-Roch',
    languages: ['English', 'Français'],
  },
  {
    id: 'exp-11',
    name: 'Jazz & Cocktails Evening',
    nameFr: 'Soirée jazz et cocktails',
    description: 'Live jazz, craft cocktails, and the best hidden bars in the city',
    descriptionFr: 'Jazz en direct, cocktails artisanaux et les meilleurs bars cachés en ville',
    price: 5500,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Popular',
    badgeFr: 'Populaire',
    duration: 'Evening',
    durationFr: 'Soirée',
    spots: 10,
    difficulty: 'Easy',
    difficultyFr: 'Facile',
    category: 'xploranights',
    eventDate: '2026-05-22',
    eventTime: '7:30 PM',
    eventTimeFr: '19 h 30',
    eventType: 'seasonal',
    meetingPoint: 'Chez Maurice — 575 Grande Allée Est, Montcalm',
    meetingPointFr: 'Chez Maurice — 575, Grande Allée Est, Montcalm',
    languages: ['English'],
  },
];

export const merch: Product[] = [
  {
    id: 'merch-1',
    name: 'Xplora Tote Bag',
    nameFr: 'Sac fourre-tout Xplora',
    description: 'Canvas tote — carry the city with you',
    descriptionFr: 'Sac en toile — emportez la ville avec vous',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
  {
    id: 'merch-2',
    name: 'Xplora Water Bottle',
    nameFr: "Bouteille d'eau Xplora",
    description: 'Insulated 500ml — stay hydrated on every adventure',
    descriptionFr: 'Isolée 500 ml — restez hydraté à chaque aventure',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
  {
    id: 'merch-3',
    name: 'Québec City Map Print',
    nameFr: 'Affiche illustrée de Québec',
    description: 'Illustrated art print — 8×10 inch, ready to frame',
    descriptionFr: 'Estampe illustrée — 8 x 10 po, prête à encadrer',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'merch',
  },
  {
    id: 'merch-4',
    name: 'Xplora Cap',
    nameFr: 'Casquette Xplora',
    description: 'Adjustable embroidered cap',
    descriptionFr: 'Casquette brodée ajustable',
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
