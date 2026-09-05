import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warm';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98 select-none';

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-3.5 text-lg min-h-[54px] shadow-sm',
    xl: 'px-8 py-4 text-xl min-h-[64px] shadow-md',
  };

  const variantStyles = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-700/20 active:bg-teal-800',
    secondary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20',
    warm: 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/20 font-bold',
    outline: 'border-2 border-slate-300 hover:border-teal-600 hover:bg-teal-50 text-slate-700 hover:text-teal-900 bg-white',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-700/20',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0 mr-2">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0 ml-2">{icon}</span>}
    </button>
  );
};
