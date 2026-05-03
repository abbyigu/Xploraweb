import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User, Upload } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { saveUser } from '../lib/userStorage';

// Kit newsletter config
const KIT_API_KEY = 'pqpO04D1U_oq3KhLMmB87w';
const KIT_FORM_UID = '361503f84f';

async function subscribeToNewsletter(email: string, firstName: string) {
  try {
    const formData = new FormData();
    formData.append('email_address', email);
    formData.append('first_name', firstName.split(' ')[0]);
    formData.append('api_key', KIT_API_KEY);

    await fetch(`https://app.kit.com/forms/${KIT_FORM_UID}/subscriptions`, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // Kit doesn't return CORS headers on this endpoint
    });
  } catch {
    // Silently fail — newsletter signup should never block account creation
  }
}

export function SignupScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [newsletter, setNewsletter] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save name and email to localStorage
    saveUser({ name: formData.name, email: formData.email });
    if (newsletter && formData.email) {
      await subscribeToNewsletter(formData.email, formData.name);
    }
    navigate('/account-setup');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <XploraLogo variant="full" className="h-16" />
          </div>
          <h1 className="text-3xl mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Start exploring like a local</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Newsletter opt-in — CASL compliant */}
          <label className="flex items-start gap-3 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-1 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              Subscribe to the Xplora newsletter — slow travel tips, Quebec hidden gems &amp; exclusive deals. You can unsubscribe anytime.
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity mt-6"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
