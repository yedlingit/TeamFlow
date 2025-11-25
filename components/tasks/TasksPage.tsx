
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Briefcase,
  X,
  Save,
  Calendar,
  Flag,
  Layers,
  AlignLeft,
  User,
  Send,
  Trash2,
  Users,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { taskService, projectService, authService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import { useToast } from '../../contexts/ToastContext';
import type { TaskDto, TaskDetailDto, UserDto } from '../../api/types';

// --- MOCK DATA ---
const rawTasks = [
  { id: 1, title: "Zaprojektować Landing Page", project: "TeamFlow MVP", status: 'in-progress', priority: 'high', dueDate: '2024-08-15', comments: 2, attachments: 2, assignees: ['JK'] },
  { id: 2, title: "Konfiguracja CI/CD", project: "Migracja API", status: 'todo', priority: 'medium', dueDate: '2024-08-20', comments: 0, attachments: 0, assignees: ['PD', 'KS'] },
  { id: 3, title: "Analiza konkurencji", project: "Marketing Q3", status: 'done', priority: 'low', dueDate: '2024-08-10', comments: 5, attachments: 1, assignees: ['AW'] },
  { id: 4, title: "Refaktoryzacja autoryzacji", project: "TeamFlow MVP", status: 'todo', priority: 'high', dueDate: '2024-08-18', comments: 1, attachments: 0, assignees: [] },
  { id: 5, title: "Makiety aplikacji mobilnej", project: "Aplikacja Mobilna", status: 'in-progress', priority: 'high', dueDate: '2024-09-01', comments: 8, attachments: 4, assignees: ['JK', 'TS'] },
  { id: 6, title: "Przygotowanie prezentacji dla zarządu", project: "Narzędzia Wewnętrzne", status: 'todo', priority: 'medium', dueDate: '2024-08-25', comments: 0, attachments: 1, assignees: ['MB'] },
  { id: 7, title: "Optymalizacja zapytań SQL", project: "Migracja API", status: 'done', priority: 'high', dueDate: '2024-08-05', comments: 2, attachments: 0, assignees: ['KS'] },
];

const initialTasks = rawTasks.map(t => ({
    ...t,
    description: "To jest przykładowy opis zadania. W tym miejscu znajdować się będą szczegółowe informacje dotyczące wymagań, specyfikacji technicznej oraz kryteriów akceptacji. Opis ten pomaga zespołowi zrozumieć kontekst i cel zadania.",
    commentsList: Array.from({ length: t.comments || 0 }, (_, i) => ({
        id: i,
        user: i % 2 === 0 ? "Jan Kowalski" : "Anna Nowak",
        initials: i % 2 === 0 ? "JK" : "AN",
        content: i % 2 === 0 ? "Wygląda to obiecująco, ale musimy dopracować detale sekcji Hero." : "Przesyłam zaktualizowane pliki do weryfikacji na Drive.",
        date: i === 0 ? "2 godz. temu" : "1 dzień temu"
    }))
}));

// Mock Project Teams for Assignment
const mockProjectTeams: Record<string, { initials: string, name: string }[]> = {
    "TeamFlow MVP": [
        { initials: "JK", name: "Jan Kowalski" },
        { initials: "AW", name: "Anna Wiśniewska" },
        { initials: "MB", name: "Marek Nowak" }
    ],
    "Migracja API": [
        { initials: "PD", name: "Piotr Dąbrowski" },
        { initials: "KS", name: "Katarzyna Szymańska" }
    ],
    "Aplikacja Mobilna": [
        { initials: "JK", name: "Jan Kowalski" },
        { initials: "TS", name: "Tomasz Szymański" },
        { initials: "DO", name: "Dorota Olszewska" }
    ],
    "Marketing Q3": [
        { initials: "AW", name: "Anna Wiśniewska" }
    ],
    "Narzędzia Wewnętrzne": [
        { initials: "MB", name: "Marek Nowak" },
        { initials: "KS", name: "Katarzyna Szymańska" }
    ]
};

// Helper functions for status mapping
const mapApiStatusToFrontend = (status: 'ToDo' | 'InProgress' | 'Done'): 'todo' | 'in-progress' | 'done' => {
  switch (status) {
    case 'ToDo': return 'todo';
    case 'InProgress': return 'in-progress';
    case 'Done': return 'done';
  }
};

const mapFrontendStatusToApi = (status: 'todo' | 'in-progress' | 'done'): 'ToDo' | 'InProgress' | 'Done' => {
  switch (status) {
    case 'todo': return 'ToDo';
    case 'in-progress': return 'InProgress';
    case 'done': return 'Done';
  }
};

// Helper priority weight for sorting
const getPriorityWeight = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

interface TaskCardProps {
  task: TaskDto;
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
        priorityColors[task.priority as keyof typeof priorityColors]
      )}
    >
      {/* Project Tag */}
      {task.projectName && (
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-medium text-zinc-400 flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {task.projectName}
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-2 mb-3">
        <h4 className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 text-zinc-500">
             {/* Assignees Avatars (Mini) */}
            {task.assignees && task.assignees.length > 0 && (
                <div className="flex -space-x-2">
                    {task.assignees.slice(0, 3).map((assignee, i) => {
                      const initials = assignee.initials || 
                        `${assignee.firstName?.[0] || ''}${assignee.lastName?.[0] || ''}`.toUpperCase() || 
                        assignee.email[0].toUpperCase();
                      return (
                        <div key={assignee.userId} className="w-5 h-5 rounded-full bg-zinc-700 border border-[#121212] flex items-center justify-center text-[8px] font-bold text-zinc-300" title={`${assignee.firstName} ${assignee.lastName}`}>
                          {initials}
                        </div>
                      );
                    })}
                    {task.assignees.length > 3 && (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-[#121212] flex items-center justify-center text-[8px] font-medium text-zinc-400">
                            +{task.assignees.length - 3}
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
              (task.priority === 'High' || task.priority === 'high') ? "text-red-400" : "text-zinc-400"
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
  className
}: any) => {
  const isDraggingOver = dragOverStatus === status;
  
  // Map API status to frontend status for display
  const frontendStatus = status === 'ToDo' ? 'todo' : status === 'InProgress' ? 'in-progress' : 'done';
  
  const statusConfig = {
      todo: { label: 'Do zrobienia', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-700' },
      'in-progress': { label: 'W toku', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      done: { label: 'Ukończone', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
  };

  const config = statusConfig[frontendStatus as keyof typeof statusConfig];

  return (
    <div 
        className={cn(
            "flex flex-col h-full rounded-2xl bg-[#0A0A0A] border transition-colors duration-200",
            isDraggingOver ? "border-white/20 bg-zinc-900/20" : "border-zinc-800/40",
            className
        )}
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
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-3 overflow-y-auto min-h-[150px]">
        <motion.div 
          className="space-y-3" 
          layout // Layout prop on container helps with list transitions
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map((task: any) => (
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

const TasksPage = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const { success } = useToast();
  
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'todo' | 'in-progress' | 'done'>('todo');
  
  // Check if user can create tasks (TeamLeader or Administrator)
  const canCreateTasks = currentUser?.role === 'TeamLeader' || currentUser?.role === 'Administrator';
  
  // Load current user, tasks and projects
  useEffect(() => {
    loadCurrentUser();
    loadTasks();
    loadProjects();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getMe();
      setCurrentUser(user);
    } catch (err) {
      // Silent fail
    }
  };

  const loadTasks = async () => {
    startLoading();
    try {
      const result = await taskService.getTasks({
        page: 1,
        pageSize: 100,
        sortBy: 'dueDate',
        sortOrder: 'asc',
      });
      setTasks(result.items);
    } catch (err) {
      handleApiError(err);
    } finally {
      stopLoading();
    }
  };

  const loadProjects = async () => {
    try {
      const result = await projectService.getProjects({
        status: 'Active',
        page: 1,
        pageSize: 100,
      });
      setProjects(result.items);
    } catch (err) {
      // Silent fail
    }
  };

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState('todo');
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    project: 'TeamFlow MVP',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [formErrors, setFormErrors] = useState<{title?: string}>({});

  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState<typeof initialTasks[0] | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false); // Add state for priority dropdown
  const [isStatusOpen, setIsStatusOpen] = useState(false); // Add state for status dropdown

  // Drag & Drop Handlers
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
      setTasks(current => 
        current.map(t => t.id === draggedTaskId ? { ...t, status: apiStatus } : t)
      );
      success('Status zadania zaktualizowany');
    } catch (err) {
      handleApiError(err, 'Nie udało się zaktualizować statusu zadania');
      // Reload tasks on error
      loadTasks();
    }
    
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  // Add Task Handlers
  const openAddTaskModal = (status: string = 'todo') => {
    setTargetColumn(status);
    setNewTaskData({
        title: '',
        project: 'TeamFlow MVP',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsAddTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newTaskData.title || newTaskData.title.trim().length < 3) {
        setFormErrors({ title: "Tytuł zadania musi mieć co najmniej 3 znaki." });
        return;
    }

    // Find project ID by name
    const selectedProject = projects.find(p => p.name === newTaskData.project);
    if (!selectedProject) {
      setFormErrors({ title: "Wybierz projekt" });
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

      const newTask = await taskService.create({
        title: newTaskData.title,
        projectId: selectedProject.id,
        priority: priorityMap[newTaskData.priority] || 'Medium',
        dueDate: newTaskData.dueDate || undefined,
      });

      setTasks(prev => [newTask, ...prev]);
      setIsAddTaskModalOpen(false);
      setFormErrors({});
      success('Zadanie zostało utworzone');
    } catch (err) {
      handleApiError(err, 'Nie udało się utworzyć zadania');
    } finally {
      stopLoading();
    }
  };

  const handleTaskClick = (task: typeof initialTasks[0]) => {
      setSelectedTask(JSON.parse(JSON.stringify(task))); // Deep copy to allow independent editing
      setIsPriorityOpen(false); // Reset dropdown
      setIsUserMenuOpen(false); // Reset dropdown
      setIsStatusOpen(false); // Reset dropdown
  };

  // Detail Modal Helpers
  const updateSelectedTask = (field: keyof typeof initialTasks[0], value: any) => {
      if (!selectedTask) return;
      const updated = { ...selectedTask, [field]: value };
      setSelectedTask(updated);
      // Immediately sync with main state for live update feel
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
  };

  const handleDeleteComment = (commentId: number) => {
      if (!selectedTask) return;
      const updatedComments = selectedTask.commentsList.filter(c => c.id !== commentId);
      const updatedTask = { ...selectedTask, commentsList: updatedComments, comments: updatedComments.length };
      setSelectedTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
  };

  const handleToggleAssignee = (initials: string) => {
      if (!selectedTask) return;
      let newAssignees = [...(selectedTask.assignees || [])];
      if (newAssignees.includes(initials)) {
          newAssignees = newAssignees.filter(a => a !== initials);
      } else {
          newAssignees.push(initials);
      }
      updateSelectedTask('assignees', newAssignees);
  };


  // Sorting Logic Only (Filtering removed)
  const processedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const weightA = getPriorityWeight(a.priority);
      const weightB = getPriorityWeight(b.priority);
      return weightB - weightA; // Descending order
    });
  }, [tasks]);

  const tasksByStatus = {
    todo: processedTasks.filter(t => t.status === 'ToDo'),
    'in-progress': processedTasks.filter(t => t.status === 'InProgress'),
    done: processedTasks.filter(t => t.status === 'Done'),
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[calc(100vh-6rem)] flex flex-col"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Zadania
            <span className="text-lg font-normal text-zinc-500 bg-zinc-900 px-3 py-0.5 rounded-full border border-zinc-800">
                {tasks.length}
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Globalna tablica wszystkich Twoich zadań we wszystkich projektach.
          </p>
        </div>

        {canCreateTasks && (
          <div className="flex items-center gap-3">
            <Button 
                className="bg-white text-black hover:bg-zinc-200 h-10 w-full md:w-auto"
                onClick={() => openAddTaskModal('todo')}
            >
                <Plus className="w-4 h-4 mr-2" />
                Nowe Zadanie
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex p-1 bg-zinc-900/50 rounded-xl mb-4 border border-zinc-800">
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
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex md:gap-4 h-full min-w-full pb-4">
            {/* Render ALL columns on desktop, but only ACTIVE column on mobile */}
            <div className={cn("flex-1 h-full min-w-full md:min-w-[320px]", activeMobileTab === 'todo' ? 'block' : 'hidden md:block')}>
                <KanbanColumn 
                    title="Do zrobienia" 
                    status="ToDo" 
                    tasks={tasksByStatus.todo}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    draggedTaskId={draggedTaskId}
                    dragOverStatus={dragOverStatus}
                    setDragOverStatus={setDragOverStatus}
                    onTaskClick={handleTaskClick}
                />
            </div>
            
            <div className={cn("flex-1 h-full min-w-full md:min-w-[320px]", activeMobileTab === 'in-progress' ? 'block' : 'hidden md:block')}>
                <KanbanColumn 
                    title="W toku" 
                    status="InProgress" 
                    tasks={tasksByStatus['in-progress']}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    draggedTaskId={draggedTaskId}
                    dragOverStatus={dragOverStatus}
                    setDragOverStatus={setDragOverStatus}
                    onTaskClick={handleTaskClick}
                />
            </div>

            <div className={cn("flex-1 h-full min-w-full md:min-w-[320px]", activeMobileTab === 'done' ? 'block' : 'hidden md:block')}>
                 <KanbanColumn 
                    title="Ukończone" 
                    status="Done" 
                    tasks={tasksByStatus.done}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    draggedTaskId={draggedTaskId}
                    dragOverStatus={dragOverStatus}
                    setDragOverStatus={setDragOverStatus}
                    onTaskClick={handleTaskClick}
                />
            </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddTaskModalOpen && (
            <>
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
                                        setFormErrors({...formErrors, title: undefined});
                                    }}
                                    placeholder="Co trzeba zrobić?"
                                    className="bg-[#111]"
                                    autoFocus
                                    error={formErrors.title}
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Projekt</label>
                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <select 
                                        value={newTaskData.project}
                                        onChange={(e) => setNewTaskData({...newTaskData, project: e.target.value})}
                                        className="flex w-full rounded-xl border border-zinc-800 bg-[#111] pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 appearance-none"
                                    >
                                        {Object.keys(mockProjectTeams).map(proj => (
                                            <option key={proj} value={proj}>{proj}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-400 ml-1">Priorytet</label>
                                    <div className="flex gap-1 bg-[#111] p-1 rounded-xl border border-zinc-800">
                                        {['low', 'medium', 'high'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setNewTaskData({...newTaskData, priority: p})}
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
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <input 
                                            type="date"
                                            value={newTaskData.dueDate}
                                            onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
                                            className="flex w-full rounded-xl border border-zinc-800 bg-[#111] pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsAddTaskModalOpen(false)} className="flex-1 rounded-xl hover:bg-zinc-900">
                                    Anuluj
                                </Button>
                                <Button type="submit" className="flex-1 rounded-xl bg-white text-black hover:bg-zinc-200">
                                    <Save className="w-4 h-4 mr-2" />
                                    Dodaj Zadanie
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
            <>
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedTask(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        // CHANGED: Increased max-width and fixed height for a "Workspace" feel
                        className="w-full max-w-5xl h-[85vh] bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                         {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-start gap-4 shrink-0 bg-[#0A0A0A]">
                            <div className="w-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="px-2.5 py-1 rounded-md bg-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                                        <Briefcase className="w-3 h-3" />
                                        {selectedTask.project}
                                    </div>
                                    
                                    {/* STATUS DROPDOWN */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1 transition-colors hover:opacity-80",
                                                selectedTask.status === 'todo' ? "bg-zinc-500/10 text-zinc-400 border-zinc-700" :
                                                selectedTask.status === 'in-progress' ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                            )}
                                        >
                                            {selectedTask.status === 'todo' ? 'Do zrobienia' : selectedTask.status === 'in-progress' ? 'W toku' : 'Ukończone'}
                                            <ChevronDown className="w-3 h-3 opacity-70" />
                                        </button>
                                        <AnimatePresence>
                                            {isStatusOpen && (
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
                                                                selectedTask.status === opt.val && "bg-zinc-800"
                                                            )}
                                                        >
                                                            {opt.label}
                                                            {selectedTask.status === opt.val && <Check className="w-3 h-3" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Editable Title - Changed to Textarea for wrapping */}
                                <div className="group w-full relative bg-[#111] border border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 rounded-2xl p-4 transition-all duration-200">
                                    <textarea 
                                        value={selectedTask.title}
                                        onChange={(e) => updateSelectedTask('title', e.target.value)}
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
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)} className="rounded-full hover:bg-zinc-900 shrink-0 w-10 h-10">
                                    <X className="w-6 h-6 text-zinc-400" />
                                </Button>
                            </div>
                        </div>

                         {/* Modal Content - Split View */}
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            
                            {/* LEFT COLUMN: Main Content (Description, Comments) */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Editable Description */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4" />
                                        Opis
                                    </h3>
                                    <div className="bg-zinc-900/30 rounded-xl p-1 border border-zinc-800/50 focus-within:border-zinc-700 focus-within:bg-zinc-900/50 transition-colors">
                                        <textarea
                                            value={selectedTask.description}
                                            onChange={(e) => updateSelectedTask('description', e.target.value)}
                                            className="w-full bg-transparent border-none text-sm text-zinc-300 leading-relaxed p-4 min-h-[150px] resize-none focus:ring-0 focus:outline-none placeholder:text-zinc-600"
                                            placeholder="Dodaj bardziej szczegółowy opis..."
                                        />
                                    </div>
                                </div>

                                 {/* Comments */}
                                 <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Komentarze ({selectedTask.commentsList.length})
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        {selectedTask.commentsList.length > 0 ? (
                                            selectedTask.commentsList.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-4 group">
                                                     <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0 border border-zinc-700">
                                                        {comment.initials}
                                                     </div>
                                                     <div className="flex-1 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-zinc-200">{comment.user}</span>
                                                                <span className="text-xs text-zinc-600">{comment.date}</span>
                                                            </div>
                                                            {/* Delete Comment Button */}
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                                                                title="Usuń komentarz"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-zinc-400 leading-normal">{comment.content}</p>
                                                     </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-zinc-600 italic pl-12">Brak komentarzy. Rozpocznij dyskusję.</p>
                                        )}
                                    </div>

                                    {/* Add Comment Input */}
                                    <div className="flex gap-4 pt-4">
                                         <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-zinc-600">
                                            Ty
                                         </div>
                                         <div className="flex-1 relative">
                                             <input 
                                                type="text" 
                                                placeholder="Napisz komentarz..." 
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
                                             />
                                             <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-all">
                                                 <Send className="w-4 h-4" />
                                             </button>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Sidebar (Metadata, Actions) */}
                            <div className="w-full md:w-80 border-l border-zinc-800 bg-[#0C0C0C] p-8 space-y-8 overflow-y-auto">
                                
                                {/* Status & Meta */}
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Detale</span>
                                        <div className="bg-zinc-900/50 rounded-xl p-4 space-y-4 border border-zinc-800/50">
                                            
                                            {/* Editable Priority - Custom Dropdown */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Flag className="w-4 h-4" />
                                                    <span>Priorytet</span>
                                                </div>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border",
                                                            selectedTask.priority === 'high' ? "text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20" :
                                                            selectedTask.priority === 'medium' ? "text-orange-400 bg-orange-400/10 border-orange-400/20 hover:bg-orange-400/20" :
                                                            "text-zinc-400 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800"
                                                        )}
                                                    >
                                                        {selectedTask.priority === 'high' ? 'Wysoki' :
                                                         selectedTask.priority === 'medium' ? 'Średni' : 'Niski'}
                                                        <ChevronDown className="w-3 h-3 opacity-70" />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isPriorityOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                                className="absolute right-0 top-full mt-2 w-32 bg-[#111] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                                                            >
                                                                {[
                                                                    { val: 'low', label: 'Niski', style: 'text-zinc-400 hover:bg-zinc-800' },
                                                                    { val: 'medium', label: 'Średni', style: 'text-orange-400 hover:bg-orange-500/10' },
                                                                    { val: 'high', label: 'Wysoki', style: 'text-red-400 hover:bg-red-500/10' }
                                                                ].map(opt => (
                                                                    <button
                                                                        key={opt.val}
                                                                        onClick={() => {
                                                                            updateSelectedTask('priority', opt.val);
                                                                            setIsPriorityOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors",
                                                                            opt.style,
                                                                            selectedTask.priority === opt.val && "bg-zinc-800"
                                                                        )}
                                                                    >
                                                                        {opt.label}
                                                                        {selectedTask.priority === opt.val && <Check className="w-3 h-3" />}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Editable Due Date */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Termin</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={selectedTask.dueDate}
                                                        onChange={(e) => updateSelectedTask('dueDate', e.target.value)}
                                                        className="bg-transparent text-sm font-medium text-white focus:outline-none text-right w-[110px] [color-scheme:dark] cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Team Assignment Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Zespół</span>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                                    className="p-1 hover:bg-zinc-800 rounded transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 text-zinc-400" />
                                                </button>
                                                
                                                {/* Add User Dropdown */}
                                                <AnimatePresence>
                                                    {isUserMenuOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                            className="absolute right-0 top-6 w-56 bg-[#111] border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                                                        >
                                                            <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 py-2">Dodaj do zadania</div>
                                                            {mockProjectTeams[selectedTask.project]?.map((user) => {
                                                                const isAssigned = selectedTask.assignees?.includes(user.initials);
                                                                return (
                                                                    <button
                                                                        key={user.initials}
                                                                        onClick={() => handleToggleAssignee(user.initials)}
                                                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-lg transition-colors text-left group"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                                                                                {user.initials}
                                                                            </div>
                                                                            <span className={cn("text-sm", isAssigned ? "text-white font-medium" : "text-zinc-400")}>
                                                                                {user.name}
                                                                            </span>
                                                                        </div>
                                                                        {isAssigned && <Check className="w-3 h-3 text-green-500" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                                                selectedTask.assignees.map((initials: string) => (
                                                    <div key={initials} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full pl-1 pr-3 py-1">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                            {initials}
                                                        </div>
                                                        <span className="text-xs text-zinc-300">
                                                            {/* Find full name from mock data for better display, fallback to initials */}
                                                            {Object.values(mockProjectTeams).flat().find(u => u.initials === initials)?.name.split(' ')[0] || initials}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleToggleAssignee(initials)}
                                                            className="ml-1 text-zinc-500 hover:text-red-400"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-zinc-600 italic">Brak przypisanych osób.</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TasksPage;
