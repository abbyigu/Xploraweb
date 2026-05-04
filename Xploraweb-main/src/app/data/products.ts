export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents CAD
  image: string;
  type: 'experience' | 'merch' | 'membership';
  badge?: string;
  // experience-specific
  duration?: string;
  spots?: number;
  difficulty?: string;
}

export const experiences: Product[] = [
  {
    id: 'exp-1',
    name: 'Artistic Soul of Quebec City',
    description: 'Street art, galleries, and indie cafes',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    badge: 'Popular',
    duration: 'Full Day',
    spots: 5,
    difficulty: 'Easy',
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
  },
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
  },
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
  },
  {
    id: 'exp-5',
    name: 'Nature & Parks',
    description: 'Green spaces and waterfront trails',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience',
    duration: 'Half Day',
    spots: 4,
    difficulty: 'Moderate',
  },
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
    id: 'member-curieux',
    name: 'Curieux Membership',
    description: '20% off outings, community access, La Boussole quarterly',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: '/month',
  },
  {
    id: 'member-explorateur',
    name: 'Explorateur Membership',
    description: '30% off outings, priority booking, La Boussole quarterly',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: 'Most Popular',
  },
  {
    id: 'member-vagabond',
    name: 'Vagabond Membership',
    description: '40% off outings, 1 guest pass/month, exclusive partner perks',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'membership',
    badge: '/month',
  },
];
