import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';

const VIBES = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly'];
const NEIGHBOURHOODS = ['Vieux-Québec', 'Saint-Roch', 'Maguire', 'Saint-Jean-Baptiste', 'Montcalm', 'Limoilou'];

export function SearchHeader({ greeting }: { greeting?: string } = {}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'this morning';
    if (hour < 17) return 'this afternoon';
    if (hour < 21) return 'tonight';
    return 'right now';
  };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/itinerary?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          {greeting && <p className="text-base font-medium mb-1 opacity-80">{greeting}</p>}
          <h1 className="text-xl md:text-3xl mb-1">What's your vibe {getTimeOfDay()}?</h1>
          <p className="text-xs md:text-base opacity-70 md:hidden">Quebec City, QC</p>
        </div>

        {/* Text search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search experiences, neighbourhoods…"
            className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border-0 bg-white/90 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </form>

        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Vibe</p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map(v => (
              <button key={v} onClick={() => navigate(`/itinerary?vibe=${encodeURIComponent(v)}`)}
                className="px-3 py-1.5 bg-white/90 text-primary rounded-full text-sm capitalize hover:bg-white transition-colors">
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Neighbourhood</p>
          <div className="flex flex-wrap gap-2">
            {NEIGHBOURHOODS.map(n => (
              <button key={n} onClick={() => navigate(`/itinerary?neighbourhood=${encodeURIComponent(n)}`)}
                className="px-3 py-1.5 bg-white/90 text-secondary rounded-full text-sm hover:bg-white transition-colors">
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
