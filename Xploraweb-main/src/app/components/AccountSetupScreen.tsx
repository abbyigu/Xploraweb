import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Camera } from 'lucide-react';
import { upsertProfile } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { INTEREST_OPTIONS, INTEREST_KEY } from '../data/interests';

export function AccountSetupScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [interests, setInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const interestOptions = INTEREST_OPTIONS;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await upsertProfile({ interests, avatar_url: profileImage });
    setLoading(false);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">{t('accountSetup.title')}</h1>
          <p className="text-muted-foreground">{t('accountSetup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <label className="cursor-pointer">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt={t('account.profileAlt')} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90">
                  <Upload className="w-4 h-4" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t('accountSetup.uploadPhoto')}</p>
          </div>

          <div>
            <h2 className="text-xl mb-4">{t('accountSetup.interests')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm ${
                    interests.includes(interest)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {t(`account.interestOptions.${INTEREST_KEY[interest]}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              {t('accountSetup.skip')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? t('accountSetup.saving') : t('accountSetup.complete')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
