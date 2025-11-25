
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

// --- MOCK DATA ---
// W prawdziwej aplikacji te dane pochodziłyby z API
const allTasks = [
    // Project 1
    { id: 101, projectId: 1, title: "Zaprojektować interfejs użytkownika", status: 'done', priority: 'high', assignee: 'JK', dueDate: '2024-08-20' },
    { id: 102, projectId: 1, title: "Stworzyć komponenty w React", status: 'in-progress', priority: 'high', assignee: 'AW', dueDate: '2024-08-22' },
    { id: 103, projectId: 1, title: "Napisać testy jednostkowe", status: 'todo', priority: 'medium', assignee: 'MB', dueDate: '2024-08-25' },
    { id: 104, projectId: 1, title: "Wdrożyć na serwer deweloperski", status: 'todo', priority: 'low', assignee: 'JK', dueDate: '2024-08-28' },
    // Project 2
    { id: 201, projectId: 2, title: "Zmapować stare endpointy", status: 'done', priority: 'high', assignee: 'PD', dueDate: '2024-09-01' },
    { id: 202, projectId: 2, title: "Napisać nowe kontrolery .NET 9", status: 'in-progress', priority: 'high', assignee: 'KS', dueDate: '2024-09-05' },
    { id: 203, projectId: 2, title: "Skonfigurować autoryzację JWT", status: 'in-progress', priority: 'medium', assignee: 'PD', dueDate: '2024-09-10' },
    // Project 3
    { id: 301, projectId: 3, title: "Badanie rynku i konkurencji", status: 'done', priority: 'low', assignee: 'TS', dueDate: '2024-11-01' },
    { id: 302, projectId: 3, title: "Przygotować makiety w Figma", status: 'todo', priority: 'high', assignee: 'JK', dueDate: '2024-11-05' },
];

const projectsData = [
    { id: 1, name: "TeamFlow MVP", description: "Rozwój kluczowych funkcjonalności aplikacji, w tym modułów do zarządzania zadaniami, projektami oraz uwierzytelniania użytkowników. Celem jest dostarczenie stabilnej wersji beta do wewnętrznych testów.", progress: 75, status: 'active', dueDate: '2024-08-15', team: ['JK', 'AW', 'MB'] },
    { id: 2, name: "Migracja API", description: "Przeniesienie starego API opartego na architekturze monolitycznej na nową, zwinną architekturę mikroserwisów opartą o .NET 9.", progress: 45, status: 'active', dueDate: '2024-09-01', team: ['PD', 'KS'] },
    { id: 3, name: "Aplikacja Mobilna", description: "Stworzenie natywnej aplikacji dla systemów iOS i Android, która będzie w pełni zintegrowana z głównym systemem TeamFlow.", progress: 12, status: 'active', dueDate: '2024-11-20', team: ['JK', 'TS', 'DO'] },
];

// Organization Members (Available for invitation)
const organizationMembers = [
  { id: 'u1', initials: 'JK', name: 'Jan Kowalski', role: 'Frontend Dev' },
  { id: 'u2', initials: 'AW', name: 'Anna Wiśniewska', role: 'Product Owner' },
  { id: 'u3', initials: 'MB', name: 'Marek Nowak', role: 'Backend Dev' },
  { id: 'u4', initials: 'PD', name: 'Piotr Dąbrowski', role: 'DevOps' },
  { id: 'u5', initials: 'KS', name: 'Katarzyna Szymańska', role: 'QA Engineer' },
  { id: 'u6', initials: 'TS', name: 'Tomasz Szymański', role: 'Mobile Dev' },
  { id: 'u7', initials: 'DO', name: 'Dorota Olszewska', role: 'UX Designer' },
];

// --- END MOCK DATA ---

interface TaskCardProps {
  task: any;
  handleDragStart: (e: React.DragEvent, taskId: number) => void;
  handleDragEnd: () => void;
  draggedTaskId: number | null;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, handleDragStart, handleDragEnd, draggedTaskId, onClick }) => {
    const priorityClasses = {
        high: 'bg-red-500/20 border-l-red-500',
        medium: 'bg-orange-500/10 border-l-orange-500',
        low: 'bg-zinc-500/10 border-l-zinc-500'
    };

    const isDragging = draggedTaskId === task.id;
    // Normalize assignees to array
    const assignees = task.assignees || (task.assignee ? [task.assignee] : []);

    return (
        <motion.div 
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            draggable="true"
            onDragStart={((e: React.DragEvent) => handleDragStart(e, task.id)) as any}
            onDragEnd={() => handleDragEnd()}
            onClick={onClick}
            className={cn(
                "bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 space-y-4 hover:bg-zinc-900 transition-colors cursor-pointer active:cursor-grabbing border-l-4 relative group",
                priorityClasses[task.priority as keyof typeof priorityClasses],
                isDragging && "opacity-60 scale-105 rotate-2 shadow-2xl shadow-black/50 z-10"
            )}
        >
            <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{task.title}</h4>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{task.commentsList?.length || 0}</span>
                    </div>
                </div>
                
                <div className="flex items-center -space-x-2">
                    {assignees.map((initials: string, i: number) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-200">
                            {initials}
                        </div>
                    ))}
                </div>
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
    className?: string
}) => {
    const statusClasses = {
        todo: 'text-zinc-400',
        'in-progress': 'text-blue-400',
        done: 'text-emerald-400'
    };
    
    const isDraggingOver = dragOverStatus === status;

    return (
        <motion.div
            className={cn("flex-1 min-w-[300px] flex flex-col rounded-xl", className)}
            animate={{ backgroundColor: isDraggingOver ? 'rgba(39, 39, 42, 0.5)' : 'rgba(39, 39, 42, 0)' }}
            transition={{ duration: 0.2 }}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
            onDragEnter={() => draggedTaskId !== null && setDragOverStatus(status)}
        >
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <h3 className={cn("text-sm font-semibold tracking-wide", statusClasses[status as keyof typeof statusClasses])}>{title}</h3>
                    <span className="px-2 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 rounded-md">{tasks.length}</span>
                </div>
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-zinc-500 hover:text-white">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-2 space-y-3 h-full overflow-y-auto">
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
            </div>
        </motion.div>
    );
};


const ProjectDetailPage = () => {
    const { id } = useParams();
    // Initialize project state
    const [project, setProject] = useState(() => projectsData.find(p => p.id.toString() === id));
    
    // Initialize tasks state with normalized data structure for detailed view
    const [tasks, setTasks] = useState(() => {
        const projectTasks = allTasks.filter(t => t.projectId.toString() === id);
        return projectTasks.map(t => ({
            ...t,
            description: "To jest przykładowy opis zadania. W tym miejscu znajdować się będą szczegółowe informacje dotyczące wymagań, specyfikacji technicznej oraz kryteriów akceptacji.",
            commentsList: [
                 { id: 1, user: "Jan Kowalski", initials: "JK", content: "To jest przykładowy komentarz.", date: "2 godz. temu" }
            ],
            assignees: t.assignee ? [t.assignee] : [],
            dueDate: t.dueDate || new Date().toISOString().split('T')[0]
        }));
    });

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
    
    // Project Edit State
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [editProjectData, setEditProjectData] = useState<any>(null);

    if (!project) {
        return <div className="p-10 text-white">Nie znaleziono projektu.</div>;
    }

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        if (draggedTaskId === null) return;
        
        setTasks(currentTasks => 
            currentTasks.map(task => 
                task.id === draggedTaskId ? { ...task, status: newStatus } : task
            )
        );
    };
    
    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverStatus(null);
    };

    // --- Task Detail Logic ---
    const handleTaskClick = (task: any) => {
        setSelectedTask(JSON.parse(JSON.stringify(task))); // Deep copy
        setIsPriorityOpen(false);
        setIsUserMenuOpen(false);
        setIsStatusOpen(false);
    };

    const updateSelectedTask = (field: string, value: any) => {
        if (!selectedTask) return;
        const updated = { ...selectedTask, [field]: value };
        setSelectedTask(updated);
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
    };

    const handleDeleteComment = (commentId: number) => {
        if (!selectedTask) return;
        const updatedComments = selectedTask.commentsList.filter((c: any) => c.id !== commentId);
        updateSelectedTask('commentsList', updatedComments);
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

    // --- Project Team Management ---
    const handleToggleMember = (initials: string) => {
        if (!project) return;
        const currentTeam = [...project.team];
        let newTeam;
        if (currentTeam.includes(initials)) {
            newTeam = currentTeam.filter(i => i !== initials);
        } else {
            newTeam = [...currentTeam, initials];
        }
        setProject({ ...project, team: newTeam });
    };

    // --- Project Edit Logic ---
    const openEditProject = () => {
        setEditProjectData({ ...project });
        setIsEditProjectOpen(true);
    };

    const saveProject = () => {
        if (!editProjectData) return;
        setProject(editProjectData);
        setIsEditProjectOpen(false);
    };


    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo'),
        'in-progress': tasks.filter(t => t.status === 'in-progress'),
        done: tasks.filter(t => t.status === 'done')
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button onClick={openEditProject} variant="default" size="sm" className="bg-white text-black hover:bg-zinc-200">
                        <Edit className="w-3 h-3 mr-2" /> Edytuj
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl mb-6">{project.description}</p>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-sm">
                  <div className="flex items-center gap-x-6 gap-y-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">Termin:</span>
                      <span className="font-medium text-white">{new Date(project.dueDate).toLocaleDateString('pl-PL')}</span>
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
                       {project.team.map((initials: string) => {
                           const member = organizationMembers.find(m => m.initials === initials);
                           return (
                               <div key={initials} title={member?.name} className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-[#0A0A0A] flex items-center justify-center text-xs font-bold text-zinc-200 cursor-default">
                                   {initials}
                               </div>
                           );
                       })}
                    </div>
                    
                    {/* Invite Button with Dropdown */}
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
                                            const isSelected = project.team.includes(member.initials);
                                            return (
                                                <button
                                                    key={member.id}
                                                    onClick={() => handleToggleMember(member.initials)}
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
                                                            <span className={cn("text-sm", isSelected ? "text-white font-medium" : "text-zinc-400")}>{member.name}</span>
                                                            <span className="text-[10px] text-zinc-600">{member.role}</span>
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
                        onClick={() => setSelectedTask(null)}
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

                                    {/* Editable Title - Textarea for wrapping */}
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
                                        {/* Check Button Removed */}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)} className="rounded-full hover:bg-zinc-900 shrink-0 w-10 h-10">
                                    <X className="w-6 h-6 text-zinc-400" />
                                </Button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                                {/* LEFT COLUMN */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <AlignLeft className="w-4 h-4" /> Opis
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

                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Komentarze ({selectedTask.commentsList?.length || 0})
                                        </h3>
                                        <div className="space-y-6">
                                            {selectedTask.commentsList?.length > 0 ? (
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
                                                                <button 
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            <p className="text-sm text-zinc-400 leading-normal">{comment.content}</p>
                                                         </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-zinc-600 italic pl-12">Brak komentarzy.</p>
                                            )}
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                             <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-zinc-600">Ty</div>
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
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border",
                                                                selectedTask.priority === 'high' ? "text-red-400 bg-red-400/10 border-red-400/20" :
                                                                selectedTask.priority === 'medium' ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                                                                "text-zinc-400 bg-zinc-800/50 border-zinc-700"
                                                            )}
                                                        >
                                                            {selectedTask.priority === 'high' ? 'Wysoki' : selectedTask.priority === 'medium' ? 'Średni' : 'Niski'}
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
                                                                            onClick={() => { updateSelectedTask('priority', opt.val); setIsPriorityOpen(false); }}
                                                                            className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-zinc-800", opt.style)}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                        <Calendar className="w-4 h-4" /> <span>Termin</span>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        value={selectedTask.dueDate}
                                                        onChange={(e) => updateSelectedTask('dueDate', e.target.value)}
                                                        className="bg-transparent text-sm font-medium text-white focus:outline-none text-right w-[110px] [color-scheme:dark] cursor-pointer"
                                                    />
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
                                                                {project.team.map((initials: string) => {
                                                                    const member = organizationMembers.find(m => m.initials === initials);
                                                                    const isAssigned = selectedTask.assignees?.includes(initials);
                                                                    return (
                                                                        <button
                                                                            key={initials}
                                                                            onClick={() => handleToggleAssignee(initials)}
                                                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-300">{initials}</div>
                                                                                <span className={cn("text-sm", isAssigned ? "text-white" : "text-zinc-400")}>{member?.name || initials}</span>
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
                                                {selectedTask.assignees?.map((initials: string) => (
                                                    <div key={initials} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full pl-1 pr-3 py-1">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white">{initials}</div>
                                                        <span className="text-xs text-zinc-300">{organizationMembers.find(m => m.initials === initials)?.name.split(' ')[0] || initials}</span>
                                                        <button onClick={() => handleToggleAssignee(initials)} className="ml-1 text-zinc-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            className="w-full max-w-lg bg-[#0A0A0A] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Edytuj Projekt</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditProjectOpen(false)} className="rounded-full hover:bg-zinc-900">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </Button>
                            </div>
                            <div className="p-6 space-y-6">
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
                                            value={editProjectData.dueDate}
                                            onChange={(e) => setEditProjectData({...editProjectData, dueDate: e.target.value})}
                                            className="flex w-full rounded-xl border border-zinc-800 bg-[#111] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-400 ml-1">Postęp (%)</label>
                                        <Input 
                                            type="number"
                                            value={editProjectData.progress}
                                            onChange={(e) => setEditProjectData({...editProjectData, progress: parseInt(e.target.value) || 0})}
                                            className="bg-[#111]"
                                            max={100}
                                            min={0}
                                        />
                                    </div>
                                </div>
                                <Button onClick={saveProject} className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-12">
                                    Zapisz Zmiany
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
