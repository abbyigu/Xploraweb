import { Heart, Compass, Sparkles, MapPin, Phone, Mail, Shield, Star, Users, Ticket } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';

export function AboutScreen() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground px-6 md:px-8 pt-12 pb-14 md:pt-20 md:pb-20">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-xs uppercase tracking-widest opacity-60">Xplora</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
            The city you know<br />has a side you haven't found yet
          </h1>
          <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto">
            Québec City has more to offer than what makes the tourist lists. Xplora exists to help you find the rest of it.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-20">

        {/* Mission */}
        <section className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-xplora-icon-bg flex items-center justify-center">
            <Compass className="w-7 h-7 text-xplora-primary" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Mission</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl">Explore Québec City the way insiders do</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Xplora exists to connect people with the best of Québec City — the spots worth finding, the events worth showing up for, and the experiences that don't make it onto generic travel lists. Whether you're here for a week or have lived here for years, we make it easier to explore with intention.
            </p>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Vision */}
        <section className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-xplora-accent-teal/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-xplora-accent-teal" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Vision</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl">A city most people never fully discover</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Every city has a version of itself that most people never find. Our vision is a Québec City where tourists go beyond the Old Port, where newcomers find their spots fast, and where long-time locals keep being surprised. Xplora is how that happens.
            </p>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Values */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-xplora-accent-green/10 flex items-center justify-center">
              <Heart className="w-7 h-7 text-xplora-accent-green" />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Values</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl">What we stand for</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: 'Local first',
                body: 'Every experience, partner, and perk is rooted in Québec City. We lift up the businesses and people that make this city worth exploring.',
              },
              {
                title: 'Real over polished',
                body: 'We skip the tourist-trap energy. Xplora is for people who want the honest, lived-in version of the city — whether they just arrived or have been here for years.',
              },
              {
                title: 'Discovery over algorithms',
                body: "We're not a feed. Every experience and perk on Xplora is hand-picked — no sponsored results, no generic lists.",
              },
              {
                title: 'Show up',
                body: 'Belonging is built by presence. We design everything — events, itineraries, perks — to give you a reason to actually get out the door.',
              },
            ].map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-2xl p-6 space-y-2">
                <h3 className="text-base font-medium text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Social proof counters */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Ticket className="w-5 h-5 text-primary" />, stat: '500+', label: 'Bookings made' },
            { icon: <Users className="w-5 h-5 text-primary" />, stat: '500+', label: 'Active explorers' },
            { icon: <Star className="w-5 h-5 text-yellow-500" />, stat: '4.9/5', label: '47 verified reviews' },
            { icon: <MapPin className="w-5 h-5 text-primary" />, stat: '50+', label: 'Curated experiences' },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center gap-2">
              {item.icon}
              <p className="text-2xl font-serif text-foreground">{item.stat}</p>
              <p className="text-xs text-muted-foreground leading-snug">{item.label}</p>
            </div>
          ))}
        </section>

        <div className="border-t border-border" />

        {/* Contact & trust */}
        <section className="grid sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl">Get in touch</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Questions, partnerships, or just want to say hi — we'd love to hear from you.
            </p>
            <div className="space-y-3">
              <a href="mailto:hello@goxplora.ca" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                hello@goxplora.ca
              </a>
              <a href="tel:+14188095588" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                +1 (418) 809-5588
              </a>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Québec City, QC, Canada<br />G1R 4P3</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl">Trusted & secure</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Payments by Stripe</p>
                  <p className="text-muted-foreground text-xs">256-bit SSL encryption on every transaction. Your card details never touch our servers.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Cancel anytime</p>
                  <p className="text-muted-foreground text-xs">Memberships and bookings can be cancelled with no questions asked.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Verified experiences</p>
                  <p className="text-muted-foreground text-xs">Every experience is hand-picked and verified by the Xplora team before it goes live.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <SimpleFooter />
    </div>
  );
}
