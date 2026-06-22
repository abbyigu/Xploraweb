import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';
import { analytics, initGtag } from './lib/analytics';
import './i18n';

function SkipLink() {
  const { t } = useTranslation();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-primary focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-medium focus:outline-2 focus:outline-primary"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
const ItineraryScreen        = lazy(() => import('./components/ItineraryScreen').then(m => ({ default: m.ItineraryScreen })));
const ExperienceDetailScreen = lazy(() => import('./components/ExperienceDetailScreen').then(m => ({ default: m.ExperienceDetailScreen })));
const WelcomeScreen          = lazy(() => import('./components/WelcomeScreen').then(m => ({ default: m.WelcomeScreen })));
const SignupScreen            = lazy(() => import('./components/SignupScreen').then(m => ({ default: m.SignupScreen })));
const LoginScreen             = lazy(() => import('./components/LoginScreen').then(m => ({ default: m.LoginScreen })));
const ForgotPasswordScreen   = lazy(() => import('./components/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })));
const ResetPasswordScreen    = lazy(() => import('./components/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })));
const AccountSetupScreen     = lazy(() => import('./components/AccountSetupScreen').then(m => ({ default: m.AccountSetupScreen })));
const AccountScreen          = lazy(() => import('./components/AccountScreen').then(m => ({ default: m.AccountScreen })));
const NotificationsScreen    = lazy(() => import('./components/NotificationsScreen').then(m => ({ default: m.NotificationsScreen })));
const AboutScreen            = lazy(() => import('./components/AboutScreen').then(m => ({ default: m.AboutScreen })));
const CartScreen             = lazy(() => import('./components/CartScreen').then(m => ({ default: m.CartScreen })));
const MembershipScreen       = lazy(() => import('./components/MembershipScreen').then(m => ({ default: m.MembershipScreen })));
const BusinessLandingScreen  = lazy(() => import('./components/BusinessLandingScreen').then(m => ({ default: m.BusinessLandingScreen })));
const BusinessSignupScreen   = lazy(() => import('./components/BusinessSignupScreen').then(m => ({ default: m.BusinessSignupScreen })));
const BusinessLoginScreen    = lazy(() => import('./components/BusinessLoginScreen').then(m => ({ default: m.BusinessLoginScreen })));
const BusinessDashboardScreen= lazy(() => import('./components/BusinessDashboardScreen').then(m => ({ default: m.BusinessDashboardScreen })));
const AdminDashboardScreen   = lazy(() => import('./components/AdminDashboardScreen').then(m => ({ default: m.AdminDashboardScreen })));
const PrivacyScreen          = lazy(() => import('./components/PrivacyScreen').then(m => ({ default: m.PrivacyScreen })));
const TermsScreen            = lazy(() => import('./components/TermsScreen').then(m => ({ default: m.TermsScreen })));
const HowItWorksScreen       = lazy(() => import('./components/HowItWorksScreen').then(m => ({ default: m.HowItWorksScreen })));
const ContactScreen          = lazy(() => import('./components/ContactScreen').then(m => ({ default: m.ContactScreen })));
const FaqScreen              = lazy(() => import('./components/FaqScreen').then(m => ({ default: m.FaqScreen })));

function AuthHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/reset-password');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
}

function AnalyticsHandler() {
  const location = useLocation();

  // Page view on every route change
  useEffect(() => {
    analytics.pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Flush purchase/subscribe events after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('checkout_success') || params.has('subscribed') || params.has('booking')) {
      analytics.flushPending();
    }
  }, [location.search]);

  return null;
}

function LanguageSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      supabase.from('profiles').select('language').eq('id', session.user.id).single().then(({ data }) => {
        if (data?.language) {
          i18n.changeLanguage(data.language);
          document.documentElement.lang = data.language;
        }
      });
    });
  }, []);
  return null;
}

function GtagLoader() {
  useEffect(() => {
    const id = requestIdleCallback(() => initGtag(), { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }, []);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
    <CartProvider>
    <BrowserRouter>
      <AuthHandler />
      <LanguageSync />
      <AnalyticsHandler />
      <GtagLoader />
      <div className="min-h-screen bg-background">
        <SkipLink />
        <div className="bg-[#12343B] text-white text-center text-xs font-medium py-2 px-4 tracking-wide">
          🎉 Xplora launches in June — be among the first to explore Québec City differently.
        </div>
        <Header />
        <main id="main-content" tabIndex={-1} className="outline-none">
        <div className="md:max-w-none max-w-md mx-auto relative">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/neighbourhoods" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<AboutScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/account-setup" element={<AccountSetupScreen />} />
              <Route path="/account" element={<AccountScreen />} />
              <Route path="/itinerary" element={<ItineraryScreen />} />
              <Route path="/experience/:id" element={<ExperienceDetailScreen />} />
              <Route path="/notifications" element={<NotificationsScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/membership" element={<MembershipScreen />} />
              <Route path="/business" element={<BusinessLandingScreen />} />
              <Route path="/business/signup" element={<BusinessSignupScreen />} />
              <Route path="/business/login" element={<BusinessLoginScreen />} />
              <Route path="/business/dashboard" element={<BusinessDashboardScreen />} />
              <Route path="/dashboard" element={<AdminDashboardScreen />} />
              <Route path="/privacy" element={<PrivacyScreen />} />
              <Route path="/terms" element={<TermsScreen />} />
              <Route path="/how-it-works" element={<HowItWorksScreen />} />
              <Route path="/contact" element={<ContactScreen />} />
              <Route path="/faq" element={<FaqScreen />} />
            </Routes>
          </Suspense>
        </div>
        </main>
        <BottomNav />
      </div>
      <SpeedInsights />
    </BrowserRouter>
    </CartProvider>
    </HelmetProvider>
  );
}
