export interface Host {
  id: string;
  name: string;
  photo: string;
  tagline: string;
  bio: string;
  languages: string[];
  neighbourhoods: string[];
  hostsSince: string;
  experienceIds: string[];
}

export const hosts: Host[] = [
  {
    id: 'host-marc',
    name: 'Marc Bouchard',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    tagline: 'Maguire neighbourhood specialist · 6 years guiding',
    bio: 'Marc grew up on Avenue Maguire and has spent the last six years turning that knowledge into tours. He knows the baker by name, the café that still runs a cash-only tab for regulars, and the courtyard shortcuts most people walk past for years without noticing. His tours run at a pace that lets you actually take things in.',
    languages: ['English', 'Français'],
    neighbourhoods: ['Maguire', 'Montcalm', 'Sillery'],
    hostsSince: '2019',
    experienceIds: ['exp-maguire-tours', 'exp-3'],
  },
  {
    id: 'host-sophie',
    name: 'Sophie Tremblay',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    tagline: 'Food & culture guide · Old Port & Vieux-Québec',
    bio: 'Sophie worked in professional kitchens for eight years before pivoting to food tours. She built the Old Port Food & History Walk because she was tired of seeing people eat at the wrong places. Her tours combine real local food stops with the kind of historical context that makes it all make sense.',
    languages: ['English', 'Français'],
    neighbourhoods: ['Vieux-Québec', 'Petit-Champlain', 'Vieux-Port'],
    hostsSince: '2021',
    experienceIds: ['exp-10', 'exp-7'],
  },
  {
    id: 'host-jf',
    name: 'Jean-François Côté',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    tagline: 'Nightlife curator · Saint-Roch & Saint-Jean-Baptiste',
    bio: 'JF has been writing about Québec City\'s bar and music scene since 2015 and knows every bartender in Saint-Roch. The Jazz & Cocktails Evening grew out of a personal list he kept recommending to friends visiting the city. He runs a tight ship — small groups, no filler, and always ends somewhere worth staying.',
    languages: ['English', 'Français'],
    neighbourhoods: ['Saint-Roch', 'Saint-Jean-Baptiste'],
    hostsSince: '2022',
    experienceIds: ['exp-11', 'exp-6'],
  },
  {
    id: 'host-isabelle',
    name: 'Isabelle Roy',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    tagline: 'Art & architecture guide · Limoilou & Cartier',
    bio: 'Isabelle is an architectural historian who spent a decade working with Patrimoine Québec before deciding the stories were better heard on the street than in a library. She leads the Saint-Roch Neighbourhood Walk and specialises in how the city\'s creative scene took root in neighbourhoods everyone else had written off.',
    languages: ['Français', 'English'],
    neighbourhoods: ['Limoilou', 'Cartier', 'Saint-Roch'],
    hostsSince: '2023',
    experienceIds: ['exp-7'],
  },
];
