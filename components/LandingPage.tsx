import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, LayoutGroup } from 'framer-motion';
import { 
  Kanban, 
  Database,
  Terminal,
  Github,
  ShieldCheck,
  Server,
  Cpu,
  ArrowRight,
  GripVertical
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

// --- Components ---

// Kanban Simulation for Bento Grid
const KanbanSimulation = () => {
  const [items, setItems] = useState([
    { id: 1, tag: "Design", theme: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
    { id: 2, tag: "API", theme: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: 3, tag: "Frontend", theme: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  ]);
  const [hasStarted, setHasStarted] = useState(false);

  const startAnimation = () => {
    if (hasStarted) return;
    setHasStarted(true);

    // Sequence of moves
    const timeouts = [
      setTimeout(() => {
        setItems(prev => [prev[1], prev[0], prev[2]]); // Swap 1 & 2
      }, 800),
      setTimeout(() => {
        setItems(prev => [prev[1], prev[2], prev[0]]); // Move bottom to top
      }, 2000),
      setTimeout(() => {
        setItems(prev => [prev[2], prev[1], prev[0]]); // Final shuffle
      }, 3200)
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  return (
    <motion.div 
      className="mt-8 flex flex-col gap-3 relative z-10 w-full max-w-[280px]"
      onViewportEnter={startAnimation}
      viewport={{ once: true, amount: 0.5 }}
    >
      <LayoutGroup>
        {items.map((item) => (
          <motion.div
            layout
            key={item.id}
            transition={{ 
              type: "spring", 
              stiffness: 250, 
              damping: 25 
            }}
            className="group p-3 rounded-2xl bg-[#0e0e0e] border border-zinc-800/80 flex items-center gap-3 shadow-lg relative z-10 hover:border-zinc-700 transition-colors"
          >
            {/* Drag Handle */}
            <div className="text-zinc-700">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Content Placeholder */}
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-16 bg-zinc-800 rounded-full" />
              <div className="h-1.5 w-24 bg-zinc-900 rounded-full" />
            </div>

            {/* Tag */}
            <div className={`px-2.5 py-1 rounded-md text-[10px] font-medium border uppercase tracking-wide ${item.theme}`}>
              {item.tag}
            </div>
          </motion.div>
        ))}
      </LayoutGroup>
      
      {/* Column hints behind - subtle depth */}
      <div className="absolute inset-0 -z-10 flex justify-between pointer-events-none opacity-10">
        <div className="w-full border-r border-dashed border-zinc-500" />
        <div className="w-full border-r border-dashed border-zinc-500" />
      </div>
    </motion.div>
  );
};

// Bento Grid Item Component
const BentoItem = ({ 
  children, 
  className, 
  delay = 0 
}: { 
  children?: React.ReactNode, 
  className?: string,
  delay?: number 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className={`bg-[#0A0A0A] border border-zinc-800/60 rounded-3xl overflow-hidden relative group hover:border-zinc-700 transition-colors ${className}`}
  >
    {children}
  </motion.div>
);

const TechBadge = ({ text }: { text: string }) => (
  <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
    {text}
  </div>
);

const CodeBlock = ({ title, lines }: { title: string, lines: string[] }) => (
  <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 font-mono text-sm shadow-inner">
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
      <span className="text-xs text-zinc-500">{title}</span>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
      </div>
    </div>
    <div className="p-4 space-y-2 overflow-x-auto">
      {lines.map((line, index) => (
        <div key={index} className="flex gap-4">
          <span className="text-zinc-700 select-none w-4 text-right">{index + 1}</span>
          <span className="text-zinc-300 whitespace-nowrap">
            {line.startsWith('$') ? (
              <>
                <span className="text-zinc-500">$</span> {line.substring(2)}
              </>
            ) : line.startsWith('#') ? (
              <span className="text-zinc-600 italic">{line}</span>
            ) : (
              line
            )}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const yBackground = useTransform(scrollY, [0, 1000], [0, 300]);
  const yTitle = useTransform(scrollY, [0, 1000], [0, 200]);
  const yText = useTransform(scrollY, [0, 1000], [0, 100]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-4 min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Animated Background Glow with Parallax */}
          <motion.div 
            style={{ y: yBackground }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" 
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider mb-4 relative z-20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            TeamFlow v1.0
          </motion.div>
          
          <motion.h1
            style={{ y: yTitle }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tight text-white relative z-20"
          >
            TeamFlow
          </motion.h1>
          
          <motion.div
            style={{ y: yText }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 relative z-20"
          >
            <h2 className="text-2xl md:text-3xl font-medium text-zinc-300">
              Aplikacja webowa do zarządzania zadaniami
            </h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">
              Projekt studencki demonstrujący architekturę .NET 9 oraz React 19. 
              Implementacja wzorców REST API, Cookie Auth oraz Clean Architecture.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 relative z-20"
          >
            <Link to="/register">
              <Button size="lg" className="min-w-[160px] bg-white text-black hover:bg-zinc-200 rounded-full">
                Zarejestruj się
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="min-w-[160px] rounded-full border-zinc-700 bg-transparent">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-3 pt-12 opacity-60 relative z-20"
          >
            <TechBadge text=".NET 9" />
            <TechBadge text="React 19" />
            <TechBadge text="SQLite" />
            <TechBadge text="Tailwind 4" />
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 bg-[#050505] relative z-30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-semibold text-white">Specyfikacja Funkcjonalna</h2>
            <div className="h-px flex-1 bg-zinc-900 ml-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
            
            {/* Card 1: Kanban - Large */}
            <BentoItem className="md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between bg-gradient-to-br from-[#0f0f0f] to-[#050505]">
              <div className="space-y-2 relative z-10">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                  <Kanban className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Tablica Kanban</h3>
                <p className="text-zinc-500 max-w-sm">
                  Pełna obsługa cyklu życia zadania. Przeciągnij i upuść (Drag & Drop), zmiana statusów w czasie rzeczywistym. 
                </p>
              </div>
              
              {/* Kanban Simulation Animation */}
              <div className="flex items-end justify-center md:justify-start">
                <KanbanSimulation />
              </div>
            </BentoItem>

            {/* Card 2: CRUD */}
            <BentoItem className="p-6" delay={0.1}>
              <Database className="w-8 h-8 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">CRUD Zadań</h3>
              <p className="text-sm text-zinc-500">
                Tworzenie, odczyt, aktualizacja i usuwanie encji z zachowaniem spójności w bazie SQLite.
              </p>
            </BentoItem>

            {/* Card 3: Auth */}
            <BentoItem className="p-6" delay={0.2}>
              <ShieldCheck className="w-8 h-8 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Autoryzacja</h3>
              <p className="text-sm text-zinc-500">
                Bezpieczne logowanie oparte o ciasteczka HttpOnly. Ochrona tras przed nieautoryzowanym dostępem.
              </p>
            </BentoItem>

             {/* Card 4: Stats */}
             <BentoItem className="md:col-span-2 p-6 flex items-center gap-8" delay={0.3}>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Statystyki i Raporty</h3>
                <p className="text-sm text-zinc-500">
                  Agregacja danych o postępach projektu, wyliczanie metryk wydajności zespołu.
                </p>
              </div>
              <div className="flex gap-2 items-end h-16 opacity-40">
                <div className="w-4 bg-zinc-600 h-8 rounded-t" />
                <div className="w-4 bg-white h-12 rounded-t" />
                <div className="w-4 bg-zinc-600 h-16 rounded-t" />
                <div className="w-4 bg-zinc-600 h-10 rounded-t" />
              </div>
            </BentoItem>

            {/* Card 5: Architecture */}
            <BentoItem className="p-6" delay={0.4}>
              <Server className="w-8 h-8 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Architektura</h3>
              <p className="text-sm text-zinc-500">
                Separacja warstw API i Client. Wzorce Repository oraz Unit of Work w backendzie.
              </p>
            </BentoItem>

             {/* Card 6: Performance */}
             <BentoItem className="p-6" delay={0.5}>
              <Cpu className="w-8 h-8 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Wydajność</h3>
              <p className="text-sm text-zinc-500">
                Optymalizacja zapytań EF Core oraz responsywny interfejs React 19 z minimalnym re-renderowaniem.
              </p>
            </BentoItem>

          </div>
        </div>
      </section>

      {/* Docs Section - Terminal Style */}
      <section id="docs" className="py-20 border-t border-zinc-900 bg-[#080808] relative z-30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
                <Terminal className="w-3 h-3" />
                Dokumentacja
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Instrukcja Wdrożenia
              </h2>
              <div className="space-y-6">
                <div className="group flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-sm font-mono text-zinc-400 group-hover:bg-white group-hover:text-black transition-colors">01</div>
                    <div className="w-px h-full bg-zinc-900 my-2" />
                  </div>
                  <div className="pb-8">
                    <h4 className="text-white font-medium mb-1">Przygotowanie Środowiska</h4>
                    <p className="text-sm text-zinc-500">Upewnij się, że posiadasz .NET 9 SDK oraz Node.js zainstalowane na maszynie.</p>
                  </div>
                </div>
                <div className="group flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-sm font-mono text-zinc-400 group-hover:bg-white group-hover:text-black transition-colors">02</div>
                    <div className="w-px h-full bg-zinc-900 my-2" />
                  </div>
                  <div className="pb-8">
                    <h4 className="text-white font-medium mb-1">Backend (API)</h4>
                    <p className="text-sm text-zinc-500">Uruchomienie serwera API zainicjuje bazę danych SQLite.</p>
                  </div>
                </div>
                <div className="group flex gap-4">
                   <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-sm font-mono text-zinc-400 group-hover:bg-white group-hover:text-black transition-colors">03</div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Frontend (Client)</h4>
                    <p className="text-sm text-zinc-500">Interfejs użytkownika dostępny pod localhost:5173 po zbudowaniu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-8 lg:pt-0">
              <CodeBlock 
                title="Backend Setup" 
                lines={[
                  "# Klonowanie repozytorium",
                  "$ git clone https://github.com/user/teamflow.git",
                  "$ cd TeamFlow.API",
                  "# Przywracanie pakietów NuGet",
                  "$ dotnet restore",
                  "# Uruchomienie (auto-migracja DB)",
                  "$ dotnet run"
                ]} 
              />
              <CodeBlock 
                title="Frontend Setup" 
                lines={[
                  "$ cd TeamFlow.Client",
                  "# Instalacja zależności npm",
                  "$ npm install",
                  "# Start serwera deweloperskiego Vite",
                  "$ npm run dev"
                ]} 
              />
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-zinc-900 bg-[#050505] relative z-30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto p-1 rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-950">
            <div className="bg-[#080808] rounded-[20px] p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Dostęp do Systemu
              </h2>
              <p className="text-zinc-500 mb-8">
                System wymaga posiadania konta do obsługi zadań. Zarejestruj się, aby utworzyć przestrzeń roboczą.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-10">
                  Utwórz Konto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;