import { useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { HomeScreen } from './components/HomeScreen';
import { ItineraryScreen } from './components/ItineraryScreen';
import { MeetupsScreen } from './components/MeetupsScreen';
import { PerksScreen } from './components/PerksScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignupScreen } from './components/SignupScreen';
import { LoginScreen } from './components/LoginScreen';
import { ForgotPasswordScreen } from './components/ForgotPasswordScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { AccountSetupScreen } from './components/AccountSetupScreen';
import { AccountScreen } from './components/AccountScreen';
import { ShopScreen } from './components/ShopScreen';
import { CartScreen } from './components/CartScreen';
import { MembershipScreen } from './components/MembershipScreen';
import { BusinessLandingScreen } from './components/BusinessLandingScreen';
import { BusinessSignupScreen } from './components/BusinessSignupScreen';
import { BusinessLoginScreen } from './components/BusinessLoginScreen';
import { BusinessDashboardScreen } from './components/BusinessDashboardScreen';
import { ExperienceDetailScreen } from './components/ExperienceDetailScreen';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';

// Listens for Supabase PASSWORD_RECOVERY event and navigates to the reset screen.
function AuthHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
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
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<LandingPage />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/account-setup" element={<AccountSetupScreen />} />
              <Route path="/account" element={<AccountScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/itinerary" element={<ItineraryScreen />} />
              <Route path="/experience/:id" element={<ExperienceDetailScreen />} />
              <Route path="/meetups" element={<MeetupsScreen />} />
              <Route path="/perks" element={<PerksScreen />} />
              <Route path="/shop" element={<ShopScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/membership" element={<MembershipScreen />} />
              <Route path="/business" element={<BusinessLandingScreen />} />
              <Route path="/business/signup" element={<BusinessSignupScreen />} />
              <Route path="/business/login" element={<BusinessLoginScreen />} />
              <Route path="/business/dashboard" element={<BusinessDashboardScreen />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </BrowserRouter>
      <SpeedInsights />
    </CartProvider>
  );
}
