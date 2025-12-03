import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Github,
  ArrowRight
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

const TechBadge = ({ text }: { text: string }) => (
  <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
    {text}
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

      <Footer />
    </div>
  );
};

export default LandingPage;