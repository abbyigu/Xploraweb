import { SimpleFooter } from './SimpleFooter';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { ExperienceCard } from './ExperienceCard';
import { useExperiences } from '../hooks/useExperiences';

export function ItineraryScreen() {
  const { experiences } = useExperiences();
  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">Experiences</h1>
          <p className="text-sm md:text-base opacity-90">Find your next adventure in Québec City</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-12">
        {EXPERIENCE_CATEGORIES.map(cat => {
          const items = experiences.filter(e => e.category === cat.id);
          if (!items.length) return null;
          return (
            <section key={cat.id}>
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl">{cat.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{cat.tagline}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {items.map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
              </div>
            </section>
          );
        })}
      </div>

      <SimpleFooter />
    </div>
  );
}
