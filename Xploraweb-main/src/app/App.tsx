import { lazy, Suspense, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';

const HomeScreen             = lazy(() => import('./components/HomeScreen').then(m => ({ default: m.HomeScreen })));
const ItineraryScreen        = lazy(() => import('./components/ItineraryScreen').then(m => ({ default: m.ItineraryScreen })));
const ExperienceDetailScreen = lazy(() => import('./components/ExperienceDetailScreen').then(m => ({ default: m.ExperienceDetailScreen })));
const MembersScreen          = lazy(() => import('./components/MembersScreen').then(m => ({ default: m.MembersScreen })));
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

export default function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      <AuthHandler />
      <div className="min-h-screen bg-background">
        <Header />
        <div className="md:max-w-none max-w-md mx-auto relative">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
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
              <Route path="/members" element={<MembersScreen />} />
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
            </Routes>
          </Suspense>
        </div>
        <BottomNav />
      </div>
      <SpeedInsights />
    </BrowserRouter>
    </CartProvider>
  );
}
