import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineBanner: React.FC = () => {
  const { isOffline, t } = useApp();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-md select-none border-b border-amber-600">
      <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
        <WifiOff size={20} className="flex-shrink-0 animate-pulse text-slate-900" />
        <span className="font-semibold">{t('common.offlineNotice')}</span>
        <span className="hidden sm:inline-flex items-center gap-1 ml-auto text-xs bg-amber-600/30 px-2.5 py-1 rounded-full text-slate-900 font-bold">
          <ShieldCheck size={14} /> NER Offline Resilience Active
        </span>
      </div>
    </div>
  );
};
