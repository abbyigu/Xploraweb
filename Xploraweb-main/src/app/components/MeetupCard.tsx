import { Users, MapPin } from 'lucide-react';

interface MeetupCardProps {
  title: string;
  time: string;
  attendees: number;
  location: string;
  perk?: string;
}

export function MeetupCard({ title, time, attendees, location, perk }: MeetupCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border hover:border-secondary transition-colors cursor-pointer group">
      <h3 className="text-base mb-1 leading-snug group-hover:text-secondary transition-colors">{title}</h3>
      {perk && (
        <p className="text-sm text-secondary mb-2">{perk}</p>
      )}
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          {attendees} going
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {location}
        </div>
      </div>
    </div>
  );
}
