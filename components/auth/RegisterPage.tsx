import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    startLoading();
    setError(null);

    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      // Automatycznie zaloguj użytkownika po rejestracji
      try {
        await authService.login({
          email: formData.email,
          password: formData.password,
        });
        success('Rejestracja zakończona pomyślnie!');
        navigate('/onboarding', { 
          state: { 
            email: formData.email,
            firstName: formData.firstName 
          } 
        }); 
      } catch (loginErr) {
        // Jeśli logowanie się nie powiodło, przekieruj do logowania
        handleApiError(loginErr, 'Rejestracja zakończona, ale logowanie nie powiodło się. Zaloguj się ręcznie.');
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Rejestracja zakończona pomyślnie. Zaloguj się, aby kontynuować.'
          } 
        });
      }
    } catch (err) {
      handleApiError(err, 'Nie udało się zarejestrować. Spróbuj ponownie.');
      setError('Nie udało się zarejestrować. Spróbuj ponownie.');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none opacity-40" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-zinc-800/10 blur-[100px] rounded-full pointer-events-none" />

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
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Utwórz konto</h1>
          <p className="text-zinc-500 text-sm">
            Dołącz do TeamFlow i zarządzaj projektami efektywniej.
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Imię</label>
                <Input 
                  type="text"
                  name="firstName"
                  placeholder="Jan"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-[#0f0f0f]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Nazwisko</label>
                <Input 
                  type="text"
                  name="lastName"
                  placeholder="Kowalski"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-[#0f0f0f]"
                />
              </div>
            </div>

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

            <div className="flex flex-col space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Hasło</label>
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Potwierdź</label>
                <Input 
                  icon={Lock}
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-[#0f0f0f]"
                />
              </div>
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
                  Zarejestruj się
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-900 text-center">
            <p className="text-xs text-zinc-500">
              Masz już konto?{' '}
              <Link to="/login" className="text-white hover:underline underline-offset-4 font-medium">
                Zaloguj się
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;