import { useState, useEffect, useRef } from 'react';
import { Heart, Bell, Lock, LogOut, Camera } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { supabase, getProfile, upsertProfile } from '../lib/supabase';
import { useNavigate } from 'react-router';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function AccountScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved'>('profile');
  const [profile, setProfile] = useState({ name: '', email: '', location: 'Quebec City, QC', interests: [] as string[], avatar_url: null as string | null });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedItineraries = [
    { id: 1, title: 'Artistic Soul of Quebec City', date: 'Saved on Apr 15, 2026' },
    { id: 2, title: "Foodie's Paradise", date: 'Saved on Apr 20, 2026' },
  ];

  const savedPerks = [
    { id: 1, title: 'Secret dessert menu unlocked', venue: 'Café Névé', validUntil: 'May 1, 2026' },
    { id: 2, title: 'Skip the line access', venue: 'Musée National', validUntil: 'May 15, 2026' },
  ];

  const interestOptions = [
    'Food & Dining', 'Art & Culture', 'Nightlife',
    'Outdoor Activities', 'History', 'Shopping',
    'Music & Events', 'Sports', 'Photography', 'Architecture',
  ];

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setProfile(data as typeof profile);
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async () => {
    setSaveError('');
    const error = await upsertProfile({ name: profile.name, email: profile.email, location: profile.location });
    if (error) {
      setSaveError(error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const avatar_url = reader.result as string;
      setProfile((p) => ({ ...p, avatar_url }));
      await upsertProfile({ avatar_url });
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = async (interest: string) => {
    const interests = profile.interests.includes(interest)
      ? profile.interests.filter((i) => i !== interest)
      : [...profile.interests, interest];
    setProfile((p) => ({ ...p, interests }));
    await upsertProfile({ interests });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="bg-primary text-primary-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary text-2xl overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(profile.name)}</span>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground p-2 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl mb-1">{profile.name || 'Your Name'}</h1>
              <p className="text-sm opacity-90">{profile.email || 'your@email.com'}</p>
              <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                📍 {profile.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-6">
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            {(['profile', 'preferences', 'saved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'profile' ? 'Profile & Settings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-lg mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Email</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Location</label>
                  <input type="text" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Quebec City, QC" />
                </div>
              </div>
              {saveError && (
                <p className="mt-3 text-sm text-red-600">{saveError}</p>
              )}
              <button onClick={handleSaveProfile} className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" /><span>Notifications</span>
              </button>
              <button className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:bg-muted transition-colors">
                <Lock className="w-5 h-5 text-muted-foreground" /><span>Privacy & Security</span>
              </button>
              <button onClick={handleLogout} className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 hover:bg-muted transition-colors text-red-600">
                <LogOut className="w-5 h-5" /><span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-lg mb-4">Your Interests</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      profile.interests.includes(interest) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-lg mb-4">Exploration Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between"><span>Show me hidden gems</span><input type="checkbox" defaultChecked className="rounded" /></label>
                <label className="flex items-center justify-between"><span>Include family-friendly activities</span><input type="checkbox" defaultChecked className="rounded" /></label>
                <label className="flex items-center justify-between"><span>Budget-friendly options only</span><input type="checkbox" className="rounded" /></label>
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
                  <div key={item.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                    <div><h4 className="text-base mb-1">{item.title}</h4><p className="text-sm text-muted-foreground">{item.date}</p></div>
                    <Heart className="w-5 h-5 text-secondary fill-secondary" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl mb-4">Saved Perks</h3>
              <div className="space-y-3">
                {savedPerks.map((perk) => (
                  <div key={perk.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                    <div><h4 className="text-base mb-1">{perk.title}</h4><p className="text-sm text-muted-foreground">{perk.venue} · Valid until {perk.validUntil}</p></div>
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
