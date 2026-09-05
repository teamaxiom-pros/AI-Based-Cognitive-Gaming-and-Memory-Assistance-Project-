import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Bell, Check, Phone, Filter, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AlertsCenterPage: React.FC = () => {
  const { alerts, acknowledgeAlert, patient, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'pending') return !a.isAcknowledged;
    if (filter === 'acknowledged') return a.isAcknowledged;
    return true;
  });

  return (
    <CaregiverLayout activeTab="alerts">
      <div className="space-y-6">
        {/* Header & Filter Pills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Alerts & Notification Center
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Real-time events, medication logs, and cognitive shift notifications
            </p>
          </div>

          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === 'pending' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Pending ({alerts.filter(a => !a.isAcknowledged).length})
            </button>
            <button
              onClick={() => setFilter('acknowledged')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === 'acknowledged' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Acknowledged
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <Card className="text-center p-12 space-y-3">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">All Alerts Resolved</h3>
              <p className="text-sm text-slate-500">There are no pending alerts requiring action.</p>
            </Card>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alert.isAcknowledged
                    ? 'bg-white border-slate-200/80 opacity-75'
                    : alert.type === 'warning'
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : alert.type === 'reminder'
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-teal-50/70 border-teal-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-xs ${
                      alert.type === 'warning'
                        ? 'bg-rose-600'
                        : alert.type === 'reminder'
                        ? 'bg-amber-500'
                        : 'bg-teal-600'
                    }`}
                  >
                    {alert.type === 'warning' ? '!' : alert.type === 'reminder' ? '⏰' : '✓'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {alert.category}
                      </span>
                      <span className="text-xs text-slate-400">• {alert.timestamp}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{alert.title}</h3>
                    <p className="text-sm text-slate-600 font-medium">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
                  {!alert.isAcknowledged && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => acknowledgeAlert(alert.id)}
                      icon={<Check size={16} />}
                    >
                      Acknowledge
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => showToast(`Calling ${patient.name}...`)}
                    icon={<Phone size={14} />}
                  >
                    Call Patient
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CaregiverLayout>
  );
};
