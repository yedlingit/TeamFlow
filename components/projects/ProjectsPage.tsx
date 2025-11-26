
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Clock, MoreHorizontal, Edit, Trash2, X, Save, AlertCircle, Search, User, Crown, Check, Palette, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { projectService, authService, userService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';
import type { ProjectDto, UserDto, UserListDto } from '../../api/types';

// Mock data removed - using API now

// Mock data removed - using API now

const getProjectStyles = (theme: string) => {
    switch (theme) {
      case 'white': return { bar: 'bg-white', shadow: 'shadow-[0_0_12px_rgba(255,255,255,0.4)]', text: 'text-white' };
      case 'blue': return { bar: 'bg-blue-500', shadow: 'shadow-[0_0_12px_rgba(59,130,246,0.5)]', text: 'text-blue-400' };
      case 'indigo': return { bar: 'bg-indigo-500', shadow: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]', text: 'text-indigo-400' };
      case 'purple': return { bar: 'bg-purple-500', shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]', text: 'text-purple-400' };
      default: return { bar: 'bg-zinc-500', shadow: 'shadow-none', text: 'text-zinc-400' };
    }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const DropdownMenuItem = ({ icon: Icon, children, onClick, className }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors",
      className
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{children}</span>
  </button>
);

interface ProjectCardProps {
  project: ProjectDto;
  isMenuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  canEdit?: boolean; // Whether user can edit/delete projects
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isMenuOpen, onMenuToggle, onEdit, onDelete, canEdit = false }) => {
  const styles = getProjectStyles(project.theme || 'white');
  const [isHovered, setIsHovered] = useState(false);
  
  // Map members to initials for display
  const sortedTeam = useMemo(() => {
      if (!project.members || project.members.length === 0) return [];
      const members = [...project.members];
      // Sort: Leader first
      return members.sort((a, b) => {
          if (a.userId === project.teamLeaderId) return -1;
          if (b.userId === project.teamLeaderId) return 1;
          return 0;
      }).map(m => m.initials || m.email[0].toUpperCase());
  }, [project.members, project.teamLeaderId]);
  
  const statusLower = project.status.toLowerCase();

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn("relative", isMenuOpen && "z-40")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layout
        animate={{ 
            scale: isHovered || isMenuOpen ? 1.02 : 1,
            backgroundColor: isHovered || isMenuOpen ? 'rgba(24, 24, 27, 0.4)' : '#0A0A0A',
            borderColor: isHovered || isMenuOpen ? 'rgba(63, 63, 70, 1)' : 'rgba(39, 39, 42, 0.6)'
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl relative flex flex-col h-full overflow-hidden",
          statusLower === 'inactive' && "opacity-60 grayscale"
        )}
      >
        <Link to={`/projects/${project.id}`} className="flex flex-col h-full p-6 w-full">
            <div className="flex justify-between items-start mb-4 relative z-20">
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <Folder className="w-5 h-5 text-zinc-400" />
            </div>
            {canEdit && (
              <div onClick={(e) => e.preventDefault()}>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onMenuToggle}
                    className={cn(
                        "w-8 h-8 rounded-lg text-zinc-500 transition-all duration-200",
                        (isHovered || isMenuOpen) ? "opacity-100 bg-zinc-900/50" : "opacity-0"
                    )}
                    aria-label="Project options"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            )}
            </div>

            <div className="flex-1 relative z-20">
            <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
            <div className="h-12">
                <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{project.description}</p>
            </div>
            </div>

            <div className="mt-6 space-y-4 relative z-20">
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className={cn("h-full", styles.bar, styles.shadow)} style={{ width: `${project.progress}%` }} />
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member, i) => {
                    const isLeader = member.userId === project.teamLeaderId;
                    const initials = member.initials || 
                      `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || 
                      member.email?.[0]?.toUpperCase() || '?';
                    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Nieznany';
                    return (
                      <div 
                        key={member.userId} 
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-zinc-200 transition-all",
                          isLeader 
                              ? "bg-zinc-800 border-amber-500 border-2 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                              : "bg-zinc-700 border border-zinc-600"
                        )}
                        title={isLeader ? `Project Manager: ${fullName}` : fullName}
                      >
                        {initials}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-zinc-500">Brak członków</span>
                )}
                </div>
                {project.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(project.dueDate).toLocaleDateString('pl-PL')}</span>
                  </div>
                )}
            </div>
            </div>
        </Link>
      </motion.div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="absolute top-14 right-4 z-50 w-40 bg-[#121212] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-2 origin-top-right"
          >
            <DropdownMenuItem icon={Edit} onClick={onEdit}>Edytuj</DropdownMenuItem>
            <DropdownMenuItem icon={Trash2} onClick={onDelete} className="text-red-500 hover:bg-red-900/20 hover:text-red-400">Usuń</DropdownMenuItem>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProjectsPage = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();
  
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  
  // Check if user can create projects (TeamLeader or Administrator)
  const canCreateProjects = currentUser?.role === 'TeamLeader' || currentUser?.role === 'Administrator';
  
  // Edit/Create Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<ProjectDto> & { memberIds?: string[] } | null>(null);
  const [isLeaderOpen, setIsLeaderOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{name?: string}>({});
  const [organizationMembers, setOrganizationMembers] = useState<UserListDto[]>([]);

  // Load current user, projects, and organization members
  useEffect(() => {
    loadCurrentUser();
    loadProjects();
    loadOrganizationMembers();
  }, [filter, searchQuery, page]);

  const loadOrganizationMembers = async () => {
    try {
      const result = await userService.getUsers({
        page: 1,
        pageSize: 100,
      });
      setOrganizationMembers(result.items);
    } catch (err) {
      // Silent fail
      console.error('Failed to load organization members:', err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getMe();
      setCurrentUser(user);
    } catch (err) {
      // Silent fail
    }
  };

  const loadProjects = async () => {
    startLoading();
    try {
      const result = await projectService.getProjects({
        status: filter === 'active' ? 'Active' : 'Inactive',
        search: searchQuery || undefined,
        page,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      setProjects(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      handleApiError(err);
    } finally {
      stopLoading();
    }
  };

  const filteredProjects = useMemo(() => {
    // Remove duplicates based on project ID (in case API returns duplicates)
    const uniqueProjects = projects.filter((project, index, self) => 
      index === self.findIndex((p) => p.id === project.id)
    );
    return uniqueProjects;
  }, [projects]);

  const filters = [
    { value: 'active', label: 'Aktywne', apiValue: 'Active' },
    { value: 'archived', label: 'Archiwum', apiValue: 'Inactive' },
  ];

  const handleMenuToggle = (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenFor(prev => (prev === projectId ? null : projectId));
  };
  
  const handleEdit = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    startLoading();
    try {
      const projectToEdit = await projectService.getById(projectId);
      setEditingProject({ 
        ...projectToEdit,
        memberIds: projectToEdit.members?.map(m => m.userId) || []
      });
      setFormErrors({});
      setIsEditModalOpen(true);
      setIsLeaderOpen(false);
    } catch (err) {
      handleApiError(err, 'Nie udało się załadować projektu');
    } finally {
      stopLoading();
    }
    
    setMenuOpenFor(null);
  };

  const handleDelete = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Czy na pewno chcesz usunąć ten projekt?')) {
      return;
    }

    try {
      await projectService.delete(projectId);
      success('Projekt został usunięty');
      loadProjects(); // Reload projects
    } catch (err) {
      handleApiError(err, 'Nie udało się usunąć projektu');
    }
    
    setMenuOpenFor(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProject) return;

      // Validation
      if (!editingProject.name || editingProject.name.trim().length < 3) {
          setFormErrors({ name: "Nazwa projektu musi mieć co najmniej 3 znaki." });
          return;
      }

      startLoading();
      try {
        if (editingProject.id === 0 || !editingProject.id) {
          // Create New Project - send memberIds directly in the create request
          const newProject = await projectService.create({
            name: editingProject.name!,
            description: editingProject.description || undefined,
            theme: editingProject.theme || undefined,
            dueDate: editingProject.dueDate || undefined,
            teamLeaderId: editingProject.teamLeaderId || undefined,
            memberIds: editingProject.memberIds && editingProject.memberIds.length > 0 
              ? editingProject.memberIds 
              : undefined,
          });
          
          success('Projekt został utworzony');
          
          // Small delay to ensure database is updated
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          // Update Existing Project
          // Prepare update data - ensure dueDate is in correct format
          const updateData: any = {
            name: editingProject.name,
            description: editingProject.description || undefined,
            status: editingProject.status,
            theme: editingProject.theme || undefined,
            teamLeaderId: editingProject.teamLeaderId || undefined,
            memberIds: editingProject.memberIds && editingProject.memberIds.length > 0 
              ? editingProject.memberIds 
              : undefined, // Send memberIds to update project members
          };
          
          // Format dueDate properly (backend expects ISO string or null)
          if (editingProject.dueDate) {
            // If it's already in YYYY-MM-DD format, convert to ISO string
            const dateStr = editingProject.dueDate;
            if (dateStr.includes('T')) {
              updateData.dueDate = dateStr;
            } else {
              // Convert YYYY-MM-DD to ISO string
              updateData.dueDate = new Date(dateStr + 'T00:00:00').toISOString();
            }
          } else {
            updateData.dueDate = undefined;
          }
          
          await projectService.update(editingProject.id, updateData);
          
          success('Projekt został zaktualizowany');
          
          // Small delay to ensure database is updated
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setIsEditModalOpen(false);
        setEditingProject(null);
        setIsLeaderOpen(false);
        setFormErrors({});
        
        // Reload projects - ensure we're loading active projects
        // Force reload by resetting page to 1 if needed
        await loadProjects();
      } catch (err) {
        handleApiError(err, 'Nie udało się zapisać projektu');
      } finally {
        stopLoading();
      }
  };

  const toggleTeamMember = (userId: string) => {
    if (!editingProject) return;
    
    const currentMemberIds = editingProject.memberIds || [];
    let newMemberIds: string[];
    let newLeaderId = editingProject.teamLeaderId;

    if (currentMemberIds.includes(userId)) {
        // Remove user
        newMemberIds = currentMemberIds.filter((id: string) => id !== userId);
        // If leader is removed, clear leader
        if (newLeaderId === userId) newLeaderId = undefined;
    } else {
        // Add user
        newMemberIds = [...currentMemberIds, userId];
    }
    
    setEditingProject({ ...editingProject, memberIds: newMemberIds, teamLeaderId: newLeaderId });
  };

  const handleCreateProject = () => {
      // Setup blank project
      setEditingProject({
          id: 0, // 0 indicates new project
          name: '',
          description: '',
          status: 'Active',
          dueDate: new Date(Date.now() + 12096e5).toISOString().split('T')[0], // Default 14 days from now
          theme: 'white',
          memberIds: [] // Initialize empty member list
      });
      setFormErrors({});
      setIsEditModalOpen(true);
      setIsLeaderOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 relative"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projekty</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Zarządzaj swoimi projektami w jednym miejscu.
          </p>
        </div>
        {canCreateProjects && (
          <Button onClick={handleCreateProject} size="default" className="bg-white text-black hover:bg-zinc-200 self-start md:self-center">
            <Plus className="w-4 h-4 mr-2" />
            Nowy Projekt
          </Button>
        )}
      </div>

      {/* Animated Segmented Control */}
      <div className="relative flex items-center gap-2 p-1 bg-[#0A0A0A] border border-zinc-800 rounded-full self-start">
        {filters.map(item => (
          <button 
            key={item.value} 
            onClick={() => setFilter(item.value as 'active' | 'archived')}
            className={cn(
              "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10",
              filter !== item.value && "hover:text-white"
            )}
          >
            {filter === item.value && (
                <motion.div
                    layoutId="filter-highlight"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
            )}
            <span className="text-black relative">
               <span className={cn("relative", filter === item.value ? "text-black" : "text-zinc-400")}>
                   {item.label}
               </span>
            </span>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={filter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
                <ProjectCard 
                key={project.id} 
                project={project} 
                isMenuOpen={menuOpenFor === project.id}
                onMenuToggle={(e) => handleMenuToggle(e, project.id)}
                onEdit={(e) => handleEdit(e, project.id)}
                onDelete={(e) => handleDelete(e, project.id)}
                canEdit={canCreateProjects || project.teamLeaderId === currentUser?.userId}
                />
            ))
          ) : (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500"
            >
                <Folder className="w-12 h-12 mb-4 opacity-20" />
                <p>Brak projektów w tej kategorii.</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Backdrop for Menu */}
      <div className="flex justify-end">
      </div>
      
      <AnimatePresence>
        {menuOpenFor !== null && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpenFor(null)}
            />
        )}
      </AnimatePresence>

      {/* Edit/Create Project Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingProject && (
            <>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsEditModalOpen(false)}
                >
                     {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {organizationMembers.length === 0 && (
                            <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-sm">
                                Ładowanie członków organizacji...
                            </div>
                        )}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-white">
                                {editingProject.id === 0 ? "Nowy Projekt" : "Edytuj Projekt"}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)} className="rounded-full hover:bg-zinc-900">
                                <X className="w-5 h-5 text-zinc-400" />
                            </Button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Nazwa Projektu <span className="text-red-500">*</span></label>
                                <Input 
                                    value={editingProject.name}
                                    onChange={(e) => {
                                        setEditingProject({...editingProject, name: e.target.value});
                                        setFormErrors({...formErrors, name: undefined});
                                    }}
                                    placeholder="Wprowadź nazwę..."
                                    className="bg-[#111]"
                                    error={formErrors.name}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Opis</label>
                                <textarea 
                                    value={editingProject.description}
                                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                                    rows={3}
                                    className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 transition-all duration-200 resize-none"
                                    placeholder="Krótki opis projektu..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Termin
                                    </label>
                                    <input 
                                        type="date" 
                                        value={editingProject.dueDate}
                                        onChange={(e) => setEditingProject({...editingProject, dueDate: e.target.value})}
                                        className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 [color-scheme:dark]" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1 flex items-center gap-1">
                                        <Palette className="w-3 h-3" /> Kolor Motywu
                                    </label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'white', label: 'Biały', color: 'bg-white' },
                                            { value: 'blue', label: 'Niebieski', color: 'bg-blue-500' },
                                            { value: 'indigo', label: 'Indygo', color: 'bg-indigo-500' },
                                            { value: 'purple', label: 'Fioletowy', color: 'bg-purple-500' },
                                            { value: 'zinc', label: 'Szary', color: 'bg-zinc-500' }
                                        ].map(themeOption => (
                                            <button
                                                key={themeOption.value}
                                                type="button"
                                                onClick={() => setEditingProject({...editingProject, theme: themeOption.value})}
                                                className={cn(
                                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                    themeOption.color,
                                                    editingProject.theme === themeOption.value 
                                                        ? "ring-2 ring-offset-2 ring-offset-[#0A0A0A] ring-white" 
                                                        : "ring-transparent"
                                                )}
                                                title={themeOption.label}
                                            >
                                                {editingProject.theme === themeOption.value && (
                                                    <Check className="w-4 h-4 text-black" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Zespół Projektowy</label>
                                <div className="bg-[#111] border border-zinc-800 rounded-xl p-3 max-h-48 overflow-y-auto">
                                    <div className="space-y-1">
                                        {organizationMembers.map(member => {
                                            const isSelected = editingProject.memberIds?.includes(member.userId) || false;
                                            const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                                            const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                                            return (
                                                <button
                                                    key={member.userId}
                                                    type="button"
                                                    onClick={() => toggleTeamMember(member.userId)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                                                        isSelected ? "bg-zinc-800" : "hover:bg-zinc-900"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                                                            isSelected ? "bg-white text-black border-white" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                                        )}>
                                                            {member.initials}
                                                        </div>
                                                        <div className="text-left">
                                                            <div className={cn("text-sm font-medium", isSelected ? "text-white" : "text-zinc-400")}>{fullName}</div>
                                                            <div className="text-[10px] text-zinc-600">{member.email}</div>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Project Manager</label>
                                <button
                                    type="button"
                                    onClick={() => setIsLeaderOpen(!isLeaderOpen)}
                                    className="w-full bg-[#111] border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center justify-between hover:border-zinc-700 transition-colors"
                                >
                                    {editingProject.teamLeaderId ? (
                                        <div className="flex items-center gap-2">
                                            <Crown className="w-4 h-4 text-amber-500" />
                                            {(() => {
                                              const leader = organizationMembers.find(m => m.userId === editingProject.teamLeaderId);
                                              const leaderInitials = leader?.initials || `${leader?.firstName?.[0] || ''}${leader?.lastName?.[0] || ''}`.toUpperCase() || leader?.email[0].toUpperCase() || '?';
                                              const leaderName = leader ? `${leader.firstName || ''} ${leader.lastName || ''}`.trim() || leader.email : 'Nieznany';
                                              return (
                                                <>
                                                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 border border-zinc-700">
                                                    {leaderInitials}
                                                  </div>
                                                  <span className="text-sm text-white font-medium">
                                                    {leaderName}
                                                  </span>
                                                </>
                                              );
                                            })()}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-zinc-500">Wybierz lidera...</span>
                                    )}
                                    <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", isLeaderOpen && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {isLeaderOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-zinc-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1"
                                        >
                                            {editingProject.memberIds && editingProject.memberIds.length > 0 ? (
                                                organizationMembers
                                                    .filter(m => editingProject.memberIds?.includes(m.userId))
                                                    .map(member => {
                                                      const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                                                      const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                                                      return (
                                                        <button
                                                            key={member.userId}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingProject({ ...editingProject, teamLeaderId: member.userId });
                                                                setIsLeaderOpen(false);
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left mb-0.5",
                                                                editingProject.teamLeaderId === member.userId ? "bg-zinc-800" : "hover:bg-zinc-900"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700">
                                                                    {initials}
                                                                </div>
                                                                <span className={cn("text-sm", editingProject.teamLeaderId === member.userId ? "text-white font-medium" : "text-zinc-400")}>
                                                                    {fullName}
                                                                </span>
                                                            </div>
                                                            {editingProject.teamLeaderId === member.userId && <Check className="w-4 h-4 text-amber-500" />}
                                                        </button>
                                                      );
                                                    })
                                            ) : (
                                                <div className="p-3 text-center text-xs text-zinc-500 italic">
                                                    Najpierw dodaj członków zespołu do projektu.
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                             <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Status</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProject({...editingProject, status: 'Active'})}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-sm font-medium transition-all border",
                                            (editingProject.status === 'Active' || editingProject.status === 'active')
                                                ? "bg-white text-black border-white" 
                                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                                        )}
                                    >
                                        Aktywny
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingProject({...editingProject, status: 'Inactive'})}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-sm font-medium transition-all border",
                                            (editingProject.status === 'Inactive' || editingProject.status === 'archived')
                                                ? "bg-white text-black border-white" 
                                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                                        )}
                                    >
                                        Archiwum
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-zinc-800 flex gap-3 shrink-0">
                            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-xl hover:bg-zinc-900">
                                Anuluj
                            </Button>
                            <Button type="submit" onClick={handleSaveEdit} className="flex-1 rounded-xl bg-white text-black hover:bg-zinc-200">
                                <Save className="w-4 h-4 mr-2" />
                                {editingProject.id === 0 ? "Utwórz" : "Zapisz"}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectsPage;
