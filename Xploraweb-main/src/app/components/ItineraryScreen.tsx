import { SimpleFooter } from './SimpleFooter';
import { experiences } from '../data/products';
import { ExperienceCard } from './ExperienceCard';

export function ItineraryScreen() {
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
          {experiences.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
