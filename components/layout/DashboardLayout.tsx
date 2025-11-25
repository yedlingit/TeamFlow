
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folder, 
  CheckSquare, 
  Users,
  Settings, 
  LogOut,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../api';
import { useApiError } from '../../hooks/useApiError';
import type { UserDto } from '../../api/types';

const SidebarItem = ({ 
  to, 
  icon: Icon, 
  label,
  onClick
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string;
  onClick?: () => void;
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
          isActive
            ? "bg-white text-black font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const handleApiError = useApiError();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    initials: string;
    role: 'Member' | 'TeamLeader' | 'Administrator';
  } | null>(null);

  // Check if user is logged in and has organization
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getMe();
        
        // If user doesn't have organization, redirect to onboarding
        if (!currentUser.organizationId) {
          navigate('/onboarding');
          return;
        }

        // Set user data
        const firstName = currentUser.firstName || '';
        const lastName = currentUser.lastName || '';
        const initials = currentUser.firstName && currentUser.lastName
          ? `${firstName[0]}${lastName[0]}`.toUpperCase()
          : currentUser.email[0].toUpperCase();

        setUser({
          name: `${firstName} ${lastName}`.trim() || currentUser.email,
          email: currentUser.email,
          initials,
          role: currentUser.role,
        });
      } catch (err) {
        // If not authenticated, redirect to login
        handleApiError(err);
        navigate('/login');
      }
    };

    checkUser();
  }, [navigate, handleApiError]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    }
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-900/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black">
            <Layers className="w-4 h-4 fill-current" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            TeamFlow
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Pulpit" onClick={() => setIsMobileMenuOpen(false)} />
        <SidebarItem to="/projects" icon={Folder} label="Projekty" onClick={() => setIsMobileMenuOpen(false)} />
        <SidebarItem to="/tasks" icon={CheckSquare} label="Zadania" onClick={() => setIsMobileMenuOpen(false)} />
        
        {/* Użytkownicy - tylko dla Administratorów i Team Leaderów */}
        {(user?.role === 'Administrator' || user?.role === 'TeamLeader') && (
          <SidebarItem to="/users" icon={Users} label="Użytkownicy" onClick={() => setIsMobileMenuOpen(false)} />
        )}
        
        <div className="my-4 border-t border-zinc-900/50 mx-2" />
        
        <SidebarItem to="/settings" icon={Settings} label="Ustawienia" onClick={() => setIsMobileMenuOpen(false)} />
      </nav>

      {/* User Profile / Logout */}
      {user && (
        <div className="p-4 border-t border-zinc-900 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xs font-medium text-white border border-zinc-700">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans text-zinc-200">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-64 bg-[#050505] border-r border-zinc-900 flex-col fixed h-full z-30 hidden md:flex">
        <SidebarContent />
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#050505]/80 backdrop-blur-md border-b border-zinc-900 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-white">TeamFlow</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-zinc-800 z-50 flex flex-col md:hidden"
            >
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
