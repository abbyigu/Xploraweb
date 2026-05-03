import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, Camera } from 'lucide-react';

export function AccountSetupScreen() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const interestOptions = [
    'Food & Dining',
    'Art & Culture',
    'Nightlife',
    'Outdoor Activities',
    'History',
    'Shopping',
    'Music & Events',
    'Sports',
    'Photography',
    'Architecture',
  ];

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Help us personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Upload profile photo</p>
          </div>

          <div>
            <h2 className="text-xl mb-4">What are you interested in?</h2>
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
                  {interest}
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
              Skip for now
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Complete Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
