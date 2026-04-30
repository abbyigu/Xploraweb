import { Link } from 'react-router';
import { Compass, Users, Tag, MapPin, ArrowRight } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Footer } from './Footer';

export function LandingPage() {
  const features = [
    {
      icon: Compass,
      title: 'Curated Experiences',
      description: 'Discover hidden gems and authentic local experiences beyond tourist traps',
    },
    {
      icon: Users,
      title: 'Meet Locals',
      description: 'Connect with fellow explorers and locals at exclusive meetup events',
    },
    {
      icon: Tag,
      title: 'Exclusive Deals',
      description: 'Unlock special perks at the best restaurants, bars, and attractions',
    },
  ];

  const highlights = [
    {
      image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      title: 'Art & Culture',
    },
    {
      image: 'https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      title: 'Food & Drink',
    },
    {
      image: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      title: 'Urban Exploration',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <XploraLogo variant="full" className="h-32 md:h-48" />

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl md:text-5xl">
                Real plans in seconds
              </h1>
              <p className="text-base md:text-xl opacity-90">
                Your personal guide to authentic experiences, hidden gems, and local connections
              </p>
              <div className="pt-2">
                <p className="text-lg md:text-2xl text-secondary">
                  No more scrolling. Just go.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/40 backdrop-blur-sm text-foreground rounded-2xl text-lg hover:bg-white/50 transition-colors flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm opacity-75 mt-4">
              <MapPin className="w-4 h-4" />
              <span>Available in Quebec City, Montreal, Toronto & more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Why Xplora?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We connect you with the soul of every city through curated experiences and local insights
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Section */}
      <div className="bg-muted/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Explore Every Corner</h2>
            <p className="text-lg text-muted-foreground">
              From street art to secret cafes, discover what makes each city unique
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="relative h-64 md:h-80 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <ImageWithFallback
                  src={highlight.image}
                  alt={highlight.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <h3 className="text-white text-2xl p-6">{highlight.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl mb-4">Ready to Start Exploring?</h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of explorers discovering their cities in a whole new way
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-2xl text-lg hover:opacity-90 transition-opacity"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
