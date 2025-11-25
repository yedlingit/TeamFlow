import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-zinc-900 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} TeamFlow. Projekt akademicki.
        </div>
        <div className="flex gap-4 text-xs font-mono text-zinc-600">
          <span>.NET 9.0</span>
          <span>•</span>
          <span>React 19.2</span>
          <span>•</span>
          <span>Tailwind 4.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;