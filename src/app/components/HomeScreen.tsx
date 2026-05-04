import { SearchHeader } from './SearchHeader';
import { MeetupCard } from './MeetupCard';
import { DealCard } from './DealCard';
import { ExperienceCard } from './ExperienceCard';
import { experiences } from '../data/products';
import { meetups, perks } from '../data/mockData';
import { Footer } from './Footer';

export function HomeScreen() {
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <SearchHeader />

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
        <section>
          <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Curated for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {experiences.slice(0, 3).map(exp => <ExperienceCard key={exp.id} exp={exp} />)}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl mb-4 md:mb-6">5 à 7 Meetups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {meetups.map((meetup) => (
              <MeetupCard key={meetup.id} {...meetup} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Unlocked Spots</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {perks.map((perk) => (
              <DealCard key={perk.id} {...perk} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
