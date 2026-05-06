import { useState, useEffect, useRef } from 'react';
import { Heart, Bell, Lock, LogOut, Camera, X, ChevronDown, ChevronUp, User, Building2, ExternalLink, Shield } from 'lucide-react';
import { AdminExperiencePanel } from './AdminExperiencePanel';
import { SimpleFooter } from './SimpleFooter';
import { supabase, getProfile, upsertProfile } from '../lib/supabase';
import { useNavigate } from 'react-router';
import { XploraLogo } from './XploraLogo';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function AccountScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved' | 'admin'>('profile');
  const [profile, setProfile] = useState({
    name: '', email: '', location: 'Quebec City, QC', interests: [] as string[], avatar_url: null as string | null,
    account_type: '' as string,
    business_name: '' as string,
    business_type: '' as string,
    business_website: '' as string,
    stripe_connect_onboarded: false as boolean,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<'notifications' | 'privacy' | null>(null);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: false, newsletter: true });
  const [passwordEmailSent, setPasswordEmailSent] = useState(false);

  const toggleSection = (section: 'notifications' | 'privacy') =>
    setOpenSection((prev) => (prev === section ? null : section));

  const handleChangePassword = async () => {
    if (!profile.email) return;
    await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo: window.location.origin });
    setPasswordEmailSent(true);
    setTimeout(() => setPasswordEmailSent(false), 4000);
  };

  const [savedItineraries, setSavedItineraries] = useState(() => {
    try {
      const raw = localStorage.getItem('xplora_saved_itineraries');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const [savedPerks, setSavedPerks] = useState(() => {
    try {
      const raw = localStorage.getItem('xplora_saved_perks');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const removeItinerary = (id: number) => {
    setSavedItineraries((prev: typeof defaultItineraries) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem('xplora_saved_itineraries', JSON.stringify(updated));
      return updated;
    });
  };

  const removePerk = (id: number) => {
    setSavedPerks((prev: typeof defaultPerks) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('xplora_saved_perks', JSON.stringify(updated));
      return updated;
    });
  };

  const interestOptions = [
    'Food & Dining', 'Art & Culture', 'Nightlife',
    'Outdoor Activities', 'History', 'Shopping',
    'Music & Events', 'Sports', 'Photography', 'Architecture',
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setIsGuest(true);
        setLoading(false);
        return;
      }
      getProfile().then((data) => {
        if (data) {
          setProfile(data as typeof profile);
        } else {
          // No profile row yet — pre-fill email from auth
          setProfile((p) => ({ ...p, email: user.email || '' }));
        }
        setLoading(false);
      });
    });
  }, []);

  const handleSaveProfile = async () => {
    await upsertProfile({ name: profile.name, email: profile.email, location: profile.location });
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

  if (isGuest) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full text-center">
          <div className="flex justify-center mb-6">
            <XploraLogo variant="full" className="h-14" />
          </div>

          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <User className="w-9 h-9 text-muted-foreground" />
          </div>

          <h1 className="text-2xl mb-2">Your Account</h1>
          <p className="text-muted-foreground mb-8">Sign in to access your profile, saved itineraries, and perks.</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full border border-border py-3 rounded-xl hover:bg-muted transition-colors font-medium"
            >
              Create Account
            </button>
          </div>

          <div
            className="mt-6 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-primary/15 transition-colors"
            onClick={() => navigate('/membership')}
          >
            <p className="text-sm font-medium text-primary mb-0.5">Club Membership</p>
            <p className="text-xs text-muted-foreground">Early access · Guest passes · Members-only 5 à 7</p>
            <p className="text-xs text-primary mt-2 underline underline-offset-2">From $10/month →</p>
          </div>
        </div>
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
          <div className="flex gap-6 overflow-x-auto">
            {(['profile', 'preferences', 'saved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'profile' ? 'Profile & Settings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {(profile as any).is_admin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'admin' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            )}
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
              <button onClick={handleSaveProfile} className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>

            {/* Business section — only for business accounts */}
            {profile.account_type === 'business' && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg">Your Business</h3>
                  </div>
                  <button
                    onClick={() => navigate('/business/dashboard')}
                    className="flex items-center gap-1.5 text-sm text-secondary hover:underline"
                  >
                    Dashboard <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Business Name</p>
                    <p className="text-sm font-medium">{profile.business_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Business Type</p>
                    <p className="text-sm">{profile.business_type || '—'}</p>
                  </div>
                  {profile.business_website && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Website</p>
                      <a href={profile.business_website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        {profile.business_website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${profile.stripe_connect_onboarded ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <p className="text-sm">
                        {profile.stripe_connect_onboarded
                          ? 'Stripe Connected — ready to accept payments'
                          : 'Stripe not connected — go to dashboard to set up'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {/* Notifications */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => toggleSection('notifications')} className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-muted-foreground" /><span>Notifications</span></div>
                  {openSection === 'notifications' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {openSection === 'notifications' && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {([
                      { key: 'email', label: 'Email notifications' },
                      { key: 'push', label: 'Push notifications' },
                      { key: 'newsletter', label: 'Newsletter' },
                    ] as const).map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <input type="checkbox" checked={notifPrefs[key]} onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))} className="rounded" />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy & Security */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => toggleSection('privacy')} className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-muted-foreground" /><span>Privacy & Security</span></div>
                  {openSection === 'privacy' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {openSection === 'privacy' && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <button onClick={handleChangePassword} className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                      {passwordEmailSent ? '✓ Reset email sent — check your inbox' : 'Change Password'}
                    </button>
                  </div>
                )}
              </div>

              <div
                className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
                onClick={() => navigate('/membership')}
              >
                <div>
                  <p className="text-sm font-medium text-primary">Club Membership</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Early access · Guest passes · 5 à 7</p>
                </div>
                <span className="text-sm text-primary font-medium">$10/mo →</span>
              </div>

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
              {savedItineraries.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No saved itineraries yet.</p>
              )}
              <div className="space-y-3">
                {savedItineraries.map((item) => (
                  <div key={item.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-secondary fill-secondary flex-shrink-0" />
                      <div><h4 className="text-base mb-1">{item.title}</h4><p className="text-sm text-muted-foreground">{item.date}</p></div>
                    </div>
                    <button onClick={() => removeItinerary(item.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl mb-4">Saved Perks</h3>
              {savedPerks.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No saved perks yet.</p>
              )}
              <div className="space-y-3">
                {savedPerks.map((perk) => (
                  <div key={perk.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-secondary fill-secondary flex-shrink-0" />
                      <div><h4 className="text-base mb-1">{perk.title}</h4><p className="text-sm text-muted-foreground">{perk.venue} · Valid until {perk.validUntil}</p></div>
                    </div>
                    <button onClick={() => removePerk(perk.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (profile as any).is_admin && (
          <AdminExperiencePanel />
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}
