import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  highlighted?: boolean;
  variant?: 'default' | 'calm' | 'teal' | 'warm' | 'elderlyAction';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  highlighted = false,
  variant = 'default',
  className,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-3xl p-6 transition-all duration-200 border border-slate-200/80 shadow-soft contrast-card';

  const variantStyles = {
    default: 'bg-white text-slate-900',
    calm: 'bg-emerald-50/50 border-emerald-100 text-slate-900',
    teal: 'bg-teal-50/60 border-teal-200/80 text-teal-950',
    warm: 'bg-amber-50/60 border-amber-200/80 text-amber-950',
    elderlyAction: 'bg-white hover:bg-teal-50/40 border-2 border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md cursor-pointer',
  };

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          hoverable && 'hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer',
          highlighted && 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/40',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
