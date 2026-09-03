import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_URL, getSupabaseHost } from '../../services/supabaseClient';
import { SUPABASE_SQL_SCHEMA } from '../../data/supabaseSchema';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Cloud,
  Layers,
  X,
  Zap,
  Server,
  Activity,
} from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const { dbHealth, refreshDbHealth, syncToCloud, isSupabaseSyncing, showToast } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'schema'>('status');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsRefreshing(true);
    const report = await refreshDbHealth();
    setIsRefreshing(false);
    if (report.isConnected) {
      showToast(`Supabase Connection Verified! Latency: ${report.latencyMs ?? 0}ms`);
    } else {
      showToast(`Supabase Error: ${report.errorMessage || 'Connection failed'}`);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    showToast('Supabase SQL Schema copied to clipboard!');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const isConnected = dbHealth?.isConnected ?? false;
  const latency = dbHealth?.latencyMs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">Supabase Cloud Database</h3>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                  LIVE POSTGRESQL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {getSupabaseHost()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connection & Live Tables
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PostgreSQL Schema (SQL)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'status' ? (
            <>
              {/* Primary Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  isConnected
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isConnected ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <AlertCircle size={18} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {isConnected ? 'Connected to Supabase Database' : 'Connecting to Supabase Database'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {isConnected
                        ? `Real-time synchronization active for patients, games, assessments & medications.`
                        : `Attempting connection to ${SUPABASE_URL}`}
                    </p>
                  </div>
                </div>

                {latency !== null && latency !== undefined && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Latency</span>
                    <span className="font-black text-sm text-emerald-700 flex items-center justify-end gap-1">
                      <Activity size={13} /> {latency} ms
                    </span>
                  </div>
                )}
              </div>

              {/* Endpoint Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <span>Supabase Environment Configuration</span>
                  <span className="text-teal-600 font-bold">READY</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Database URL</span>
                    <strong className="text-slate-800 break-all">{SUPABASE_URL}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Publishable Key</span>
                    <strong className="text-slate-800 font-mono text-[11px]">sb_publishable_7mvOs...</strong>
                  </div>
                </div>
              </div>

              {/* Synchronized Tables Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-teal-600" /> Database Synchronized Models
                  </span>
                  <span className="text-slate-400 font-medium text-[11px]">8 PostgreSQL Models</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'patients', label: 'Patients', icon: '👤' },
                    { name: 'assessment_sessions', label: 'Assessments', icon: '📋' },
                    { name: 'game_sessions', label: 'Game History', icon: '🎮' },
                    { name: 'medicines', label: 'Medications', icon: '💊' },
                    { name: 'routine_items', label: 'Daily Routine', icon: '☀️' },
                    { name: 'alerts', label: 'Caregiver Alerts', icon: '🔔' },
                    { name: 'appointments', label: 'Appointments', icon: '🗓️' },
                    { name: 'memories', label: 'Memory Hub', icon: '📸' },
                  ].map(table => (
                    <div
                      key={table.name}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{table.icon}</span>
                        <span className="font-semibold text-slate-800 truncate">{table.label}</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Model" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isRefreshing}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Testing Connection...' : 'Test Connection / Ping'}
                </button>

                <button
                  onClick={syncToCloud}
                  disabled={isSupabaseSyncing}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Cloud size={15} className={isSupabaseSyncing ? 'animate-bounce' : ''} />
                  {isSupabaseSyncing ? 'Syncing to Supabase...' : 'Sync All Data to Cloud'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-xs">
                  Run this SQL in the <strong>Supabase SQL Editor</strong> to create all tables and RLS policies:
                </p>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  {copiedSchema ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSchema ? 'Copied SQL!' : 'Copy SQL Schema'}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
