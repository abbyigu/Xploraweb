import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';

function getLang(): 'en' | 'fr' {
  return (localStorage.getItem('xplora-lang') as 'en' | 'fr') || 'en';
}

const VIBES = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly'];
const NEIGHBOURHOODS = ['Vieux-Québec', 'Saint-Roch', 'Maguire', 'Saint-Jean-Baptiste', 'Montcalm', 'Limoilou'];

export function SearchHeader({ greeting }: { greeting?: string } = {}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'en' | 'fr'>(getLang);

  function toggleLang() {
    const next = lang === 'en' ? 'fr' : 'en';
    setLang(next);
    localStorage.setItem('xplora-lang', next);
    document.documentElement.lang = next;
  }

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
        <div className="flex items-start justify-between">
          <div>
            {greeting && <p className="text-base font-medium mb-1 opacity-80">{greeting}</p>}
            <h1 className="text-xl md:text-3xl mb-1">What's your vibe {getTimeOfDay()}?</h1>
            <p className="text-xs opacity-70 md:hidden">Québec City, QC</p>
          </div>
          <button
            onClick={toggleLang}
            aria-label={lang === 'en' ? 'Switch to French' : 'Passer en anglais'}
            className="md:hidden flex-shrink-0 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium hover:bg-white/30 transition-colors min-w-[44px] text-center"
          >
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        {/* Text search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Québec City experiences…"
            className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border-0 bg-white/90 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </form>

        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Vibe</p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map(v => (
              <button key={v} onClick={() => navigate(`/itinerary?vibe=${encodeURIComponent(v)}`)}
                className="px-4 py-2.5 min-h-[44px] bg-white/90 text-foreground rounded-full text-sm capitalize hover:bg-white transition-colors font-medium">
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
                className="px-4 py-2.5 min-h-[44px] bg-white/90 text-foreground rounded-full text-sm font-medium hover:bg-white transition-colors">
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
