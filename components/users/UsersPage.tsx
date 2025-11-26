
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  Trash2, 
  Edit, 
  X, 
  Briefcase,
  Save,
  Filter,
  Copy,
  Check,
  Key,
  Users
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { userService, organizationService, authService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';
import type { UserListDto, UserDto } from '../../api/types';

// --- MOCK DATA ---
const initialUsers = [
  { id: 1, firstName: 'Jan', lastName: 'Kowalski', email: 'jan.kowalski@teamflow.com', role: 'admin', position: 'CTO', initials: 'JK' },
  { id: 2, firstName: 'Anna', lastName: 'Wiśniewska', email: 'anna.wisniewska@teamflow.com', role: 'manager', position: 'Product Owner', initials: 'AW' },
  { id: 3, firstName: 'Marek', lastName: 'Nowak', email: 'marek.nowak@teamflow.com', role: 'user', position: 'Backend Dev', initials: 'MN' },
  { id: 4, firstName: 'Piotr', lastName: 'Dąbrowski', email: 'piotr.dabrowski@teamflow.com', role: 'user', position: 'DevOps Engineer', initials: 'PD' },
  { id: 5, firstName: 'Katarzyna', lastName: 'Szymańska', email: 'katarzyna.szymanska@teamflow.com', role: 'user', position: 'QA Engineer', initials: 'KS' },
  { id: 6, firstName: 'Tomasz', lastName: 'Szymański', email: 'tomasz.szymanski@teamflow.com', role: 'user', position: 'Mobile Dev', initials: 'TS' },
  { id: 7, firstName: 'Dorota', lastName: 'Olszewska', email: 'dorota.olszewska@teamflow.com', role: 'user', position: 'UX Designer', initials: 'DO' },
];

const roles = {
  Administrator: { label: 'Administrator', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  TeamLeader: { label: 'Team Leader', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  Member: { label: 'Pracownik', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  // Legacy support
  admin: { label: 'Administrator', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  manager: { label: 'Manager', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  user: { label: 'Pracownik', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }
};

const UsersPage = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();
  
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListDto | null>(null);
  
  // Invite Token State
  const [inviteToken, setInviteToken] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Dropdown State
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  
  // Check if current user is Administrator
  const isAdministrator = currentUser?.role === 'Administrator';
  
  // Load users
  useEffect(() => {
    loadCurrentUser();
    loadUsers();
    loadInviteToken();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getMe();
      // Ensure role is mapped correctly
      const mappedUser = {
        ...user,
        role: typeof user.role === 'number' 
          ? (user.role === 0 ? 'Member' : user.role === 1 ? 'TeamLeader' : 'Administrator')
          : user.role
      };
      setCurrentUser(mappedUser);
    } catch (err) {
      // Silent fail
      console.error('Failed to load current user:', err);
    }
  };

  const loadUsers = async () => {
    startLoading();
    try {
      const result = await userService.getUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page: 1,
        pageSize: 100,
      });
      // Ensure all roles are mapped correctly
      const mappedUsers = result.items.map(user => ({
        ...user,
        role: typeof user.role === 'number' 
          ? (user.role === 0 ? 'Member' : user.role === 1 ? 'TeamLeader' : 'Administrator')
          : user.role
      }));
      setUsers(mappedUsers);
    } catch (err: any) {
      // If 403 Forbidden, user doesn't have access - redirect handled by ProtectedUsersPage
      // If other error, show message
      if (err?.status === 403) {
        // Access denied - will be redirected by ProtectedUsersPage
        console.warn('Access denied to users page');
        return;
      }
      console.error('Error loading users:', err);
      handleApiError(err, 'Nie udało się załadować użytkowników');
      // Set empty array on error to prevent black screen
      setUsers([]);
    } finally {
      stopLoading();
    }
  };

  const loadInviteToken = async () => {
    try {
      const org = await organizationService.getCurrent();
      setInviteToken(org.invitationCode);
    } catch (err) {
      // Silent fail
    }
  };

  // Form Data (for Editing only)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    position: ''
  });

  // Reload users when filters change
  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter]);

  const filteredUsers = useMemo(() => {
    return users; // Already filtered by API
  }, [users]);

  const handleOpenModal = (user: UserListDto | null = null) => {
    if (user) {
      // EDIT MODE
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role,
        position: '' // Position not in API
      });
      setInviteToken('');
    } else {
      // ADD/INVITE MODE
      setEditingUser(null);
      // Token is already loaded from API
    }
    setIsModalOpen(true);
    setMenuOpenFor(null);
    setIsCopied(false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      startLoading();
      try {
        // Only Administrator can change role
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
        };
        
        if (isAdministrator && formData.role) {
          updateData.role = formData.role as 'Member' | 'TeamLeader' | 'Administrator';
        }
        
        await userService.update(editingUser.userId, updateData);
        success('Użytkownik został zaktualizowany');
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', email: '', role: 'user', position: '' });
        loadUsers();
      } catch (err) {
        handleApiError(err, 'Nie udało się zaktualizować użytkownika');
      } finally {
        stopLoading();
      }
    } else {
      // Invite mode - just close modal (invite is done via token)
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', role: 'user', position: '' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      return;
    }

    startLoading();
    try {
      await userService.delete(userId);
      success('Użytkownik został usunięty');
      loadUsers();
    } catch (err) {
      handleApiError(err, 'Nie udało się usunąć użytkownika');
    } finally {
      stopLoading();
    }
    
    setMenuOpenFor(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteToken);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Użytkownicy</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Zarządzaj dostępem i rolami członków organizacji.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-white text-black hover:bg-zinc-200">
          <Plus className="w-4 h-4 mr-2" />
          Zaproś Użytkownika
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Szukaj po nazwisku, emailu lub stanowisku..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/10 appearance-none pr-10 cursor-pointer"
                >
                    <option value="all">Wszystkie role</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="user">Pracownik</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-500 text-sm">Ładowanie użytkowników...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-sm">Brak użytkowników do wyświetlenia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredUsers.map((user) => (
            <motion.div
                key={user.userId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0A0A0A] border rounded-3xl p-6 flex flex-col gap-4 group transition-colors border-zinc-800/60 hover:border-zinc-700"
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors bg-zinc-800 text-white border-zinc-700">
                            {user.initials || user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                <Briefcase className="w-3 h-3" />
                                {user.role === 'Administrator' ? 'Administrator' : user.role === 'TeamLeader' ? 'Team Leader' : 'Pracownik'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setMenuOpenFor(menuOpenFor === user.userId ? null : user.userId)}
                            className="h-8 w-8 rounded-lg hover:bg-zinc-900"
                        >
                            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                        </Button>
                        <AnimatePresence>
                            {menuOpenFor === user.userId && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpenFor(null)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                        className="absolute right-0 top-full mt-2 w-40 bg-[#121212] border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden p-1"
                                    >
                                        {/* Edytuj - dostępne dla wszystkich */}
                                        <button onClick={() => handleOpenModal(user)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg text-left">
                                            <Edit className="w-3.5 h-3.5" /> Edytuj
                                        </button>
                                        
                                        {/* Usuń - tylko dla Administratorów */}
                                        {isAdministrator && (
                                          <>
                                            <div className="my-1 border-t border-zinc-800" />
                                            <button onClick={() => handleDeleteUser(user.userId)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-900/10 rounded-lg text-left">
                                                <Trash2 className="w-3.5 h-3.5" /> Usuń
                                            </button>
                                          </>
                                        )}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-3">
                     <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                        <Mail className="w-4 h-4 text-zinc-500" />
                        <span className="truncate">{user.email}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5",
                            roles[user.role as keyof typeof roles]?.color || roles.Member.color
                        )}>
                            <Shield className="w-3 h-3" />
                            {roles[user.role as keyof typeof roles]?.label || 'Pracownik'}
                        </div>
                     </div>
                </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setIsModalOpen(false)}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                            {editingUser ? 'Edytuj Użytkownika' : 'Zaproś Użytkownika'}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-zinc-900">
                            <X className="w-5 h-5 text-zinc-400" />
                        </Button>
                    </div>

                    {editingUser ? (
                        /* EDIT FORM */
                        <form onSubmit={handleSaveUser} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Imię</label>
                                    <Input 
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        required
                                        className="bg-[#111]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Nazwisko</label>
                                    <Input 
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        required
                                        className="bg-[#111]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
                                <Input 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    disabled={!!editingUser} // Email nie może być zmieniony
                                    className="bg-[#111] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Stanowisko</label>
                                <Input 
                                    value={formData.position}
                                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                                    required
                                    placeholder="np. Frontend Developer"
                                    className="bg-[#111]"
                                />
                            </div>

                            {/* Rola - tylko dla Administratorów */}
                            {isAdministrator && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Rola</label>
                                    <select 
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full bg-[#111] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                                    >
                                        <option value="Member">Pracownik</option>
                                        <option value="TeamLeader">Team Leader</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl hover:bg-zinc-900">
                                    Anuluj
                                </Button>
                                <Button type="submit" className="flex-1 rounded-xl bg-white text-black hover:bg-zinc-200">
                                    <Save className="w-4 h-4 mr-2" />
                                    Zapisz
                                </Button>
                            </div>
                        </form>
                    ) : (
                        /* INVITE TOKEN VIEW */
                        <div className="p-8 flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Key className="w-8 h-8 text-blue-400" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-white text-xl font-bold">Kod Zaproszenia</h3>
                                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                                    Udostępnij ten kod nowemu pracownikowi. Będzie on potrzebny podczas rejestracji konta.
                                </p>
                            </div>

                            <div className="w-full p-4 bg-black rounded-xl border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                                <code className="text-xl font-mono font-bold text-white tracking-wider">
                                    {inviteToken}
                                </code>
                                <button 
                                    onClick={copyToClipboard}
                                    className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors relative"
                                    title="Kopiuj do schowka"
                                >
                                    {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>

                            <Button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-12 font-medium"
                            >
                                Gotowe
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UsersPage;
