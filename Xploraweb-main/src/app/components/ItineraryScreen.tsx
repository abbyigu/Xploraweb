import { Clock, Users, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SimpleFooter } from './SimpleFooter';

export function ItineraryScreen() {
  const itineraries = [
    {
      id: 1,
      title: "Artistic Soul of Quebec City",
      description: "Street art, galleries, and indie cafes",
      image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      duration: "Full Day",
      spots: 5,
      difficulty: "Easy",
    },
    {
      id: 2,
      title: "Foodie's Paradise",
      description: "Local markets and hidden culinary gems",
      image: "https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      duration: "4 hours",
      spots: 4,
      difficulty: "Easy",
    },
    {
      id: 3,
      title: "Urban Explorer",
      description: "Architecture and city secrets",
      image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      duration: "Half Day",
      spots: 6,
      difficulty: "Moderate",
    },
    {
      id: 4,
      title: "Historic Old Quebec",
      description: "Walk through centuries of history",
      image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      duration: "3 hours",
      spots: 5,
      difficulty: "Easy",
    },
    {
      id: 5,
      title: "Nature & Parks",
      description: "Green spaces and waterfront trails",
      image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      duration: "Half Day",
      spots: 4,
      difficulty: "Moderate",
    },
    {
      id: 6,
      title: "Nightlife Tour",
      description: "Best bars, clubs, and late-night eats",
      image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
      duration: "Evening",
      spots: 5,
      difficulty: "Easy",
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl mb-1">Explore Itineraries</h1>
            <p className="text-sm md:text-base opacity-90">Curated experiences waiting for you</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="relative h-48">
                <ImageWithFallback
                  src={itinerary.image}
                  alt={itinerary.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {itinerary.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg mb-1">{itinerary.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{itinerary.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {itinerary.spots} spots
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {itinerary.difficulty}
                  </div>
                </div>
                <button className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-xl text-sm hover:opacity-90 transition-opacity">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
