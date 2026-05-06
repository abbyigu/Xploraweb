import { SearchHeader } from './SearchHeader';
import { MeetupCard } from './MeetupCard';
import { DealCard } from './DealCard';
import { ExperienceCard } from './ExperienceCard';
import { EXPERIENCE_CATEGORIES } from '../data/products';
import { useExperiences } from '../hooks/useExperiences';
import { meetups, perks } from '../data/mockData';
import { Footer } from './Footer';
import { useNavigate } from 'react-router';

export function HomeScreen() {
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <SearchHeader />

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
        <section>
          <h2 className="text-xl md:text-2xl mb-6 md:mb-8">Curated for You</h2>
          <div className="space-y-10">
            {EXPERIENCE_CATEGORIES.map(cat => {
              const items = experiences.filter(e => e.category === cat.id);
              if (!items.length) return null;
              return (
                <div key={cat.id}>
                  <div className="mb-3">
                    <h3 className="text-lg font-medium">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.tagline}</p>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
                    {items.map(exp => (
                      <div key={exp.id} className="min-w-[260px] md:min-w-0 flex-shrink-0 md:flex-shrink">
                        <ExperienceCard exp={exp} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
