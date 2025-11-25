import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border border-zinc-800 bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm",
              Icon && "pl-10",
              error && "border-red-900/50 focus:ring-red-900/20 focus:border-red-900",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] font-medium text-red-500 ml-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
