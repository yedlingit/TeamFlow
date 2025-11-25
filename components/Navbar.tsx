import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Layers, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-4 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "px-4" : "px-0"
      )}
    >
      <div className={cn(
        "container mx-auto transition-all duration-300",
        isScrolled 
          ? "bg-[#121212]/80 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-2 shadow-2xl shadow-black/50 max-w-4xl" 
          : "bg-transparent px-6 py-4"
      )}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black">
              <Layers className="w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              TeamFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Logowanie</Button>
            </Link>
            <Link to="/register">
              <Button variant="default" size="sm" className="bg-white text-black hover:bg-zinc-200">Rejestracja</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-20 left-4 right-4 bg-[#121212] border border-zinc-800 rounded-3xl p-4 shadow-2xl overflow-hidden z-50"
          >
            <div className="flex flex-col gap-2">
              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full justify-start rounded-xl">Logowanie</Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button variant="default" className="w-full rounded-xl">Rejestracja</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;