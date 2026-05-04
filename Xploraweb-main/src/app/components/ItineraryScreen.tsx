import { Clock, Users, MapPin, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SimpleFooter } from './SimpleFooter';
import { experiences } from '../data/products';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export function ItineraryScreen() {
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  const handleAdd = (exp: typeof experiences[0]) => {
    addItem(exp);
    setAdded(exp.id);
    setTimeout(() => setAdded(null), 1500);
  };

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
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <ImageWithFallback
                  src={exp.image}
                  alt={exp.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {exp.duration}
                </div>
                {exp.badge && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
                    {exp.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg mb-1">{exp.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {exp.spots} spots
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {exp.difficulty}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">${(exp.price / 100).toFixed(0)}</span>
                  <button
                    onClick={() => handleAdd(exp)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      added === exp.id
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {added === exp.id ? 'Added!' : 'Book'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
