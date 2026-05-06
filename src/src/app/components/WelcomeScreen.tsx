import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Compass, Users, Tag, ArrowRight } from 'lucide-react';
import { XploraLogo } from './XploraLogo';

export function WelcomeScreen() {
  const [step, setStep] = useState(0);
  const [selectedCity, setSelectedCity] = useState('');
  const navigate = useNavigate();

  const cities = [
    'Quebec City, QC',
    'Montreal, QC',
    'Toronto, ON',
    'Vancouver, BC',
    'Ottawa, ON',
  ];

  const features = [
    {
      icon: Compass,
      title: 'Curated Experiences',
      description: 'Discover hidden gems and local favorites tailored to your interests',
    },
    {
      icon: Users,
      title: 'Meet Locals',
      description: 'Connect with people at 5 à 7 meetups and social events',
    },
    {
      icon: Tag,
      title: 'Exclusive Deals',
      description: 'Unlock special offers at restaurants, bars, and attractions',
    },
  ];

  const handleGetStarted = () => {
    if (selectedCity) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {step === 0 && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-8">
              <XploraLogo variant="full" className="h-32" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl">Welcome to Xplora</h1>
              <p className="text-xl text-muted-foreground">
                Your guide to authentic local experiences
              </p>
            </div>

            <div className="grid gap-6 mt-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 border border-border flex items-start gap-4 text-left"
                >
                  <div className="bg-primary/10 rounded-xl p-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-8"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl">Where are you exploring?</h2>
              <p className="text-lg text-muted-foreground">
                Choose your city to get personalized recommendations
              </p>
            </div>

            <div className="space-y-3 mt-8">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    selectedCity === city
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${selectedCity === city ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-lg">{city}</span>
                  </div>
                  {selectedCity === city && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleGetStarted}
              disabled={!selectedCity}
              className={`w-full py-4 rounded-2xl text-lg flex items-center justify-center gap-2 mt-8 transition-opacity ${
                selectedCity
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
