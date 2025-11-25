
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BellRing,
  Layers,
  ArrowRight,
  FileText,
  Loader2,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { dashboardService, authService } from '../../api';
import { useLoading } from '../../hooks/useLoading';
import { useApiError } from '../../hooks/useApiError';
import type { DashboardStatsDto } from '../../api/types';

// Helper to get styles based on theme key
const getProjectStyles = (theme: string) => {
  switch (theme) {
    case 'white': return { 
      bar: 'bg-white', 
      shadow: 'shadow-[0_0_12px_rgba(255,255,255,0.4)]', 
      pill: 'bg-white',
      text: 'text-zinc-200'
    };
    case 'blue': return { 
      bar: 'bg-blue-500', 
      shadow: 'shadow-[0_0_12px_rgba(59,130,246,0.5)]', 
      pill: 'bg-blue-500',
      text: 'text-blue-400'
    };
    case 'indigo': return { 
      bar: 'bg-indigo-500', 
      shadow: 'shadow-[0_0_12px_rgba(99,102,241,0.5)]', 
      pill: 'bg-indigo-500',
      text: 'text-indigo-400'
    };
    case 'purple': return { 
      bar: 'bg-purple-500', 
      shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]', 
      pill: 'bg-purple-500',
      text: 'text-purple-400'
    };
    default: return { 
      bar: 'bg-zinc-500', 
      shadow: 'shadow-none', 
      pill: 'bg-zinc-500',
      text: 'text-zinc-400'
    };
  }
};

const DashboardPage: React.FC = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const handleApiError = useApiError();
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [currentUser, setCurrentUser] = useState<{ firstName: string | null } | null>(null);
  const currentDate = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    loadDashboardData();
    loadCurrentUser();
  }, []);

  const loadDashboardData = async () => {
    startLoading();
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      handleApiError(err);
    } finally {
      stopLoading();
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getMe();
      setCurrentUser(user);
    } catch (err) {
      // Silent fail - user might not be logged in
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      // Simulate download logic
      const element = document.createElement("a");
      const file = new Blob([`RAPORT TYGODNIOWY - TEAMFLOW\n\nData: ${new Date().toLocaleString()}\nAutor: Jan Kowalski\n\nStatystyki:\n- Do zrobienia: 12\n- W toku: 4\n- Ukończone: 28\n`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "raport_tygodniowy.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 shrink-0 pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Pulpit</h1>
          <p className="text-zinc-500 text-sm capitalize font-medium">{currentDate}</p>
        </div>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700/50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generowanie...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generuj Raport
            </>
          )}
        </Button>
      </div>

      {/* Top Section: Welcome & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Welcome Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center group"
        >
          {/* Abstract Activity Visual */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none">
             <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-t from-indigo-500/20 to-transparent" />
             <div className="flex items-end justify-end gap-2 h-full pr-8 pb-8">
                <div className="w-4 bg-zinc-500 h-[40%] rounded-t-sm" />
                <div className="w-4 bg-zinc-600 h-[60%] rounded-t-sm" />
                <div className="w-4 bg-white h-[80%] rounded-t-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                <div className="w-4 bg-zinc-700 h-[50%] rounded-t-sm" />
             </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Witaj, {currentUser?.firstName || 'użytkowniku'}!
            </h2>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
              To dobry dzień, aby zrealizować swoje cele. Sprawdź swoje zadania i projekty poniżej.
            </p>
          </div>
        </motion.div>

        {/* Stats Column */}
        <motion.div 
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl p-1 flex flex-col justify-between"
        >
           {stats ? (
             <>
               <div className="flex-1 flex items-center justify-between px-5 py-2 hover:bg-zinc-900/30 rounded-2xl transition-colors first:mt-1 min-h-[56px]">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 bg-zinc-800">
                     <AlertCircle className="w-5 h-5 text-zinc-100" />
                   </div>
                   <span className="text-sm font-medium text-zinc-400">Do zrobienia</span>
                 </div>
                 <span className="text-2xl font-bold text-white tracking-tight">{stats.taskStats.toDo}</span>
               </div>
               <div className="flex-1 flex items-center justify-between px-5 py-2 hover:bg-zinc-900/30 rounded-2xl transition-colors min-h-[56px]">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 bg-blue-500/20">
                     <Clock className="w-5 h-5 text-blue-400" />
                   </div>
                   <span className="text-sm font-medium text-zinc-400">W toku</span>
                 </div>
                 <span className="text-2xl font-bold text-white tracking-tight">{stats.taskStats.inProgress}</span>
               </div>
               <div className="flex-1 flex items-center justify-between px-5 py-2 hover:bg-zinc-900/30 rounded-2xl transition-colors last:mb-1 min-h-[56px]">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 bg-emerald-500/20">
                     <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                   </div>
                   <span className="text-sm font-medium text-zinc-400">Ukończone</span>
                 </div>
                 <span className="text-2xl font-bold text-white tracking-tight">{stats.taskStats.done}</span>
               </div>
             </>
           ) : (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
             </div>
           )}
        </motion.div>
      </div>

      {/* Bottom Section: Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Upcoming Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                <BellRing className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="font-bold text-white text-sm tracking-wide">Najbliższe Zadania</h3>
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {stats && stats.upcomingTasks && stats.upcomingTasks.length > 0 ? (
              stats.upcomingTasks.slice(0, 5).map((task) => {
                const priority = task.priority?.toLowerCase() || 'low';
                const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                const dueText = dueDate 
                  ? dueDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
                  : 'Brak terminu';
                
                return (
                  <div key={task.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800 transition-all cursor-default">
                    {/* Status Dot */}
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      priority === 'high' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : 
                      priority === 'medium' ? "bg-orange-500" : "bg-zinc-600"
                    )} />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {task.projectName || 'Brak projektu'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2.5 py-1 rounded-lg border border-zinc-800/50">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className={cn(
                          "text-xs font-medium",
                          priority === 'high' ? "text-red-400" : "text-zinc-400"
                        )}>
                          {dueText}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-zinc-500 text-sm">
                Brak nadchodzących zadań
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Projects */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                  <Layers className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="font-bold text-white text-sm tracking-wide">Aktywne Projekty</h3>
             </div>
             <Link to="/projects">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {stats && stats.activeProjects && stats.activeProjects.length > 0 ? (
              stats.activeProjects.slice(0, 5).map((project) => {
                const theme = 'white'; // Default theme, can be extended later
                const styles = getProjectStyles(theme);
                
                return (
                  <Link 
                    key={project.id} 
                    to={`/projects/${project.id}`}
                    className="group block p-4 rounded-2xl bg-zinc-900/20 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-8 rounded-full", styles.pill)} />
                        <div>
                          <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{project.name}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{project.taskCount} zadań • {project.memberCount} członków</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                        <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-medium">
                        <span className={cn("flex items-center gap-1.5", styles.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", styles.pill)} />
                          W toku
                        </span>
                        <span className="text-white font-mono">{project.progress}%</span>
                      </div>
                      
                      {/* Thicker Progress Bar with Glow */}
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn("h-full rounded-full", styles.bar, styles.shadow)} 
                        />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-8 text-center text-zinc-500 text-sm">
                Brak aktywnych projektów
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DashboardPage;
