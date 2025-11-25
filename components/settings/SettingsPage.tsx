
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Shield, 
  Mail, 
  Lock, 
  LogOut, 
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

// --- Components ---

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="text-sm text-zinc-500">{description}</p>
  </div>
);

// --- SECTIONS ---

const ProfileSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Jan",
    lastName: "Kowalski",
    email: "jan@teamflow.com"
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Symulacja zapisu
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <SectionHeader title="Dane Osobowe" description="Zaktualizuj swoje imię i nazwisko." />

      {/* Avatar Display Only */}
      <div className="flex items-center gap-6 p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-white border-2 border-zinc-700">
          {formData.firstName[0]}{formData.lastName[0]}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white">{formData.firstName} {formData.lastName}</h3>
          <p className="text-xs text-zinc-500">Awatar jest generowany automatycznie na podstawie inicjałów.</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 ml-1">Imię</label>
          <Input 
            value={formData.firstName} 
            onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
            className="bg-[#111]" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 ml-1">Nazwisko</label>
          <Input 
            value={formData.lastName} 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
            className="bg-[#111]" 
          />
        </div>
        <div className="col-span-full space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
          <Input 
            icon={Mail} 
            value={formData.email} 
            disabled 
            className="bg-[#111] opacity-60 cursor-not-allowed text-zinc-500" 
          />
          <p className="text-[10px] text-zinc-600 ml-1">Adres email nie może zostać zmieniony.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-white text-black hover:bg-zinc-200 min-w-[140px]"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Zapisz zmiany
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const SecuritySection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdatePassword = async () => {
    setIsLoading(true);
    // Symulacja API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPasswords({ current: '', new: '', confirm: '' });
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <SectionHeader title="Zmiana Hasła" description="Zadbaj o bezpieczeństwo swojego konta używając silnego hasła." />

      <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 ml-1">Obecne hasło</label>
            <Input 
              type="password" 
              icon={Lock}
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="bg-[#0A0A0A]" 
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Nowe hasło</label>
              <Input 
                type="password" 
                icon={Lock}
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className="bg-[#0A0A0A]" 
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 ml-1">Potwierdź nowe hasło</label>
              <Input 
                type="password" 
                icon={Lock}
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="bg-[#0A0A0A]" 
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <Button 
            onClick={handleUpdatePassword}
            disabled={isLoading || !passwords.current || !passwords.new}
            className="bg-white text-black hover:bg-zinc-200 min-w-[160px]"
          >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Zaktualizuj hasło'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Bezpieczeństwo', icon: Shield },
  ];

  const handleLogout = () => {
    // In a real app, clear tokens/session here
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSection />;
      case 'security': return <SecuritySection />;
      default: return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Ustawienia</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Zarządzaj swoim kontem.
            </p>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={cn(
                     "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                     isActive 
                       ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                       : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                   )}
                 >
                   <tab.icon className={cn("w-4 h-4", isActive ? "text-black" : "text-zinc-500")} />
                   {tab.label}
                 </button>
               );
            })}
          </nav>

          <div className="pt-8 border-t border-zinc-900">
             <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-900/10 px-4"
             >
                <LogOut className="w-4 h-4 mr-3" />
                Wyloguj się
             </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl p-6 md:p-10 shadow-xl min-h-[500px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
             >
                {renderContent()}
             </motion.div>
           </AnimatePresence>
        </main>

      </div>
    </motion.div>
  );
};

export default SettingsPage;
