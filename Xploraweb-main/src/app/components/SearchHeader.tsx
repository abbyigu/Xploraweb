import { useNavigate } from 'react-router';

export function SearchHeader({ greeting }: { greeting?: string } = {}) {
  const navigate = useNavigate();

  const vibes = [
    { label: '🍷 Date night',    category: 'xploranights'   },
    { label: '🌿 Chill solo',    category: 'xplorators'     },
    { label: '🎉 With friends',  category: 'xploratours'    },
    { label: '🎨 Something new', category: 'xploratorsplus' },
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'this morning';
    if (hour < 17) return 'this afternoon';
    if (hour < 21) return 'tonight';
    return 'right now';
  };

  return (
    <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            {greeting && <p className="text-base font-medium mb-1 opacity-80">{greeting}</p>}
            <h1 className="text-xl md:text-3xl mb-1">What's your vibe {getTimeOfDay()}?</h1>
            <p className="text-xs md:text-base opacity-90 md:hidden">Quebec City, QC</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {vibes.map((vibe) => (
            <button
              key={vibe.category}
              onClick={() => navigate(`/itinerary?category=${vibe.category}`)}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
            >
              {vibe.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
