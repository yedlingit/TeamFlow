
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Edit, 
  Plus, 
  Clock, 
  Paperclip,
  MessageSquare,
  X,
  Check,
  AlignLeft,
  Trash2,
  Briefcase,
  Calendar,
  Flag,
  ChevronDown,
  Save,
  Send,
  User,
  Loader2,
  Crown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { projectService, taskService, userService, authService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';
import type { ProjectDto, TaskDto, UserListDto, UserDto } from '../../api/types';

interface TaskCardProps {
  task: any;
  handleDragStart: (e: React.DragEvent, taskId: number) => void;
  handleDragEnd: () => void;
  draggedTaskId: number | null;
  onClick: () => void;
}

const cardVariants = {
  idle: { scale: 1, rotate: 0, zIndex: 0, opacity: 1 },
  dragging: { 
    scale: 1.05, 
    rotate: 3, 
    zIndex: 50, 
    opacity: 0.8,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
  },
  hover: { scale: 1.02, backgroundColor: "rgba(39, 39, 42, 0.6)" }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, handleDragStart, handleDragEnd, draggedTaskId, onClick }) => {
    const isDragging = draggedTaskId === task.id;
    
    const priorityColors: Record<string, string> = {
        High: 'bg-red-500/10 text-red-400 border-l-red-500',
        high: 'bg-red-500/10 text-red-400 border-l-red-500',
        Medium: 'bg-orange-500/10 text-orange-400 border-l-orange-500',
        medium: 'bg-orange-500/10 text-orange-400 border-l-orange-500',
        Low: 'bg-zinc-500/10 text-zinc-400 border-l-zinc-500',
        low: 'bg-zinc-500/10 text-zinc-400 border-l-zinc-500',
    };
    
    // Get assignees from API structure (TaskAssigneeDto[])
    const assignees = task.assignees || [];
    // Map priority from API format to frontend format
    const priority = task.priority || 'Low';

    return (
        <motion.div 
            layout // Enables automatic reordering animations
            variants={cardVariants}
            initial="idle"
            animate={isDragging ? "dragging" : "idle"}
            whileHover={!isDragging ? "hover" : undefined}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            draggable="true"
            onDragStart={((e: React.DragEvent) => handleDragStart(e, task.id)) as any}
            onDragEnd={handleDragEnd}
            onClick={onClick}
            className={cn(
                "group relative bg-[#121212] border border-zinc-800/60 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-colors duration-200 border-l-4 shadow-sm",
                priorityColors[priority as keyof typeof priorityColors] || priorityColors.low
            )}
        >
            <div className="flex justify-between items-start gap-2 mb-3">
                <h4 className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors">
                    {task.title}
                </h4>
                </div>
                
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-zinc-500">
                    {/* Assignees Avatars (Mini) */}
                    {assignees.length > 0 && (
                        <div className="flex -space-x-2">
                            {assignees.slice(0, 3).map((assignee: any, i: number) => {
                                const initials = assignee.initials || 
                                    `${assignee.firstName?.[0] || ''}${assignee.lastName?.[0] || ''}`.toUpperCase() || 
                                    assignee.email[0].toUpperCase();
                                return (
                                    <div key={assignee.userId || i} className="w-5 h-5 rounded-full bg-zinc-700 border border-[#121212] flex items-center justify-center text-[8px] font-bold text-zinc-300" title={`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email}>
                            {initials}
                        </div>
                                );
                            })}
                            {assignees.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-[#121212] flex items-center justify-center text-[8px] font-medium text-zinc-400">
                                    +{assignees.length - 3}
                </div>
                            )}
                        </div>
                    )}

                    {task.commentCount > 0 && (
                        <div className="flex gap-2 text-xs">
                            <div className="flex items-center gap-1 hover:text-zinc-300">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.commentCount}</span>
                            </div>
                        </div>
                    )}
                </div>

                {task.dueDate && (
                    <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded-lg border border-zinc-800/50">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className={cn(
                            "text-[10px] font-medium",
                            (priority === 'High' || priority === 'high') ? "text-red-400" : "text-zinc-400"
                        )}>
                            {new Date(task.dueDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};


const KanbanColumn = ({ 
    title, 
    tasks, 
    status, 
    handleDrop, 
    handleDragOver, 
    handleDragStart, 
    handleDragEnd, 
    draggedTaskId, 
    dragOverStatus, 
    setDragOverStatus,
    onTaskClick,
    onAddTask,
    canCreateTasks,
    className
}: { 
    title: string, 
    tasks: any[], 
    status: string, 
    handleDrop: (e: React.DragEvent, status: string) => void, 
    handleDragOver: (e: React.DragEvent) => void, 
    handleDragStart: (e: React.DragEvent, taskId: number) => void,
    handleDragEnd: () => void,
    draggedTaskId: number | null,
    dragOverStatus: string | null,
    setDragOverStatus: (status: string | null) => void,
    onTaskClick: (task: any) => void,
    onAddTask?: (status: string) => void,
    canCreateTasks?: boolean,
    className?: string
}) => {
    const isDraggingOver = dragOverStatus === status;
    
    // Map API status to frontend status for display
    const frontendStatus = status === 'todo' ? 'todo' : status === 'in-progress' ? 'in-progress' : 'done';
    
    const statusConfig = {
        todo: { label: 'Do zrobienia', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-700' },
        'in-progress': { label: 'W toku', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
        done: { label: 'Ukończone', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
    };
    
    const config = statusConfig[frontendStatus as keyof typeof statusConfig] || statusConfig.todo;

    return (
        <div
            className={cn("flex-1 min-w-[300px] flex flex-col rounded-xl bg-zinc-900/30 border border-zinc-800/40", className)}
            onDrop={(e) => handleDrop(e, frontendStatus)}
            onDragOver={handleDragOver}
            onDragEnter={() => draggedTaskId !== null && setDragOverStatus(frontendStatus)}
        >
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between border-b border-zinc-800/40">
                <div className="flex items-center gap-3">
                    <div className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border", config.color)}>
                        {config.label}
                </div>
                    <span className="text-zinc-500 text-xs font-mono">{tasks.length}</span>
                </div>
                {canCreateTasks && onAddTask && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-7 h-7 rounded-lg text-zinc-500 hover:text-white"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddTask(frontendStatus);
                        }}
                    >
                    <Plus className="w-4 h-4" />
                </Button>
                )}
            </div>

            {/* Tasks List */}
            <div className="flex-1 p-3 overflow-y-auto min-h-[150px]">
                <motion.div 
                    className="space-y-3" 
                    animate={{ backgroundColor: isDraggingOver ? 'rgba(39, 39, 42, 0.3)' : 'transparent' }}
                    transition={{ duration: 0.2 }}
                >
                <AnimatePresence>
                    {tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            handleDragStart={handleDragStart} 
                            handleDragEnd={handleDragEnd} 
                            draggedTaskId={draggedTaskId}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                </AnimatePresence>
        </motion.div>
                
                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-zinc-800/50 rounded-xl flex items-center justify-center text-zinc-600 text-sm mt-2">
                        Brak zadań
                    </div>
                )}
            </div>
        </div>
    );
};


const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoading, startLoading, stopLoading } = useLoading();
    const handleApiError = useApiError();
    const { success } = useToast();
    
    // Initialize project state
    const [project, setProject] = useState<ProjectDto | null>(null);
    
    // Initialize tasks state
    const [tasks, setTasks] = useState<TaskDto[]>([]);
    
    // Organization members for adding to project
    const [organizationMembers, setOrganizationMembers] = useState<UserListDto[]>([]);
    
    // Current user for permissions
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
    
    // Check permissions
    // Administratorzy i TeamLeaderzy (rola organizacyjna) mogą zarządzać wszystkimi projektami
    // Project Manager (teamLeaderId projektu) może zarządzać swoim projektem
    // Memberzy NIE mogą edytować projektów ani dodawać zadań
    const isProjectManager = project?.teamLeaderId === currentUser?.userId;
    const isAdministrator = currentUser?.role === 'Administrator';
    const isTeamLeader = currentUser?.role === 'TeamLeader';
    const canEditProject = isAdministrator || isTeamLeader || isProjectManager;
    const canCreateTasks = isAdministrator || isTeamLeader || isProjectManager;
    const canEditTasks = isAdministrator || isTeamLeader || isProjectManager;
    
    // Load project and tasks from API
    useEffect(() => {
        if (id) {
            loadCurrentUser();
            loadProject();
            loadTasks();
            loadOrganizationMembers();
        }
    }, [id]);
    
    const loadCurrentUser = async () => {
        try {
            const user = await authService.getMe();
            setCurrentUser(user);
        } catch (err) {
            // Silent fail
        }
    };
    
    const loadProject = async () => {
        if (!id) return;
        startLoading();
        try {
            const projectData = await projectService.getById(parseInt(id));
            setProject(projectData);
        } catch (err) {
            handleApiError(err, 'Nie udało się załadować projektu');
            navigate('/projects');
        } finally {
            stopLoading();
        }
    };
    
    const loadTasks = async () => {
        if (!id) return;
        try {
            const result = await taskService.getTasks({
                projectId: parseInt(id),
                page: 1,
                pageSize: 100,
            });
            setTasks(result.items);
        } catch (err) {
            handleApiError(err, 'Nie udało się załadować zadań');
        }
    };
    
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

    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

    // Mobile Tab State
    const [activeMobileTab, setActiveMobileTab] = useState<'todo' | 'in-progress' | 'done'>('todo');

    // Modal States
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false); // New state for Status dropdown
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    // Local state for editing task title and description (not auto-saved)
    const [editingTaskTitle, setEditingTaskTitle] = useState('');
    const [editingTaskDescription, setEditingTaskDescription] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const isUserAssignedToSelectedTask = selectedTask?.assignees?.some((assignee: any) => {
        if (!currentUser) return false;
        if (typeof assignee === 'string') return false;
        return assignee?.userId === currentUser.userId;
    }) ?? false;
    const canChangeStatus = canEditTasks || isUserAssignedToSelectedTask;
    
    // Add Task Modal State
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [targetColumnStatus, setTargetColumnStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: new Date().toISOString().split('T')[0],
        assigneeIds: [] as string[]
    });
    const [taskFormErrors, setTaskFormErrors] = useState<{title?: string}>({});
    
    // Project Edit State
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [editProjectData, setEditProjectData] = useState<any>(null);
    const [isLeaderOpen, setIsLeaderOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-10 text-white">
                <p>Nie znaleziono projektu.</p>
                <Link to="/projects" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                    Wróć do listy projektów
                </Link>
            </div>
        );
    }

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        if (draggedTaskId === null) return;
        
        // Map frontend status to API status
        const statusMap: Record<string, 'ToDo' | 'InProgress' | 'Done'> = {
            'todo': 'ToDo',
            'in-progress': 'InProgress',
            'done': 'Done'
        };
        const apiStatus = statusMap[newStatus] || 'ToDo';
        
        try {
            await taskService.updateStatus(draggedTaskId, apiStatus);
            // Update local state
        setTasks(currentTasks => 
            currentTasks.map(task => 
                    task.id === draggedTaskId ? { ...task, status: apiStatus } : task
                )
            );
            success('Status zadania zaktualizowany');
        } catch (err) {
            handleApiError(err, 'Nie udało się zaktualizować statusu zadania');
            // Reload tasks on error
            await loadTasks();
        }
        
        setDraggedTaskId(null);
        setDragOverStatus(null);
    };
    
    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverStatus(null);
    };

    // --- Task Detail Logic ---
    const handleTaskClick = async (task: TaskDto) => {
        try {
            // Load full task details with comments
            const taskDetail = await taskService.getById(task.id);
            setSelectedTask(taskDetail);
            // Initialize local editing state
            setEditingTaskTitle(taskDetail.title || '');
            setEditingTaskDescription(taskDetail.description || '');
            setHasUnsavedChanges(false);
        setIsPriorityOpen(false);
        setIsUserMenuOpen(false);
        setIsStatusOpen(false);
        } catch (err) {
            handleApiError(err, 'Nie udało się załadować szczegółów zadania');
        }
    };

    const handleSaveTaskChanges = async () => {
        if (!selectedTask || !canEditTasks) return;
        
        startLoading();
        try {
            await taskService.update(selectedTask.id, {
                title: editingTaskTitle,
                description: editingTaskDescription || undefined,
            });
            
            // Reload task details
            const updatedTask = await taskService.getById(selectedTask.id);
            setSelectedTask(updatedTask);
            setEditingTaskTitle(updatedTask.title || '');
            setEditingTaskDescription(updatedTask.description || '');
            setHasUnsavedChanges(false);
            // Also reload tasks list
            await loadTasks();
            success('Zmiany zostały zapisane');
        } catch (err) {
            handleApiError(err, 'Nie udało się zapisać zmian');
        } finally {
            stopLoading();
        }
    };

    const updateSelectedTask = async (field: string, value: any) => {
        if (!selectedTask) return;
        
        // For title and description, update local state only (not auto-save) - SYNC UPDATE
        if (field === 'title') {
            setEditingTaskTitle(value);
            setHasUnsavedChanges(true);
            return; // Early return - no API call
        }
        if (field === 'description') {
            setEditingTaskDescription(value);
            setHasUnsavedChanges(true);
            return; // Early return - no API call
        }
        
        if (!canEditTasks && field !== 'status') {
            return;
        }
        if (field === 'status' && !canChangeStatus) {
            return;
        }
        
        // For other fields (priority, status, dueDate, assignees), save immediately
        startLoading();
        try {
            // Map frontend values to API format
            if (field === 'priority') {
                const apiPriority = mapPriorityToApi(value);
                await taskService.update(selectedTask.id, { priority: apiPriority });
            } else if (field === 'status') {
                const apiStatus = mapStatusToApi(value);
                await taskService.update(selectedTask.id, { status: apiStatus });
            } else if (field === 'dueDate') {
                // Format dueDate properly
                let formattedDueDate: string | undefined = undefined;
                if (value) {
                    const dateStr = value;
                    if (dateStr.includes('T')) {
                        formattedDueDate = dateStr;
                    } else {
                        formattedDueDate = new Date(dateStr + 'T00:00:00').toISOString();
                    }
                }
                await taskService.update(selectedTask.id, { dueDate: formattedDueDate });
            }
            
            // Reload task details
            const updatedTask = await taskService.getById(selectedTask.id);
            setSelectedTask(updatedTask);
            // Update local editing state if task was reloaded
            setEditingTaskTitle(updatedTask.title || '');
            setEditingTaskDescription(updatedTask.description || '');
            // Also reload tasks list
            await loadTasks();
            success('Zmiany zostały zapisane');
        } catch (err) {
            handleApiError(err, 'Nie udało się zaktualizować zadania');
        } finally {
            stopLoading();
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!selectedTask) return;
        const comment = selectedTask.comments?.find((c: any) => c.id === commentId);
        const isAuthor = comment?.authorId === currentUser?.userId;
        if (!canEditTasks && !isAuthor) return;
        try {
            await taskService.deleteComment(commentId);
            // Reload task details to get updated comments
            await loadTasks();
            const updatedTask = await taskService.getById(selectedTask.id);
            setSelectedTask(updatedTask);
            success('Komentarz został usunięty');
        } catch (err) {
            handleApiError(err, 'Nie udało się usunąć komentarza');
        }
    };
    
    const handleSaveComment = async (content: string) => {
        if (!selectedTask) return;
        try {
            await taskService.createComment(selectedTask.id, { content });
            // Reload task details to get updated comments
            const updatedTask = await taskService.getById(selectedTask.id);
            setSelectedTask(updatedTask);
            // Also reload tasks list to update comment count
            await loadTasks();
            success('Komentarz został dodany');
        } catch (err) {
            handleApiError(err, 'Nie udało się dodać komentarza');
        }
    };
    
    // Add Task Handlers
    const openAddTaskModal = (status: 'todo' | 'in-progress' | 'done') => {
        if (!id || !canCreateTasks) return;
        setTargetColumnStatus(status);
        setNewTaskData({
            title: '',
            description: '',
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0],
            assigneeIds: []
        });
        setTaskFormErrors({});
        setIsAddTaskModalOpen(true);
    };
    
    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !canCreateTasks) return;
        
        // Validation
        if (!newTaskData.title || newTaskData.title.trim().length < 3) {
            setTaskFormErrors({ title: "Tytuł zadania musi mieć co najmniej 3 znaki." });
            return;
        }
        
        startLoading();
        try {
            // Map frontend status to API status
            const statusMap: Record<string, 'ToDo' | 'InProgress' | 'Done'> = {
                'todo': 'ToDo',
                'in-progress': 'InProgress',
                'done': 'Done'
            };
            
            const priorityMap: Record<string, 'Low' | 'Medium' | 'High'> = {
                'low': 'Low',
                'medium': 'Medium',
                'high': 'High'
            };
            
            const apiStatus = statusMap[targetColumnStatus] || 'ToDo';
            const apiPriority = priorityMap[newTaskData.priority] || 'Medium';
            
            // Create task with the target status
            // Format dueDate properly (backend expects ISO string or null)
            let formattedDueDate: string | undefined = undefined;
            if (newTaskData.dueDate) {
                // If it's already in YYYY-MM-DD format, convert to ISO string
                const dateStr = newTaskData.dueDate;
                if (dateStr.includes('T')) {
                    formattedDueDate = dateStr;
        } else {
                    // Convert YYYY-MM-DD to ISO string
                    formattedDueDate = new Date(dateStr + 'T00:00:00').toISOString();
                }
            }
            
            const createdTask = await taskService.create({
                title: newTaskData.title,
                description: newTaskData.description || undefined,
                projectId: parseInt(id),
                priority: apiPriority,
                dueDate: formattedDueDate,
                assigneeIds: newTaskData.assigneeIds.length > 0 ? newTaskData.assigneeIds : undefined,
            });
            
            // If status is not ToDo, update it immediately
            if (apiStatus !== 'ToDo') {
                await taskService.updateStatus(createdTask.id, apiStatus);
            }
            
            // Reload tasks
            await loadTasks();
            
            setIsAddTaskModalOpen(false);
            setTaskFormErrors({});
            success('Zadanie zostało utworzone');
        } catch (err) {
            handleApiError(err, 'Nie udało się utworzyć zadania');
        } finally {
            stopLoading();
        }
    };

    const handleToggleAssignee = async (userId: string) => {
        if (!selectedTask || !id || !canEditTasks) return;
        try {
            const isAssigned = selectedTask.assignees?.some((a: any) => {
                if (typeof a === 'string') {
                    // If assignee is initials, find by userId
                    const member = project.members?.find(m => {
                        const initials = m.initials || `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`.toUpperCase() || m.email[0].toUpperCase();
                        return initials === a;
                    });
                    return member?.userId === userId;
                } else if (a?.userId) {
                    return a.userId === userId;
                }
                return false;
            });
            
            if (isAssigned) {
                await taskService.removeAssignee(selectedTask.id, userId);
            } else {
                await taskService.addAssignee(selectedTask.id, userId);
            }
            
            // Reload tasks to get updated assignees
            await loadTasks();
            // Update selected task
            const updatedTask = tasks.find(t => t.id === selectedTask.id);
            if (updatedTask) {
                setSelectedTask(updatedTask);
            }
            success(isAssigned ? 'Przypisanie zostało usunięte' : 'Zadanie zostało przypisane');
        } catch (err) {
            handleApiError(err, 'Nie udało się zaktualizować przypisania');
        }
    };

    // --- Project Team Management ---
    const handleToggleMember = async (userId: string) => {
        if (!project || !id || !canEditProject) return;
        try {
            const isMember = project.members?.some(m => m.userId === userId);
            if (isMember) {
                await projectService.removeMember(project.id, userId);
        } else {
                await projectService.addMember(project.id, userId);
            }
            // Reload project to get updated members
            await loadProject();
            success(isMember ? 'Członek został usunięty z projektu' : 'Członek został dodany do projektu');
        } catch (err) {
            handleApiError(err, 'Nie udało się zaktualizować członków projektu');
        }
    };

    // --- Project Edit Logic ---
    const openEditProject = () => {
        if (!project) return;
        // Format dueDate for date input (YYYY-MM-DD)
        const formattedDueDate = project.dueDate 
            ? new Date(project.dueDate).toISOString().split('T')[0] 
            : '';
        
        // Map API status to frontend status
        const statusMap: Record<string, 'Active' | 'Inactive'> = {
            'Active': 'Active',
            'Inactive': 'Inactive',
            'active': 'Active',
            'inactive': 'Inactive'
        };
        
        setEditProjectData({ 
            ...project,
            dueDate: formattedDueDate,
            theme: project.theme || 'white', // Default to 'white' if not set
            status: statusMap[project.status as string] || 'Active',
            memberIds: project.members?.map(m => m.userId) || []
        });
        setIsEditProjectOpen(true);
        setIsLeaderOpen(false);
    };

    const toggleTeamMember = (userId: string) => {
        if (!editProjectData) return;
        const currentMemberIds = editProjectData.memberIds || [];
        let newMemberIds: string[];
        let newLeaderId = editProjectData.teamLeaderId;

        if (currentMemberIds.includes(userId)) {
            // Remove user
            newMemberIds = currentMemberIds.filter((id: string) => id !== userId);
            // If leader is removed, clear leader
            if (newLeaderId === userId) newLeaderId = undefined;
        } else {
            // Add user
            newMemberIds = [...currentMemberIds, userId];
        }

        setEditProjectData({ ...editProjectData, memberIds: newMemberIds, teamLeaderId: newLeaderId });
    };

    const saveProject = async () => {
        if (!editProjectData || !project) return;
        
        startLoading();
        try {
            // Format dueDate properly (backend expects ISO string or null)
            let formattedDueDate: string | undefined = undefined;
            if (editProjectData.dueDate) {
                // If it's already in YYYY-MM-DD format, convert to ISO string
                const dateStr = editProjectData.dueDate;
                if (dateStr.includes('T')) {
                    formattedDueDate = dateStr;
                } else {
                    // Convert YYYY-MM-DD to ISO string
                    formattedDueDate = new Date(dateStr + 'T00:00:00').toISOString();
                }
            }
            
            // Map status if needed (from frontend string to API enum)
            const statusMap: Record<string, 'Active' | 'Inactive'> = {
                'Active': 'Active',
                'Inactive': 'Inactive',
                'active': 'Active',
                'inactive': 'Inactive'
            };
            const apiStatus = editProjectData.status ? statusMap[editProjectData.status] || 'Active' : undefined;
            
            await projectService.update(project.id, {
                name: editProjectData.name,
                description: editProjectData.description || undefined,
                status: apiStatus,
                theme: editProjectData.theme || undefined,
                dueDate: formattedDueDate,
                teamLeaderId: editProjectData.teamLeaderId || undefined,
                memberIds: editProjectData.memberIds || [],
            });
            
            success('Projekt został zaktualizowany');
        setIsEditProjectOpen(false);
            
            // Small delay to ensure database is updated
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Reload project and tasks
            await loadProject();
            await loadTasks();
        } catch (err) {
            handleApiError(err, 'Nie udało się zapisać zmian w projekcie.');
        } finally {
            stopLoading();
        }
    };


    // Map API status to frontend status for filtering and display
    const mapStatusToFrontend = (status: string): 'todo' | 'in-progress' | 'done' => {
        switch (status) {
            case 'ToDo': return 'todo';
            case 'InProgress': return 'in-progress';
            case 'Done': return 'done';
            default: return 'todo';
        }
    };
    
    // Map frontend status to API status
    const mapStatusToApi = (status: string): 'ToDo' | 'InProgress' | 'Done' => {
        switch (status) {
            case 'todo': return 'ToDo';
            case 'in-progress': return 'InProgress';
            case 'done': return 'Done';
            default: return 'ToDo';
        }
    };
    
    // Map API priority to frontend priority
    const mapPriorityToFrontend = (priority: string): 'low' | 'medium' | 'high' => {
        switch (priority) {
            case 'Low': return 'low';
            case 'Medium': return 'medium';
            case 'High': return 'high';
            default: return 'low';
        }
    };
    
    // Map frontend priority to API priority
    const mapPriorityToApi = (priority: string): 'Low' | 'Medium' | 'High' => {
        switch (priority) {
            case 'low': return 'Low';
            case 'medium': return 'Medium';
            case 'high': return 'High';
            default: return 'Medium';
        }
    };

    const tasksByStatus = {
        todo: tasks.filter(t => mapStatusToFrontend(t.status) === 'todo'),
        'in-progress': tasks.filter(t => mapStatusToFrontend(t.status) === 'in-progress'),
        done: tasks.filter(t => mapStatusToFrontend(t.status) === 'done')
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
        >
            {/* Breadcrumbs */}
            <div className="flex-shrink-0 mb-4">
              <div className="flex items-center text-sm text-zinc-400">
                  <Link to="/projects" className="hover:text-white">Projekty</Link>
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-white font-medium">{project.name}</span>
              </div>
            </div>

            {/* Main content area */}
            <main className="flex-1 bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl flex flex-col min-h-0">
              
              {/* Project Info Section */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
                  </div>
                  {canEditProject && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button onClick={openEditProject} variant="default" size="sm" className="bg-white text-black hover:bg-zinc-200">
                        <Edit className="w-3 h-3 mr-2" /> Edytuj
                    </Button>
                  </div>
                  )}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl mb-6">{project.description}</p>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-sm">
                  <div className="flex items-center gap-x-6 gap-y-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">Termin:</span>
                      <span className="font-medium text-white">{project.dueDate ? new Date(project.dueDate).toLocaleDateString('pl-PL') : 'Brak terminu'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full">
                           <div className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{width: `${project.progress}%`}}></div>
                        </div>
                        <span className="text-zinc-400 font-mono text-xs">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <div className="flex items-center -space-x-2">
                       {project.members && project.members.length > 0 ? (
                           project.members.map((member) => {
                               const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                               const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                               const isLeader = member.userId === project.teamLeaderId;
                           return (
                                   <div 
                                       key={member.userId} 
                                       title={isLeader ? `Lider: ${fullName}` : fullName} 
                                       className={cn(
                                           "w-7 h-7 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center text-xs font-bold cursor-default",
                                           isLeader 
                                               ? "bg-zinc-800 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)] text-amber-200" 
                                               : "bg-zinc-700 text-zinc-200"
                                       )}
                                   >
                                   {initials}
                               </div>
                           );
                           })
                       ) : (
                           <span className="text-xs text-zinc-500">Brak członków</span>
                       )}
                    </div>
                    
                    {/* Invite Button with Dropdown */}
                    {canEditProject && (
                        <div className="relative">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("h-7 px-3 text-xs transition-colors", isInviteOpen && "bg-zinc-800 text-white")}
                                onClick={() => setIsInviteOpen(!isInviteOpen)}
                            >
                                <Plus className="w-3 h-3 mr-1" /> Zaproś
                            </Button>
                            <AnimatePresence>
                                {isInviteOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-[#111] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden p-1 origin-top-right"
                                    >
                                        <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dodaj członków</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {organizationMembers.map(member => {
                                                const isSelected = project.members?.some(m => m.userId === member.userId) || false;
                                                const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                                                const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                                                return (
                                                    <button
                                                        key={member.userId}
                                                        onClick={() => handleToggleMember(member.userId)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left",
                                                            isSelected ? "bg-zinc-800" : "hover:bg-zinc-900"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border",
                                                                isSelected ? "bg-white text-black border-white" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                                            )}>
                                                                {member.initials}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={cn("text-sm", isSelected ? "text-white font-medium" : "text-zinc-400")}>{fullName}</span>
                                                                <span className="text-[10px] text-zinc-600">{member.email}</span>
                                                            </div>
                                                        </div>
                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-zinc-800/60" />
              
              {/* Mobile Tab Navigation */}
              <div className="md:hidden flex p-1 bg-zinc-900/50 rounded-xl m-4 border border-zinc-800">
                  {[
                      { id: 'todo', label: 'Do zrobienia' },
                      { id: 'in-progress', label: 'W toku' },
                      { id: 'done', label: 'Ukończone' }
                  ].map((tab) => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveMobileTab(tab.id as any)}
                          className={cn(
                              "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                              activeMobileTab === tab.id 
                                  ? "bg-zinc-800 text-white shadow-sm" 
                                  : "text-zinc-500 hover:text-zinc-300"
                          )}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>

              {/* Kanban Board */}
              <div className="flex-1 flex gap-1 overflow-x-auto p-2">
                  <div className={cn("flex-1 h-full min-w-full md:min-w-[300px]", activeMobileTab === 'todo' ? 'block' : 'hidden md:block')}>
                    <KanbanColumn 
                        title="Do zrobienia" 
                        tasks={tasksByStatus.todo} 
                        status="todo" 
                        handleDrop={handleDrop} 
                        handleDragOver={handleDragOver}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        draggedTaskId={draggedTaskId}
                        dragOverStatus={dragOverStatus}
                        setDragOverStatus={setDragOverStatus}
                        onTaskClick={handleTaskClick}
                        onAddTask={openAddTaskModal}
                        canCreateTasks={canCreateTasks}
                    />
                  </div>
                  
                  <div className={cn("flex-1 h-full min-w-full md:min-w-[300px]", activeMobileTab === 'in-progress' ? 'block' : 'hidden md:block')}>
                    <KanbanColumn 
                        title="W toku" 
                        tasks={tasksByStatus['in-progress']} 
                        status="in-progress" 
                        handleDrop={handleDrop} 
                        handleDragOver={handleDragOver}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        draggedTaskId={draggedTaskId}
                        dragOverStatus={dragOverStatus}
                        setDragOverStatus={setDragOverStatus}
                        onTaskClick={handleTaskClick}
                        onAddTask={openAddTaskModal}
                        canCreateTasks={canCreateTasks}
                    />
                  </div>

                  <div className={cn("flex-1 h-full min-w-full md:min-w-[300px]", activeMobileTab === 'done' ? 'block' : 'hidden md:block')}>
                    <KanbanColumn 
                        title="Ukończone" 
                        tasks={tasksByStatus.done} 
                        status="done" 
                        handleDrop={handleDrop} 
                        handleDragOver={handleDragOver}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        draggedTaskId={draggedTaskId}
                        dragOverStatus={dragOverStatus}
                        setDragOverStatus={setDragOverStatus}
                        onTaskClick={handleTaskClick}
                        onAddTask={openAddTaskModal}
                        canCreateTasks={canCreateTasks}
                    />
                  </div>
              </div>
            </main>

            {/* --- TASK DETAIL MODAL --- */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            if (hasUnsavedChanges) {
                                if (confirm('Masz niezapisane zmiany. Czy na pewno chcesz zamknąć bez zapisywania?')) {
                                    setSelectedTask(null);
                                    setHasUnsavedChanges(false);
                                }
                            } else {
                                setSelectedTask(null);
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-5xl h-[85vh] bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-start gap-4 shrink-0 bg-[#0A0A0A]">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="px-2.5 py-1 rounded-md bg-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                                            <Briefcase className="w-3 h-3" />
                                            {project.name}
                                        </div>
                                        
                                        {/* STATUS DROPDOWN */}
                                        <div className="relative">
                                            {(() => {
                                                const status = mapStatusToFrontend(selectedTask.status);
                                                return (
                                                    <button
                                                        onClick={() => canChangeStatus && setIsStatusOpen(!isStatusOpen)}
                                                        disabled={!canChangeStatus}
                                                        className={cn(
                                                            "px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1 transition-colors",
                                                            status === 'todo' ? "bg-zinc-500/10 text-zinc-400 border-zinc-700" :
                                                                status === 'in-progress' ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                                                            !canChangeStatus && "opacity-60 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {status === 'todo' ? 'Do zrobienia' : status === 'in-progress' ? 'W toku' : 'Ukończone'}
                                                        <ChevronDown className="w-3 h-3 opacity-70" />
                                                    </button>
                                                );
                                            })()}
                                            <AnimatePresence>
                                                {isStatusOpen && canChangeStatus && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                        className="absolute left-0 top-full mt-2 w-32 bg-[#111] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                                                    >
                                                        {[
                                                            { val: 'todo', label: 'Do zrobienia', style: 'text-zinc-400 hover:bg-zinc-800' },
                                                            { val: 'in-progress', label: 'W toku', style: 'text-blue-400 hover:bg-blue-500/10' },
                                                            { val: 'done', label: 'Ukończone', style: 'text-emerald-400 hover:bg-emerald-500/10' }
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.val}
                                                                onClick={() => {
                                                                    updateSelectedTask('status', opt.val);
                                                                    setIsStatusOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                                                                    opt.style,
                                                                    mapStatusToFrontend(selectedTask.status) === opt.val && "bg-zinc-800"
                                                                )}
                                                            >
                                                                {opt.label}
                                                                {mapStatusToFrontend(selectedTask.status) === opt.val && <Check className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Editable Title - Textarea for wrapping */}
                                    {canEditTasks ? (
                                        <div className="group w-full relative bg-[#111] border border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 rounded-2xl p-4 transition-all duration-200">
                                            <textarea 
                                                value={editingTaskTitle}
                                                onChange={(e) => {
                                                    setEditingTaskTitle(e.target.value);
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="text-lg md:text-2xl font-bold text-white bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full placeholder:text-zinc-700 resize-none overflow-hidden"
                                                placeholder="Tytuł zadania..."
                                                rows={1}
                                                style={{ minHeight: '32px' }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = 'auto';
                                                    target.style.height = `${target.scrollHeight}px`;
                                                }}
                                                ref={(textarea) => {
                                                    if (textarea) {
                                                        textarea.style.height = 'auto';
                                                        textarea.style.height = `${textarea.scrollHeight}px`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-lg md:text-2xl font-bold text-white">
                                            {selectedTask.title}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {canEditTasks && hasUnsavedChanges && (
                                        <Button 
                                            variant="default" 
                                            size="sm" 
                                            onClick={handleSaveTaskChanges}
                                            disabled={isLoading}
                                            className="bg-white text-black hover:bg-zinc-200"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Zapisz
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => {
                                            if (hasUnsavedChanges) {
                                                if (confirm('Masz niezapisane zmiany. Czy na pewno chcesz zamknąć bez zapisywania?')) {
                                                    setSelectedTask(null);
                                                    setHasUnsavedChanges(false);
                                                }
                                            } else {
                                                setSelectedTask(null);
                                            }
                                        }} 
                                        className="rounded-full hover:bg-zinc-900 w-10 h-10"
                                    >
                                    <X className="w-6 h-6 text-zinc-400" />
                                </Button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* LEFT COLUMN */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <AlignLeft className="w-4 h-4" /> Opis
                                        </h3>
                                        {canEditTasks ? (
                                            <div className="bg-zinc-900/30 rounded-xl p-1 border border-zinc-800/50 focus-within:border-zinc-700 focus-within:bg-zinc-900/50 transition-colors">
                                                <textarea
                                                    value={editingTaskDescription}
                                                    onChange={(e) => {
                                                        setEditingTaskDescription(e.target.value);
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    className="w-full bg-transparent border-none text-sm text-zinc-300 leading-relaxed p-4 min-h-[150px] resize-none focus:ring-0 focus:outline-none placeholder:text-zinc-600"
                                                    placeholder="Dodaj bardziej szczegółowy opis..."
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                                                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                    {selectedTask.description || 'Brak opisu'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Komentarze ({selectedTask.comments?.length || 0})
                                        </h3>
                                        <div className="space-y-6">
                                            {selectedTask.comments && selectedTask.comments.length > 0 ? (
                                                selectedTask.comments.map((comment: any) => {
                                                    const initials = comment.authorInitials || `${comment.authorName?.[0] || 'U'}`.toUpperCase();
                                                    const authorName = comment.authorName || 'Nieznany użytkownik';
                                                    const date = comment.createdAt ? new Date(comment.createdAt).toLocaleString('pl-PL') : '';
                                                    return (
                                                    <div key={comment.id} className="flex gap-4 group">
                                                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0 border border-zinc-700">
                                                                {initials}
                                                         </div>
                                                         <div className="flex-1 space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-zinc-200">{authorName}</span>
                                                                        <span className="text-xs text-zinc-600">{date}</span>
                                                                </div>
                                                                {(canEditTasks || comment.authorId === currentUser?.userId) && (
                                                                    <button 
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                                                                        title="Usuń komentarz"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-zinc-400 leading-normal">{comment.content}</p>
                                                         </div>
                                                    </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-sm text-zinc-600 italic pl-12">Brak komentarzy.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                             <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-zinc-600">Ty</div>
                                            <form 
                                                className="flex-1 relative"
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    const form = e.currentTarget;
                                                    const input = form.querySelector('input') as HTMLInputElement;
                                                    if (input && input.value.trim()) {
                                                        await handleSaveComment(input.value.trim());
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                 <input 
                                                    type="text" 
                                                    placeholder="Napisz komentarz..." 
                                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
                                                 />
                                                <button 
                                                    type="submit"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-all"
                                                >
                                                     <Send className="w-4 h-4" />
                                                 </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="w-full md:w-80 border-l border-zinc-800 bg-[#0C0C0C] p-8 space-y-8 overflow-y-auto">
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Detale</span>
                                            <div className="bg-zinc-900/50 rounded-xl p-4 space-y-4 border border-zinc-800/50">
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                        <Flag className="w-4 h-4" /> <span>Priorytet</span>
                                                    </div>
                                                    {canEditTasks ? (
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                                                                className={cn(
                                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border",
                                                                    (() => {
                                                                        const priority = mapPriorityToFrontend(selectedTask.priority);
                                                                        return priority === 'high' ? "text-red-400 bg-red-400/10 border-red-400/20" :
                                                                            priority === 'medium' ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                                                                            "text-zinc-400 bg-zinc-800/50 border-zinc-700";
                                                                    })()
                                                                )}
                                                            >
                                                                {(() => {
                                                                    const priority = mapPriorityToFrontend(selectedTask.priority);
                                                                    return priority === 'high' ? 'Wysoki' : priority === 'medium' ? 'Średni' : 'Niski';
                                                                })()}
                                                                <ChevronDown className="w-3 h-3 opacity-70" />
                                                            </button>
                                                            <AnimatePresence>
                                                                {isPriorityOpen && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 5 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: 5 }}
                                                                        className="absolute right-0 top-full mt-2 w-32 bg-[#111] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                                                                    >
                                                                        {[
                                                                            { val: 'low', label: 'Niski', style: 'text-zinc-400' },
                                                                            { val: 'medium', label: 'Średni', style: 'text-orange-400' },
                                                                            { val: 'high', label: 'Wysoki', style: 'text-red-400' }
                                                                        ].map(opt => (
                                                                            <button
                                                                                key={opt.val}
                                                                                onClick={async () => { 
                                                                                    await updateSelectedTask('priority', opt.val); 
                                                                                    setIsPriorityOpen(false); 
                                                                                }}
                                                                                className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-zinc-800", opt.style)}
                                                                            >
                                                                                {opt.label}
                                                                            </button>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ) : (
                                                        <div className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-bold uppercase",
                                                            (() => {
                                                                const priority = mapPriorityToFrontend(selectedTask.priority);
                                                                return priority === 'high' ? "text-red-400 bg-red-400/10 border border-red-400/20" :
                                                                    priority === 'medium' ? "text-orange-400 bg-orange-400/10 border border-orange-400/20" :
                                                                    "text-zinc-400 bg-zinc-800/50 border border-zinc-700";
                                                            })()
                                                        )}>
                                                            {(() => {
                                                                const priority = mapPriorityToFrontend(selectedTask.priority);
                                                                return priority === 'high' ? 'Wysoki' : priority === 'medium' ? 'Średni' : 'Niski';
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                        <Calendar className="w-4 h-4" /> <span>Termin</span>
                                                    </div>
                                                    {canEditTasks ? (
                                                        <input
                                                            type="date"
                                                            value={selectedTask.dueDate}
                                                            onChange={(e) => updateSelectedTask('dueDate', e.target.value)}
                                                            className="bg-transparent text-sm font-medium text-white focus:outline-none text-right w-[110px] [color-scheme:dark] cursor-pointer"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium text-white">
                                                            {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('pl-PL') : 'Brak terminu'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Zespół</span>
                                                <div className="relative">
                                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                                                        <Plus className="w-4 h-4 text-zinc-400" />
                                                    </button>
                                                    <AnimatePresence>
                                                        {isUserMenuOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 5 }}
                                                                className="absolute right-0 top-6 w-56 bg-[#111] border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                                                            >
                                                                {project.members && project.members.length > 0 ? (
                                                                    project.members.map((member) => {
                                                                        const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                                                                        const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                                                                        const isAssigned = selectedTask.assignees?.some((a: any) => {
                                                                            if (typeof a === 'string') {
                                                                                // If assignee is initials string, check if it matches
                                                                                return a === initials;
                                                                            } else if (a?.userId) {
                                                                                // If assignee is object with userId
                                                                                return a.userId === member.userId;
                                                                            }
                                                                            return false;
                                                                        });
                                                                    return (
                                                                        <button
                                                                                key={member.userId}
                                                                                onClick={() => handleToggleAssignee(member.userId)}
                                                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-300">{initials}</div>
                                                                                <span className={cn("text-sm", isAssigned ? "text-white" : "text-zinc-400")}>{fullName}</span>
                                                                            </div>
                                                                            {isAssigned && <Check className="w-3 h-3 text-green-500" />}
                                                                        </button>
                                                                    );
                                                                })
                                                                ) : (
                                                                    <div className="px-3 py-2 text-xs text-zinc-500 text-center">
                                                                        Brak członków w projekcie
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                                                    selectedTask.assignees.map((assignee: any) => {
                                                        // Handle both TaskAssigneeDto objects and string initials
                                                        const userId = assignee.userId || (typeof assignee === 'string' ? null : assignee);
                                                        const initials = typeof assignee === 'string' 
                                                            ? assignee 
                                                            : (assignee.initials || `${assignee.firstName?.[0] || ''}${assignee.lastName?.[0] || ''}`.toUpperCase() || assignee.email[0].toUpperCase());
                                                        const fullName = typeof assignee === 'string'
                                                            ? (organizationMembers.find(m => m.initials === assignee)?.firstName || assignee)
                                                            : (`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || assignee.email);
                                                        
                                                        return (
                                                            <div key={userId || initials} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full pl-1 pr-3 py-1">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">{initials}</div>
                                                                <span className="text-xs text-zinc-300">{fullName}</span>
                                                                <button onClick={() => handleToggleAssignee(userId || initials)} className="ml-1 text-zinc-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-xs text-zinc-500">Brak przypisanych osób</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- ADD TASK MODAL --- */}
            <AnimatePresence>
                {isAddTaskModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsAddTaskModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Nowe Zadanie</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsAddTaskModalOpen(false)} className="rounded-full hover:bg-zinc-900">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </Button>
                            </div>
                            
                            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Tytuł Zadania <span className="text-red-500">*</span></label>
                                    <Input 
                                        value={newTaskData.title}
                                        onChange={(e) => {
                                            setNewTaskData({...newTaskData, title: e.target.value});
                                            setTaskFormErrors({...taskFormErrors, title: undefined});
                                        }}
                                        placeholder="Co trzeba zrobić?"
                                        className="bg-[#111]"
                                        autoFocus
                                    />
                                    {taskFormErrors.title && (
                                        <p className="text-xs text-red-400 ml-1">{taskFormErrors.title}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Opis</label>
                                    <textarea 
                                        value={newTaskData.description}
                                        onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                                        rows={3}
                                        placeholder="Dodatkowe informacje..."
                                        className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-400 ml-1">Priorytet</label>
                                        <div className="flex gap-1 bg-[#111] p-1 rounded-xl border border-zinc-800">
                                            {['low', 'medium', 'high'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setNewTaskData({...newTaskData, priority: p as 'low' | 'medium' | 'high'})}
                                                    className={cn(
                                                        "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex justify-center items-center",
                                                        newTaskData.priority === p
                                                            ? p === 'high' ? "bg-red-500/20 text-red-400 shadow-sm" 
                                                              : p === 'medium' ? "bg-orange-500/20 text-orange-400 shadow-sm" 
                                                              : "bg-zinc-700 text-zinc-300 shadow-sm"
                                                            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                                                    )}
                                                >
                                                    <Flag className="w-3 h-3" />
                                                </button>
                                                ))}
                                            </div>
                                        </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-400 ml-1">Termin</label>
                                        <input
                                            type="date"
                                            value={newTaskData.dueDate}
                                            onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
                                            className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Przypisz do</label>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {project.members && project.members.length > 0 ? (
                                            project.members.map((member) => {
                                                const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                                                const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                                                const isSelected = newTaskData.assigneeIds.includes(member.userId);
                                                return (
                                                    <button
                                                        key={member.userId}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setNewTaskData({
                                                                    ...newTaskData,
                                                                    assigneeIds: newTaskData.assigneeIds.filter(id => id !== member.userId)
                                                                });
                                                            } else {
                                                                setNewTaskData({
                                                                    ...newTaskData,
                                                                    assigneeIds: [...newTaskData.assigneeIds, member.userId]
                                                                });
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                                                            isSelected ? "bg-zinc-800" : "hover:bg-zinc-900"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                                            isSelected ? "bg-white text-black border-white" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                                        )}>
                                                            {initials}
                            </div>
                                                        <span className={cn("text-sm", isSelected ? "text-white font-medium" : "text-zinc-400")}>
                                                            {fullName}
                                                        </span>
                                                        {isSelected && <Check className="w-3 h-3 text-white ml-auto" />}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-zinc-500 text-center py-2">Brak członków w projekcie</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        onClick={() => setIsAddTaskModalOpen(false)}
                                        className="flex-1 rounded-xl"
                                    >
                                        Anuluj
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="flex-1 rounded-xl bg-white text-black hover:bg-zinc-200"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Utwórz
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PROJECT EDIT MODAL --- */}
            <AnimatePresence>
                {isEditProjectOpen && editProjectData && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsEditProjectOpen(false)}
                    >
                         <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold text-white">Edytuj Projekt</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditProjectOpen(false)} className="rounded-full hover:bg-zinc-900">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto p-6 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Nazwa Projektu</label>
                                    <Input 
                                        value={editProjectData.name}
                                        onChange={(e) => setEditProjectData({...editProjectData, name: e.target.value})}
                                        className="bg-[#111]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Opis</label>
                                    <textarea 
                                        value={editProjectData.description}
                                        onChange={(e) => setEditProjectData({...editProjectData, description: e.target.value})}
                                        rows={4}
                                        className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-400 ml-1">Termin</label>
                                        <input 
                                            type="date"
                                            value={editProjectData.dueDate || ''}
                                            onChange={(e) => setEditProjectData({...editProjectData, dueDate: e.target.value})}
                                            className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-400 ml-1">Kolor Motywu</label>
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
                                                    onClick={() => setEditProjectData({...editProjectData, theme: themeOption.value})}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                        themeOption.color,
                                                        editProjectData.theme === themeOption.value 
                                                            ? "ring-2 ring-offset-2 ring-offset-[#0A0A0A] ring-white" 
                                                            : "ring-transparent"
                                                    )}
                                                    title={themeOption.label}
                                                >
                                                    {editProjectData.theme === themeOption.value && (
                                                        <Check className="w-4 h-4 text-black" />
                                                    )}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Status</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditProjectData({...editProjectData, status: 'Active'})}
                                            className={cn(
                                                "flex-1 py-2 rounded-xl text-sm font-medium transition-all border",
                                                (editProjectData.status === 'Active' || editProjectData.status === 'active')
                                                    ? "bg-white text-black border-white" 
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                                            )}
                                        >
                                            Aktywny
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditProjectData({...editProjectData, status: 'Inactive'})}
                                            className={cn(
                                                "flex-1 py-2 rounded-xl text-sm font-medium transition-all border",
                                                (editProjectData.status === 'Inactive' || editProjectData.status === 'inactive')
                                                    ? "bg-white text-black border-white" 
                                                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
                                            )}
                                        >
                                            Archiwum
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Zespół Projektowy</label>
                                    <div className="bg-[#111] border border-zinc-800 rounded-xl p-3 max-h-48 overflow-y-auto">
                                        <div className="space-y-1">
                                            {organizationMembers.map(member => {
                                                const isSelected = editProjectData.memberIds?.includes(member.userId) || false;
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
                                                                {initials}
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
                                        {editProjectData.teamLeaderId ? (
                                            <div className="flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-amber-500" />
                                                {(() => {
                                                  const leader = organizationMembers.find(m => m.userId === editProjectData.teamLeaderId);
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
                                                {editProjectData.memberIds && editProjectData.memberIds.length > 0 ? (
                                                    organizationMembers
                                                        .filter(m => editProjectData.memberIds?.includes(m.userId))
                                                        .map(member => {
                                                          const initials = member.initials || `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase() || member.email[0].toUpperCase();
                                                          const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                                                          return (
                                                            <button
                                                                key={member.userId}
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditProjectData({ ...editProjectData, teamLeaderId: member.userId });
                                                                    setIsLeaderOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left mb-0.5",
                                                                    editProjectData.teamLeaderId === member.userId ? "bg-zinc-800" : "hover:bg-zinc-900"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-700">
                                                                        {initials}
                                                                    </div>
                                                                    <span className={cn("text-sm", editProjectData.teamLeaderId === member.userId ? "text-white font-medium" : "text-zinc-400")}>
                                                                        {fullName}
                                                                    </span>
                                                                </div>
                                                                {editProjectData.teamLeaderId === member.userId && <Check className="w-4 h-4 text-amber-500" />}
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
                                
                                <Button 
                                    onClick={saveProject} 
                                    className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-12"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                    Zapisz Zmiany
                                        </>
                                    )}
                                </Button>
                            </div>
                         </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectDetailPage;
