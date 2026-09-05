import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getOfflineQueueLength } from '../../services/offlineSyncService';

export const OfflineBanner: React.FC = () => {
  const { isOffline, t } = useApp();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getOfflineQueueLength());
    };
    updateCount();
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, [isOffline]);

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className={`px-4 py-2.5 font-medium text-sm flex items-center justify-between shadow-md select-none border-b ${
      isOffline 
        ? 'bg-amber-500 text-slate-950 border-amber-600' 
        : 'bg-teal-700 text-white border-teal-800'
    }`}>
      <div className="flex items-center gap-2.5 max-w-5xl mx-auto w-full">
        {isOffline ? (
          <>
            <WifiOff size={18} className="flex-shrink-0 animate-pulse text-slate-900" />
            <span className="font-semibold">{t('common.offlineNotice')}</span>
            {pendingCount > 0 && (
              <span className="bg-amber-700/30 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-md">
                {pendingCount} {pendingCount === 1 ? 'action' : 'actions'} queued
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 ml-auto text-xs bg-amber-600/30 px-2.5 py-1 rounded-full text-slate-900 font-bold">
              <ShieldCheck size={14} /> Local Cache Active
            </span>
          </>
        ) : (
          <>
            <RefreshCw size={16} className="animate-spin text-teal-200" />
            <span className="text-xs font-bold">{pendingCount} offline items syncing to cloud...</span>
          </>
        )}
      </div>
    </div>
  );
};

