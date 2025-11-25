import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    setError(null);

    try {
      const user = await authService.login(formData);
      success('Zalogowano pomyślnie!');
      
      // Check if user has organization
      if (!user.organizationId) {
        // Redirect to onboarding if no organization
        navigate('/onboarding');
      } else {
        // Redirect to dashboard if has organization
        navigate('/dashboard');
      }
    } catch (err) {
      handleApiError(err, 'Nieprawidłowy adres email lub hasło.');
      setError('Nieprawidłowy adres email lub hasło.');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-zinc-800/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black mx-auto hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Witaj ponownie</h1>
          <p className="text-zinc-500 text-sm">
            Wprowadź swoje dane, aby uzyskać dostęp do przestrzeni roboczej.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A0A0A] border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-900/10 border border-red-900/30 rounded-xl p-3 flex items-start gap-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
              <Input 
                icon={Mail}
                type="email"
                name="email"
                placeholder="imie@firma.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-[#0f0f0f]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-zinc-400">Hasło</label>
              </div>
              <Input 
                icon={Lock}
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-[#0f0f0f]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl h-11 mt-2 bg-white text-black hover:bg-zinc-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Zaloguj się
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-900 text-center">
            <p className="text-xs text-zinc-500">
              Nie masz jeszcze konta?{' '}
              <Link to="/register" className="text-white hover:underline underline-offset-4 font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;