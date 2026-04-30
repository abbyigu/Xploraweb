import { Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CuratedDayCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  mood: string;
  bestFor: string[];
}

export function CuratedDayCard({ title, description, image, duration, mood, bestFor }: CuratedDayCardProps) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative h-48">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {duration}
        </div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
          {mood}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="text-xs text-muted-foreground">
          best for: {bestFor.join(' / ')}
        </div>
      </div>
    </div>
  );
}
