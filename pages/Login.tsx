import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { APP_NAME } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Phase 6 Auth Logic: Check localStorage first (setup by main index.tsx or default)
      const storedPin = localStorage.getItem('raha_admin_pin') || '1234';
      
      if (pin === storedPin) {
        onLogin();
      } else {
        setError('رمز الدخول غير صحيح.');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">
              Super Admin Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <LockKeyhole className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  id="pin"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full pr-10 pl-3 py-4 bg-slate-900 border border-slate-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-white text-center text-2xl tracking-[0.5em] font-bold placeholder-slate-700 transition-all"
                  placeholder="••••"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-4 text-sm text-red-400 bg-red-900/20 p-2 rounded text-center">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg font-bold shadow-lg shadow-indigo-900/50"
              size="lg"
              isLoading={isLoading}
              disabled={pin.length === 0}
            >
              DASHBOARD LOGIN
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
