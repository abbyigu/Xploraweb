import { useState, useEffect, useRef } from 'react';
import { Heart, Bell, Lock, Camera, X, ChevronDown, ChevronUp, Building2, ExternalLink, MapPin, Map, MessageSquare, Check, SlidersHorizontal, Info } from 'lucide-react';
import { supabase, upsertProfile } from '../lib/supabase';
import { submitFeedback } from '../lib/feedback';
import { fetchSavedItineraries, deleteSavedItinerary } from '../lib/savedItineraries';
import type { SavedItinerary } from '../lib/savedItineraries';
import { buildGoogleMapsUrl } from '../lib/maps';
import { ItineraryScrapbook } from './ItineraryScrapbook';
import { Link, useNavigate } from 'react-router';
import { useExperiences } from '../hooks/useExperiences';
import { useTranslation } from 'react-i18next';
import type { DashboardProfile } from './DashboardScreen';
import { INTEREST_OPTIONS, INTEREST_KEY } from '../data/interests';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function DashboardProfilePanel({ profile, setProfile, initialTab }: { profile: DashboardProfile; setProfile: React.Dispatch<React.SetStateAction<DashboardProfile>>; initialTab?: 'profile' | 'preferences' | 'saved' | 'settings' }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { experiences } = useExperiences();
  const [purchasedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('xplora_purchased') || '[]'); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'saved' | 'settings'>(initialTab || 'profile');
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [expandedItinerary, setExpandedItinerary] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<'notifications' | 'privacy' | 'feedback' | null>(null);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: false, newsletter: true });
  const [passwordEmailSent, setPasswordEmailSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [copiedItineraryId, setCopiedItineraryId] = useState<string | null>(null);
  const [savedPerks, setSavedPerks] = useState(() => {
    try {
      const raw = localStorage.getItem('xplora_saved_perks');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [exploreToggles, setExploreToggles] = useState(() => {
    try {
      const raw = localStorage.getItem('xplora_explore_toggles');
      return raw ? { hiddenGems: true, familyFriendly: true, budgetFriendly: false, ...JSON.parse(raw) } : { hiddenGems: true, familyFriendly: true, budgetFriendly: false };
    } catch { return { hiddenGems: true, familyFriendly: true, budgetFriendly: false }; }
  });

  useEffect(() => {
    fetchSavedItineraries().then(setSavedItineraries);
  }, []);

  const toggleSection = (section: 'notifications' | 'privacy' | 'feedback') =>
    setOpenSection((prev) => (prev === section ? null : section));

  const handleChangePassword = async () => {
    if (!profile.email) return;
    await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo: window.location.origin });
    setPasswordEmailSent(true);
    setTimeout(() => setPasswordEmailSent(false), 4000);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim() || feedbackStatus === 'loading') return;
    setFeedbackStatus('loading');
    await submitFeedback(feedbackMessage.trim(), profile.email);
    setFeedbackMessage('');
    setFeedbackStatus('done');
    setTimeout(() => setFeedbackStatus('idle'), 3000);
  };

  const removeItinerary = async (id: string) => {
    setSavedItineraries((prev) => prev.filter((i) => i.id !== id));
    await deleteSavedItinerary(id);
  };

  const copyItineraryLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/i/${slug}`).then(() => {
      setCopiedItineraryId(id);
      setTimeout(() => setCopiedItineraryId((prev) => (prev === id ? null : prev)), 2000);
    });
  };

  const removePerk = (id: number) => {
    setSavedPerks((prev: typeof savedPerks) => {
      const updated = prev.filter((p: any) => p.id !== id);
      localStorage.setItem('xplora_saved_perks', JSON.stringify(updated));
      return updated;
    });
  };

  const interestOptions = INTEREST_OPTIONS;

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

  const toggleExplorePref = (key: keyof typeof exploreToggles) => {
    setExploreToggles((prev: typeof exploreToggles) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('xplora_explore_toggles', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={t('account.profileAlt')} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(profile.name)}</span>
            )}
          </div>
          <button
            className="absolute bottom-0 right-0 bg-secondary text-secondary-foreground p-1.5 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <h2 className="text-xl mb-1">{profile.name || t('account.yourName')}</h2>
          <p className="text-sm text-muted-foreground">{profile.email || 'your@email.com'}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" /> {profile.location}
          </p>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-6 overflow-x-auto">
          {(['profile', 'preferences', 'saved', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'profile' ? t('account.profileTab')
                : tab === 'preferences' ? t('account.preferencesTab')
                : tab === 'saved' ? t('account.savedTab')
                : t('account.settingsTab')}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-lg mb-4">{t('account.personalInfo')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">{t('account.fullName')}</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('account.fullNamePlaceholder')} />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">{t('account.email')}</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">{t('account.location')}</label>
                <input type="text" value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('account.locationPlaceholder')} />
              </div>
            </div>
            <button onClick={handleSaveProfile} className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
              {saved ? t('account.saved') : t('account.saveChanges')}
            </button>
          </div>

          {/* Business section — only for business accounts */}
          {profile.account_type === 'business' && (
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-secondary" />
                <h3 className="text-lg">{t('account.yourBusiness')}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{t('account.businessName')}</p>
                  <p className="text-sm font-medium">{profile.business_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{t('account.businessType')}</p>
                  <p className="text-sm">{profile.business_type || '—'}</p>
                </div>
                {profile.business_website && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t('account.website')}</p>
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
                        ? t('account.stripeConnected')
                        : t('account.stripeNotConnected')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-2">
          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => toggleSection('notifications')} className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
              <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-muted-foreground" /><span>{t('account.notifications')}</span></div>
              {openSection === 'notifications' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 'notifications' && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {([
                  { key: 'email', label: t('account.emailNotifs') },
                  { key: 'push', label: t('account.pushNotifs') },
                  { key: 'newsletter', label: t('account.newsletter') },
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
              <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-muted-foreground" /><span>{t('account.privacySecurity')}</span></div>
              {openSection === 'privacy' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 'privacy' && (
              <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                <button onClick={handleChangePassword} className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  {passwordEmailSent ? t('account.passwordSent') : t('account.changePassword')}
                </button>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => toggleSection('feedback')} className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
              <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-muted-foreground" /><span>{t('account.feedback')}</span></div>
              {openSection === 'feedback' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {openSection === 'feedback' && (
              <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                {feedbackStatus === 'done' ? (
                  <p className="flex items-center gap-1.5 text-sm text-primary font-medium">
                    <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    {t('feedback.successTitle')}
                  </p>
                ) : (
                  <>
                    <textarea
                      rows={3}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder={t('feedback.messagePlaceholder')}
                      className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!feedbackMessage.trim() || feedbackStatus === 'loading'}
                      className="w-full text-center text-sm px-3 py-2 rounded-lg bg-[#12343B] text-white hover:opacity-90 transition disabled:opacity-60"
                    >
                      {feedbackStatus === 'loading' ? t('feedback.submitting') : t('feedback.submit')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Our Story */}
          <Link
            to="/about"
            className="bg-card rounded-xl border border-border overflow-hidden p-4 flex items-center justify-between hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3"><Info className="w-5 h-5 text-muted-foreground" /><span>{t('account.ourStory')}</span></div>
            <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
          </Link>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-lg mb-4">{t('account.interests')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((interest) => (
                <button key={interest} onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm ${
                    profile.interests.includes(interest) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t(`account.interestOptions.${INTEREST_KEY[interest]}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-lg mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-muted-foreground" />{t('account.exploreOptions')}</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between"><span>{t('account.showHiddenGems')}</span><input type="checkbox" checked={exploreToggles.hiddenGems} onChange={() => toggleExplorePref('hiddenGems')} className="rounded" /></label>
              <label className="flex items-center justify-between"><span>{t('account.familyFriendly')}</span><input type="checkbox" checked={exploreToggles.familyFriendly} onChange={() => toggleExplorePref('familyFriendly')} className="rounded" /></label>
              <label className="flex items-center justify-between"><span>{t('account.budgetFriendly')}</span><input type="checkbox" checked={exploreToggles.budgetFriendly} onChange={() => toggleExplorePref('budgetFriendly')} className="rounded" /></label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'saved' && (() => {
        const bookedExps = purchasedIds
          .map(id => experiences.find(e => e.id === id))
          .filter((e): e is NonNullable<typeof e> => !!e);

        return (
          <div className="space-y-8">

            {/* My Experiences */}
            <div>
              <h3 className="text-xl mb-4">{t('account.myExperiences')}</h3>
              {bookedExps.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <Map className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t('account.noExperiences')}</p>
                  <button onClick={() => navigate('/itinerary')} className="mt-4 text-sm text-primary hover:underline">
                    {t('account.browseExperiences')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookedExps.map((exp) => {
                    const isOpen = expandedExp === exp.id;
                    const categoryLabel =
                      exp.category === 'xplorators' ? 'Xplora-tors' :
                      exp.category === 'xploratours' ? 'Xplora-tours' :
                      exp.category === 'xploranights' ? 'Xplora Nights' : '';

                    return (
                      <div key={exp.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                        {/* Header row */}
                        <button
                          className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
                          onClick={() => setExpandedExp(isOpen ? null : exp.id)}
                        >
                          {exp.image && (
                            <img src={exp.image} alt={exp.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            {categoryLabel && <p className="text-xs text-secondary uppercase tracking-widest mb-0.5">{categoryLabel}</p>}
                            <h4 className="font-medium text-base truncate">{exp.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {exp.price === 0 ? t('common.free') : `$${(exp.price / 100).toFixed(0)} ${t('common.perPerson')}`}
                            </p>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Expanded: map + itinerary */}
                        {isOpen && (
                          <div className="border-t border-border px-4 pb-5 pt-4 space-y-5">

                            {/* Meeting point / map */}
                            {exp.meetingPoint && (
                              <div>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('account.meetingPoint')}</p>
                                <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
                                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm">{exp.meetingPoint}</p>
                                    <a
                                      href={`https://maps.google.com/?q=${encodeURIComponent(exp.meetingPoint)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                                    >
                                      {t('account.openMaps')} <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Itinerary stops */}
                            {exp.itinerary && exp.itinerary.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{t('experienceDetail.itinerary')}</p>
                                <ol className="space-y-2.5">
                                  {exp.itinerary.map((stop, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="text-muted-foreground leading-relaxed">{stop}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            <button
                              onClick={() => navigate(`/experience/${exp.id}`)}
                              className="text-sm text-primary hover:underline"
                            >
                              {t('account.viewFullDetails')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Saved Itineraries */}
            <div>
              <h3 className="text-xl mb-4">{t('account.savedItineraries')}</h3>
              {savedItineraries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">{t('account.noItineraries')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedItineraries.map((item) => {
                    const mapsUrl = buildGoogleMapsUrl(item.stops);
                    const isItinOpen = expandedItinerary === item.id;
                    return (
                    <div
                      key={item.id}
                      className={`bg-card rounded-xl p-4 border border-border hover:bg-muted transition-colors cursor-pointer ${isItinOpen ? 'md:col-span-2 lg:col-span-3' : ''}`}
                      onClick={() => setExpandedItinerary(isItinOpen ? null : item.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Heart className="w-5 h-5 text-secondary fill-secondary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h4 className="text-base mb-1 truncate">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {t('itineraryBuilder.resultMeta', { duration: item.estimatedDurationMin, distance: item.estimatedDistanceKm })}
                              {' · '}{new Date(item.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-CA' : 'en-CA')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); removeItinerary(item.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" aria-label={t('common.remove')}>
                            <X className="w-4 h-4" />
                          </button>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isItinOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            {t('account.openMaps')} <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {item.slug && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/i/${item.slug}`, { state: { owned: true, itineraryId: item.id } }); }}
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              {t('account.openItinerary')}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyItineraryLink(item.slug!, item.id); }}
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              {copiedItineraryId === item.id ? t('itineraryBuilder.linkCopied') : t('account.copyLink')}
                            </button>
                          </>
                        )}
                      </div>
                      {isItinOpen && (
                        <ItineraryScrapbook
                          itinerary={item}
                          onChange={(updated) => setSavedItineraries((prev) => prev.map((si) => (si.id === updated.id ? updated : si)))}
                        />
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Saved Perks */}
            <div>
              <h3 className="text-xl mb-4">{t('account.savedPerks')}</h3>
              {savedPerks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">{t('account.noPerks')}</p>
              ) : (
                <div className="space-y-3">
                  {savedPerks.map((perk: any) => (
                    <div key={perk.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-secondary fill-secondary flex-shrink-0" />
                        <div><h4 className="text-base mb-1">{perk.title}</h4><p className="text-sm text-muted-foreground">{perk.venue} · {t('account.validUntil')} {perk.validUntil}</p></div>
                      </div>
                      <button onClick={() => removePerk(perk.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors" aria-label={t('common.remove')}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })()}
    </div>
  );
}
