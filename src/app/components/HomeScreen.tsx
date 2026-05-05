import { SearchHeader } from './SearchHeader';
import { MeetupCard } from './MeetupCard';
import { DealCard } from './DealCard';
import { ExperienceCard } from './ExperienceCard';
import { experiences } from '../data/products';
import { meetups, perks } from '../data/mockData';
import { Footer } from './Footer';
import { useNavigate } from 'react-router';

export function HomeScreen() {
  const navigate = useNavigate();
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

        {/* Membership banner */}
        <section>
          <div
            className="bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => navigate('/membership')}
          >
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Club Horizon</p>
              <h2 className="text-xl md:text-2xl mb-2">Become a Member</h2>
              <ul className="space-y-1 text-sm opacity-90">
                <li>🎟️ 48h early access to all experiences</li>
                <li>👫 1 free guest pass every month</li>
                <li>🍸 Monthly members-only 5 à 7</li>
              </ul>
            </div>
            <div className="text-center md:text-right flex-shrink-0">
              <p className="text-3xl font-serif">$10</p>
              <p className="text-sm opacity-80">/month</p>
              <button className="mt-3 bg-white text-primary px-5 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                Learn more
              </button>
            </div>
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
