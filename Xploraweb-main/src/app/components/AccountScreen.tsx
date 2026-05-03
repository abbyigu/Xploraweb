import { useState } from 'react';
import { User, Mail, MapPin, Heart, Settings, Bell, Lock, LogOut, Camera } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';

export function AccountScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved'>('profile');

  const savedItineraries = [
    { id: 1, title: 'Artistic Soul of Quebec City', date: 'Saved on Apr 15, 2026' },
    { id: 2, title: 'Foodie\'s Paradise', date: 'Saved on Apr 20, 2026' },
  ];

  const savedPerks = [
    { id: 1, title: 'Secret dessert menu unlocked', venue: 'Café Névé', validUntil: 'May 1, 2026' },
    { id: 2, title: 'Skip the line access', venue: 'Musée National', validUntil: 'May 15, 2026' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="bg-primary text-primary-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary text-2xl">
                JD
              </div>
              <button className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground p-2 rounded-full">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl mb-1">John Doe</h1>
              <p className="text-sm opacity-90">john.doe@example.com</p>
              <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                Quebec City, QC
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-6">
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile & Settings
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Saved
            </button>
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-lg mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue="Quebec City, QC"
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90">
                Save Changes
              </button>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span>Notifications</span>
                </div>
              </button>
              <button className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span>Privacy & Security</span>
                </div>
              </button>
              <button className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors text-red-600">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-lg mb-4">Your Interests</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Food & Dining', 'Art & Culture', 'Nightlife', 'Outdoor Activities', 'History', 'Music & Events'].map((interest) => (
                  <div
                    key={interest}
                    className="p-3 rounded-xl border-2 border-primary bg-primary/10 text-primary text-sm text-center"
                  >
                    {interest}
                  </div>
                ))}
              </div>
              <button className="mt-4 text-primary hover:underline text-sm">
                Edit Interests
              </button>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-lg mb-4">Exploration Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Show me hidden gems</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span>Include family-friendly activities</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span>Budget-friendly options only</span>
                  <input type="checkbox" className="rounded" />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl mb-4">Saved Itineraries</h3>
              <div className="space-y-3">
                {savedItineraries.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors"
                  >
                    <div>
                      <h4 className="text-base mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    <Heart className="w-5 h-5 text-secondary fill-secondary" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl mb-4">Saved Perks</h3>
              <div className="space-y-3">
                {savedPerks.map((perk) => (
                  <div
                    key={perk.id}
                    className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors"
                  >
                    <div>
                      <h4 className="text-base mb-1">{perk.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {perk.venue} · Valid until {perk.validUntil}
                      </p>
                    </div>
                    <Heart className="w-5 h-5 text-secondary fill-secondary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}
