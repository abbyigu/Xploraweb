import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Shield, Building2, User } from 'lucide-react';
import { supabase, getProfile } from '../lib/supabase';
import { Footer } from './Footer';
import { XploraLogo } from './XploraLogo';
import { useTranslation } from 'react-i18next';
import { DashboardProfilePanel } from './DashboardProfilePanel';
import { DashboardBusinessPanel } from './DashboardBusinessPanel';

// Lazy: pulls in all four admin CRUD panels (spots/experiences/neighbourhoods/
// site content), only ever rendered for the one is_admin account — keeping it
// a static import bloated this chunk for every /dashboard visitor.
const AdminPanel = lazy(() => import('./AdminPanel').then(m => ({ default: m.AdminPanel })));

export interface DashboardProfile {
  name: string;
  email: string;
  location: string;
  interests: string[];
  avatar_url: string | null;
  account_type: string;
  business_name: string;
  business_type: string;
  business_website: string;
  stripe_connect_onboarded: boolean;
  is_admin: boolean;
}

const EMPTY_PROFILE: DashboardProfile = {
  name: '', email: '', location: 'Quebec City, QC', interests: [], avatar_url: null,
  account_type: '', business_name: '', business_type: '', business_website: '',
  stripe_connect_onboarded: false, is_admin: false,
};

type Section = 'profile' | 'business' | 'admin';

export function DashboardScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState<DashboardProfile>(EMPTY_PROFILE);
  const [section, setSection] = useState<Section>('profile');
  const defaultSectionSet = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setIsGuest(true);
        setLoading(false);
        return;
      }
      getProfile().then((data) => {
        if (data) {
          const merged = { ...EMPTY_PROFILE, ...data } as DashboardProfile;
          setProfile(merged);
          if (!defaultSectionSet.current) {
            defaultSectionSet.current = true;
            if (merged.is_admin) setSection('admin');
            else if (merged.account_type === 'business') setSection('business');
          }
        } else {
          setProfile((p) => ({ ...p, email: session.user.email || '' }));
        }
        setLoading(false);
      });
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('account.loading')}</p>
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

          <h1 className="text-2xl mb-2">{t('account.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('account.guestPrompt')}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              {t('account.logIn')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full border border-border py-3 rounded-xl hover:bg-muted transition-colors font-medium"
            >
              {t('account.createAccount')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showBusiness = profile.account_type === 'business';
  const showAdmin = profile.is_admin;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XploraLogo variant="icon" className="h-8 w-8" />
            <div>
              <p className="text-xs text-muted-foreground">{t('account.dashboard')}</p>
              <p className="text-sm font-medium">{profile.name || profile.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> {t('account.logOut')}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Top-level area switcher — only shown when there's more than one area (business/admin),
            so regular members never see a single-item tab bar */}
        {(showBusiness || showAdmin) && (
          <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
            <button
              onClick={() => setSection('profile')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${section === 'profile' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <User className="w-3.5 h-3.5" />
              {t('account.title')}
            </button>
            {showBusiness && (
              <button
                onClick={() => setSection('business')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${section === 'business' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Building2 className="w-3.5 h-3.5" />
                {t('business.dashboardTitle')}
              </button>
            )}
            {showAdmin && (
              <button
                onClick={() => setSection('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${section === 'admin' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                {t('account.adminTab')}
              </button>
            )}
          </div>
        )}

        {section === 'profile' && <DashboardProfilePanel profile={profile} setProfile={setProfile} />}
        {section === 'business' && showBusiness && <DashboardBusinessPanel profile={profile} />}
        {section === 'admin' && showAdmin && (
          <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminPanel />
          </Suspense>
        )}
      </div>

      <Footer />
    </div>
  );
}
