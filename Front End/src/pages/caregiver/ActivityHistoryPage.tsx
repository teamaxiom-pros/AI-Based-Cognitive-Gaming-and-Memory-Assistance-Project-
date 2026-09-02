import React from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { History, Award, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export const ActivityHistoryPage: React.FC = () => {
  const { patient, activityHistory } = useApp();

  return (
    <CaregiverLayout activeTab="activities">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Activity History & Logs</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Comprehensive log of all cognitive activities played by {patient.name} (Live Synced)
            </p>
          </div>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full border border-indigo-200">
            {activityHistory.length} Total Sessions
          </span>
        </div>

        {/* Activity Table Card */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="p-4 pl-6">Activity Name</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Accuracy / Score</th>
                  <th className="p-4 pr-6">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityHistory.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      {log.title}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{log.date}</td>
                    <td className="p-4 text-slate-600 font-medium">{log.duration}</td>
                    <td className="p-4 font-bold text-teal-700">{log.score}%</td>
                    <td className="p-4 pr-6">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          log.status === 'Optimal'
                            ? 'text-emerald-800 bg-emerald-100'
                            : 'text-indigo-800 bg-indigo-100'
                        }`}
                      >
                        <CheckCircle2 size={12} /> {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </CaregiverLayout>
  );
};
