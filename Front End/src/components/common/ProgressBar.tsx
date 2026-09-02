import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: 'teal' | 'emerald' | 'amber' | 'blue';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  color = 'teal',
  showPercentage = true,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  const colorStyles = {
    teal: 'bg-teal-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    blue: 'bg-blue-600',
  };

  return (
    <div className="w-full space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span className="text-teal-700">{percentage}%</span>}
        </div>
      )}
      <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
