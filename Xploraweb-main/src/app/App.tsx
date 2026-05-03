import { MemoryRouter, Routes, Route } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { HomeScreen } from './components/HomeScreen';
import { ItineraryScreen } from './components/ItineraryScreen';
import { MeetupsScreen } from './components/MeetupsScreen';
import { PerksScreen } from './components/PerksScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignupScreen } from './components/SignupScreen';
import { LoginScreen } from './components/LoginScreen';
import { AccountSetupScreen } from './components/AccountSetupScreen';
import { AccountScreen } from './components/AccountScreen';
import { ShopScreen } from './components/ShopScreen';
import { CartScreen } from './components/CartScreen';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <MemoryRouter initialEntries={['/home']} initialIndex={0}>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="md:max-w-none max-w-md mx-auto relative">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/login" element={<LoginScreen />} />
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
    </CartProvider>
  );
}
