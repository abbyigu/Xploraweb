import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Building2 } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { supabase } from '../lib/supabase';

export function BusinessLoginScreen() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate('/business/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XploraLogo variant="full" className="h-14" />
          </div>
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs mb-3">
            <Building2 className="w-3.5 h-3.5" /> Business Account
          </div>
          <h1 className="text-2xl mb-1">Partner Sign In</h1>
          <p className="text-sm text-muted-foreground">Manage your perks and offers</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="hello@yourvenue.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New partner?{' '}
          <Link to="/business/signup" className="text-primary hover:underline">Create a business account</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Looking for your personal account?{' '}
          <Link to="/login" className="text-primary hover:underline">Member sign in</Link>
        </p>
      </div>
    </div>
  );
}
