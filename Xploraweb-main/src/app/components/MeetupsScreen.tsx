import { Clock, Users, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';

export function MeetupsScreen() {
  const { t } = useTranslation();
  const meetups = [
    {
      id: 1,
      title: "Tonight 6–8pm — Chill 5à7 @ Le Perché",
      description: "First drink perk included",
      time: "Tonight, 6:00 PM",
      urgency: "happening soon",
      attendees: 12,
      maxAttendees: 15,
      location: "Le Perché",
      address: "Downtown rooftop",
      image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      vibe: "casual drinks",
      host: "Alex + 4 regulars",
    },
    {
      id: 2,
      title: "Right now — Coffee crew @ Café Névé",
      description: "We're here until noon, join anytime",
      time: "Now until 12pm",
      urgency: "live now",
      attendees: 6,
      maxAttendees: 10,
      location: "Café Névé",
      address: "Saint-Roch",
      image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      vibe: "work & chill",
      host: "Marie + friends",
    },
    {
      id: 3,
      title: "Tomorrow 2pm — Street art walk",
      description: "Thomas knows all the hidden spots",
      time: "Sat 2:00 PM",
      urgency: "tomorrow",
      attendees: 6,
      maxAttendees: 10,
      location: "Starting at Café Névé",
      address: "Saint-Roch",
      image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      vibe: "explore",
      host: "Thomas B.",
    },
    {
      id: 4,
      title: "Saturday 7pm — Wine & conversation",
      description: "Small group, good wine, no pressure",
      time: "Sat 7:00 PM",
      urgency: "this weekend",
      attendees: 8,
      maxAttendees: 12,
      location: "Petit-Champlain Wine Bar",
      address: "Old Quebec",
      image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      vibe: "intimate",
      host: "Sophie M.",
    },
    {
      id: 5,
      title: "Sunday 9:30am — Yoga then brunch",
      description: "Riverside flow + food after",
      time: "Sun 9:30 AM",
      urgency: "this weekend",
      attendees: 8,
      maxAttendees: 15,
      location: "Old Port riverside",
      address: "Meeting at the pier",
      image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      vibe: "active",
      host: "Emma R.",
    },
    {
      id: 6,
      title: "Sunday 5pm — Golden hour photo walk",
      description: "Bring a camera (phone is fine)",
      time: "Sun 5:00 PM",
      urgency: "this weekend",
      attendees: 4,
      maxAttendees: 8,
      location: "Dufferin Terrace",
      address: "Old Quebec",
      image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      vibe: "creative",
      host: "Lucas P.",
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl mb-1">{t('meetups.title')}</h1>
            <p className="text-sm md:text-base opacity-90">{t('meetups.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {meetups.map((meetup) => (
            <div
              key={meetup.id}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="relative h-40">
                <ImageWithFallback
                  src={meetup.image}
                  alt={meetup.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                  {meetup.urgency}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {meetup.attendees} {t('meetups.going')}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base mb-1 leading-snug">{meetup.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{meetup.description}</p>

                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {meetup.location}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {meetup.host}
                  </div>
                </div>

                <button className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity font-medium">
                  {t('meetups.imIn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
