import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CaregiverLayout } from '../../components/layout/CaregiverLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  FileText,
  Download,
  Share2,
  Mail,
  Printer,
  Check,
  Brain,
  Pill,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ReportGeneratorPage: React.FC = () => {
  const { patient, medicines, routineItems, assessmentResult, showToast } = useApp();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [includeCognition, setIncludeCognition] = useState(true);
  const [includeMedication, setIncludeMedication] = useState(true);
  const [includeRoutine, setIncludeRoutine] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Patient Name,Age,Region,Report Date,Cognitive Score,Med Adherence,Routine Completion\n' +
      `"${patient.name}",${patient.age},"${patient.location}","August 2026",${assessmentResult?.overallScore || 85}%,96%,80%\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AXIOM_Clinical_Report_${patient.name.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV Export downloaded!');
  };

  return (
    <CaregiverLayout activeTab="reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Clinical & Caregiver Report Generator
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Compile longitudinal cognitive data, medication logs, and behavioral notes for neurology consultations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="md" variant="outline" onClick={handleExportCSV} icon={<Download size={16} />}>
              CSV
            </Button>
            <Button size="md" onClick={handlePrint} icon={<Printer size={16} />}>
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Split Layout: Left Form + Right Live Preview (Stitch Spec) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Configuration */}
          <div className="lg:col-span-4 space-y-5">
            <Card className="p-6 space-y-5">
              <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
                Report Settings
              </h3>

              {/* Patient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selected Patient</label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>{patient.name} ({patient.age})</span>
                  <span className="text-xs text-teal-700 font-semibold">{patient.location}</span>
                </div>
              </div>

              {/* Date Range Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Reporting Period</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: '90d', label: 'Last 90 Days' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setDateRange(p.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        dateRange === p.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report Modules Checklist */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Include Modules
                </label>

                {[
                  { id: 'cog', label: 'Cognitive Engagement Scores', state: includeCognition, setter: setIncludeCognition },
                  { id: 'med', label: 'Medication Adherence Matrix', state: includeMedication, setter: setIncludeMedication },
                  { id: 'rou', label: 'Daily Routine Consistency', state: includeRoutine, setter: setIncludeRoutine },
                  { id: 'alt', label: 'Alerts & Critical Events Log', state: includeAlerts, setter: setIncludeAlerts },
                  { id: 'not', label: 'AI Clinical Observations & Notes', state: includeNotes, setter: setIncludeNotes },
                ].map(mod => (
                  <label
                    key={mod.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={mod.state}
                      onChange={e => mod.setter(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">{mod.label}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Live High-Fidelity Preview Card (Printable) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
              {/* Report Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-700 text-white font-black flex items-center justify-center text-sm">
                      A
                    </div>
                    <span className="font-black text-xl tracking-tight text-slate-900">
                      AXIOM COGNITIVE CARE
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">
                    Clinical Activity & Adherence Summary
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    North Eastern Region (NER) Caregiver Platform • Period: {dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500 space-y-1">
                  <div><strong>Generated:</strong> August 13, 2026</div>
                  <div><strong>Report ID:</strong> AXIOM-NER-7841</div>
                  <div><strong>Clinician:</strong> Dr. N. Barua (GMCH)</div>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase">Patient</span>
                  <strong className="text-slate-900 text-sm">{patient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase">Age & Gender</span>
                  <strong className="text-slate-900 text-sm">{patient.age} Yrs / Female</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase">Location</span>
                  <strong className="text-slate-900 text-sm">{patient.location}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase">Primary Caregiver</span>
                  <strong className="text-slate-900 text-sm">Priya Sharma (Daughter)</strong>
                </div>
              </div>

              {/* MODULE 1: COGNITIVE SCORES */}
              {includeCognition && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-wider text-teal-800 border-b border-teal-200 pb-1 flex items-center gap-2">
                    <Brain size={16} /> 1. Cognitive Engagement Metrics (Non-Diagnostic)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                      <div className="text-xs text-teal-700 font-bold">Memory & Recall</div>
                      <div className="text-xl font-black text-teal-950">85%</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-xs text-emerald-700 font-bold">Visual Attention</div>
                      <div className="text-xl font-black text-emerald-950">95%</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="text-xs text-indigo-700 font-bold">Sequencing</div>
                      <div className="text-xl font-black text-indigo-950">85%</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-xs text-amber-700 font-bold">Recognition</div>
                      <div className="text-xl font-black text-amber-950">90%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: MEDICATION ADHERENCE */}
              {includeMedication && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase tracking-wider text-indigo-800 border-b border-indigo-200 pb-1 flex items-center gap-2">
                    <Pill size={16} /> 2. Medication Adherence Summary (Overall: 96%)
                  </h4>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Medication</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Scheduled Slot</th>
                        <th className="p-2.5">7-Day Compliance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map(m => (
                        <tr key={m.id}>
                          <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2.5 text-slate-600">{m.dosage}</td>
                          <td className="p-2.5 text-slate-600">{m.timeSlot} ({m.time})</td>
                          <td className="p-2.5 font-bold text-emerald-700">7 / 7 Taken (100%)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MODULE 3: AI CLINICAL OBSERVATION */}
              {includeNotes && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-indigo-800">
                    <Sparkles size={14} /> AI Observational Synthesis
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {assessmentResult?.clinicalNotes || 'Patient demonstrated high engagement during orientation and visual tasks. Visual attention latency was within normal bounds. Recommended ongoing daily cognitive stimulation.'}
                  </p>
                </div>
              )}

              {/* Mandatory Medical Disclaimer (Stitch Spec) */}
              <div className="border-t-2 border-slate-200 pt-4 flex items-start gap-2.5 text-[11px] text-slate-500 font-medium">
                <ShieldCheck size={18} className="text-teal-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Medical Disclaimer:</strong> Activity performance recorded by the Axiom application reflects engagement in supportive cognitive stimulation exercises and is not a clinical medical diagnosis of dementia or cognitive impairment. Persistent or concerning cognitive changes should always be evaluated by a qualified healthcare physician.
                </p>
              </div>

              {/* Export Buttons in Card Footer */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 print:hidden">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => showToast('Report emailed to Dr. N. Barua (GMCH).')}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-indigo-200"
                >
                  <Mail size={14} /> Send to Doctor Email
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={14} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CaregiverLayout>
  );
};
