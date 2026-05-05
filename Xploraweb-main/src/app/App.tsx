import { useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router';
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
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';

// Listens for Supabase PASSWORD_RECOVERY event and navigates to the reset screen.
// Must live inside MemoryRouter so useNavigate is available.
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

// If the URL has ?code= Supabase will exchange it for a PASSWORD_RECOVERY session.
// Start the router there so the user never sees a flash of the home screen first.
function getInitialRoute() {
  if (new URLSearchParams(window.location.search).has('code')) return '/reset-password';
  return '/home';
}

export default function App() {
  return (
    <CartProvider>
      <MemoryRouter initialEntries={[getInitialRoute()]} initialIndex={0}>
        <AuthHandler />
        <div className="min-h-screen bg-background">
          <Header />
          <div className="md:max-w-none max-w-md mx-auto relative">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/account-setup" element={<AccountSetupScreen />} />
              <Route path="/account" element={<AccountScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/itinerary" element={<ItineraryScreen />} />
              <Route path="/meetups" element={<MeetupsScreen />} />
              <Route path="/perks" element={<PerksScreen />} />
              <Route path="/shop" element={<ShopScreen />} />
              <Route path="/cart" element={<CartScreen />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </MemoryRouter>
      <SpeedInsights />
    </CartProvider>
  );
}
