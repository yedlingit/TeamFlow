import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, CheckCircle2, Loader2, Key, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { organizationService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const firstName = location.state?.firstName;
  const email = location.state?.email;
  const displayName = firstName || email || 'użytkowniku';

  const [selectedRole, setSelectedRole] = useState<'owner' | 'employee' | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();
  
  const [orgName, setOrgName] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCreateOrg = async () => {
    if (!orgName) return;
    startLoading();

    try {
      const organization = await organizationService.create({
        name: orgName,
      });
      
      setCreatedToken(organization.invitationCode);
      success('Organizacja utworzona pomyślnie!');
    } catch (err: any) {
      // Check if it's a 401/403 error - user might not be logged in
      if (err?.status === 401 || err?.status === 403) {
        handleApiError(err, 'Musisz być zalogowany, aby utworzyć organizację. Przekierowuję do logowania...');
        // Redirect will be handled by API client
      } else {
        handleApiError(err, 'Nie udało się utworzyć organizacji.');
      }
    } finally {
      stopLoading();
    }
  };

  const handleJoinOrg = async () => {
    if (!inviteToken) return;
    startLoading();

    try {
      await organizationService.join({
        invitationCode: inviteToken,
      });
      
      success('Dołączono do organizacji!');
      navigate('/dashboard');
    } catch (err) {
      handleApiError(err, 'Nieprawidłowy kod zaproszenia.');
    } finally {
      stopLoading();
    }
  };

  const copyToClipboard = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center pt-16 md:pt-32 p-4 relative overflow-x-hidden overflow-y-auto">
      
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-zinc-900/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        {!createdToken && (
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Witaj, {displayName}
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Jak chcesz korzystać z TeamFlow? Wybierz rolę, aby kontynuować.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {createdToken ? (
            /* SUCCESS VIEW - Organization Created */
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg bg-[#0A0A0A] border border-zinc-800 rounded-3xl p-8 shadow-2xl mt-8"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-bold">Organizacja Utworzona!</h3>
                  <p className="text-zinc-500 text-sm">Twoja przestrzeń robocza <strong>{orgName}</strong> jest gotowa.</p>
                </div>

                <div className="w-full p-4 bg-black rounded-xl border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                  <code className="text-xl font-mono font-bold text-white tracking-wider">
                    {createdToken}
                  </code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <Button 
                  onClick={async () => {
                    // Reload user data to get organization info
                    try {
                      await authService.getMe();
                      navigate('/dashboard');
                    } catch (err) {
                      // If error, still navigate (organization was created)
                      navigate('/dashboard');
                    }
                  }}
                  className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-12 font-medium"
                >
                  Przejdź do Pulpitu
                </Button>
              </div>
            </motion.div>
          ) : (
            /* SELECTION VIEW */
            <div className="w-full flex flex-col items-center space-y-8 pb-20">
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {/* Owner Card */}
                <div
                  onClick={() => setSelectedRole('owner')}
                  className={cn(
                    "p-8 rounded-3xl border cursor-pointer transition-all duration-200 flex flex-col gap-4",
                    selectedRole === 'owner'
                      ? "bg-zinc-900/50 border-white shadow-[0_0_30px_rgba(255,255,255,0.05)] scale-[1.02]"
                      : "bg-[#0A0A0A] border-zinc-800 hover:border-zinc-600 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    selectedRole === 'owner' ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"
                  )}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Właściciel / Manager</h3>
                    <p className="text-sm text-zinc-500">
                      Zakładam nową organizację. Chcę zarządzać projektami i zapraszać zespół.
                    </p>
                  </div>
                </div>

                {/* Employee Card */}
                <div
                  onClick={() => setSelectedRole('employee')}
                  className={cn(
                    "p-8 rounded-3xl border cursor-pointer transition-all duration-200 flex flex-col gap-4",
                    selectedRole === 'employee'
                      ? "bg-zinc-900/50 border-white shadow-[0_0_30px_rgba(255,255,255,0.05)] scale-[1.02]"
                      : "bg-[#0A0A0A] border-zinc-800 hover:border-zinc-600 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    selectedRole === 'employee' ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"
                  )}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Pracownik</h3>
                    <p className="text-sm text-zinc-500">
                      Dołączam do istniejącego zespołu. Posiadam kod zaproszenia od przełożonego.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Container - Appears Below */}
              <AnimatePresence mode="wait">
                {selectedRole && (
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-[#0A0A0A] border border-zinc-800 rounded-3xl p-8 shadow-2xl"
                  >
                    {selectedRole === 'owner' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Nazwa Organizacji</label>
                          <Input 
                            icon={Building2}
                            placeholder="np. Acme Corp"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className="bg-[#0f0f0f]"
                            autoFocus
                          />
                        </div>
                        <Button 
                          onClick={handleCreateOrg}
                          disabled={!orgName || isLoading}
                          className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-11"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Utwórz Organizację'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Kod Zaproszenia</label>
                          <Input 
                            icon={Key}
                            placeholder="np. TF-ACM-1234"
                            value={inviteToken}
                            onChange={(e) => setInviteToken(e.target.value)}
                            className="bg-[#0f0f0f]"
                            autoFocus
                          />
                        </div>
                        <Button 
                          onClick={handleJoinOrg}
                          disabled={!inviteToken || isLoading}
                          className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-11"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dołącz do Zespołu'}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;