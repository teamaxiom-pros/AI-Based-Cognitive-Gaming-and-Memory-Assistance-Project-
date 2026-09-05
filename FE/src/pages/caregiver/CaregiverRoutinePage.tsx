import React from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Clock, Check, Plus, Calendar, CheckCircle2 } from 'lucide-react';

export const CaregiverRoutinePage: React.FC = () => {
  const { routineItems, toggleRoutineItem, patient, showToast } = useApp();

  const morningItems = routineItems.filter(r => r.timeBlock === 'Morning');
  const afternoonItems = routineItems.filter(r => r.timeBlock === 'Afternoon');
  const eveningItems = routineItems.filter(r => r.timeBlock === 'Evening');

  return (
    <CaregiverLayout activeTab="routine">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Routine Tracking & Configuration
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Weekly schedule structure for {patient.name}
            </p>
          </div>

          <Button
            size="md"
            onClick={() => showToast('Routine updated for patient.')}
            icon={<Plus size={18} />}
          >
            Add Routine Item
          </Button>
        </div>

        {/* 3 Time Block Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Morning Block */}
          <div className="space-y-3">
            <div className="bg-amber-100 text-amber-900 font-bold px-4 py-2 rounded-2xl text-sm flex items-center justify-between">
              <span>🌅 Morning (07:00 AM - 12:00 PM)</span>
              <span>{morningItems.filter(i => i.isCompleted).length}/{morningItems.length}</span>
            </div>
            {morningItems.map(item => (
              <Card key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-500">{item.time}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Status</span>
                  <span className={`text-xs font-bold ${item.isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.isCompleted ? 'Done at ' + item.completedAt : 'Pending'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Afternoon Block */}
          <div className="space-y-3">
            <div className="bg-teal-100 text-teal-900 font-bold px-4 py-2 rounded-2xl text-sm flex items-center justify-between">
              <span>☀️ Afternoon (12:00 PM - 05:00 PM)</span>
              <span>{afternoonItems.filter(i => i.isCompleted).length}/{afternoonItems.length}</span>
            </div>
            {afternoonItems.map(item => (
              <Card key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-500">{item.time}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Status</span>
                  <span className={`text-xs font-bold ${item.isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.isCompleted ? 'Done at ' + item.completedAt : 'Pending'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Evening Block */}
          <div className="space-y-3">
            <div className="bg-indigo-100 text-indigo-900 font-bold px-4 py-2 rounded-2xl text-sm flex items-center justify-between">
              <span>🌙 Evening (05:00 PM - 10:00 PM)</span>
              <span>{eveningItems.filter(i => i.isCompleted).length}/{eveningItems.length}</span>
            </div>
            {eveningItems.map(item => (
              <Card key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-500">{item.time}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Status</span>
                  <span className={`text-xs font-bold ${item.isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.isCompleted ? 'Done at ' + item.completedAt : 'Pending'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </CaregiverLayout>
  );
};
