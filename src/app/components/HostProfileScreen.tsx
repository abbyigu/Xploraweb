import { useParams, useNavigate } from 'react-router';
import { Globe, MapPin, ChevronLeft, Calendar } from 'lucide-react';
import { hosts } from '../data/hosts';
import { experiences } from '../data/products';
import { ExperienceCard } from './ExperienceCard';
import { SimpleFooter } from './SimpleFooter';

export function HostProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const host = hosts.find(h => h.id === id);

  if (!host) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Guide not found.</p>
        <button onClick={() => navigate('/itinerary')} className="text-primary underline text-sm">
          Browse experiences →
        </button>
      </div>
    );
  }

  const hostExperiences = experiences.filter(e => host.experienceIds.includes(e.id));

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      {/* Back */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <img
            src={host.photo}
            alt={host.name}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0 ring-4 ring-primary/10"
          />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your guide</p>
            <h1 className="text-2xl md:text-3xl mb-1">{host.name}</h1>
            <p className="text-sm text-muted-foreground">{host.tagline}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                {host.languages.join(' · ')}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Guiding since {host.hostsSince}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 space-y-10 pb-12">
        {/* Bio */}
        <div className="border-t border-border pt-8">
          <p className="text-base text-foreground leading-relaxed">{host.bio}</p>
        </div>

        {/* Neighbourhoods */}
        <div>
          <h2 className="text-lg mb-4">Neighbourhoods</h2>
          <div className="flex flex-wrap gap-2">
            {host.neighbourhoods.map(n => (
              <button
                key={n}
                onClick={() => navigate(`/itinerary?neighbourhood=${encodeURIComponent(n)}`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-muted/40 hover:bg-muted/70 rounded-full text-sm transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Experiences */}
        {hostExperiences.length > 0 && (
          <div>
            <h2 className="text-lg mb-4">
              {hostExperiences.length === 1 ? 'Experience' : 'Experiences'} with {host.name.split(' ')[0]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hostExperiences.map(exp => (
                <ExperienceCard key={exp.id} exp={exp} />
              ))}
            </div>
          </div>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}
