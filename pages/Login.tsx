import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { SUPER_ADMIN_PIN, APP_NAME } from '../constants';

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

    // Simulate API delay
    setTimeout(() => {
      if (pin === SUPER_ADMIN_PIN) {
        onLogin();
      } else {
        setError('رمز الدخول غير صحيح. الرجاء المحاولة مرة أخرى.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-gray-500 text-sm mt-2 text-center">
              أدخل رمز المشرف العام للدخول إلى اللوحة
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                رمز الأمان
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <LockKeyhole className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="pin"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg tracking-widest placeholder-gray-400"
                  placeholder="••••"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="ms-1">●</span> {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3"
              size="lg"
              isLoading={isLoading}
              disabled={pin.length === 0}
            >
              دخول للوحة التحكم
            </Button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            نظام آمن • للموظفين المصرح لهم فقط
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;