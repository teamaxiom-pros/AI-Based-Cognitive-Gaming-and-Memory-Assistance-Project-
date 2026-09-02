import React from 'react';
import { useApp } from './context/AppContext';
import { DemoToolbar } from './components/layout/DemoToolbar';
import { GuidedDemoController } from './components/demo/GuidedDemoController';
import { WelcomePage } from './pages/onboarding/WelcomePage';
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow';
import { AssessmentIntro } from './pages/assessment/AssessmentIntro';
import { AssessmentRunner } from './pages/assessment/AssessmentRunner';
import { AssessmentResultPage } from './pages/assessment/AssessmentResultPage';
import { PatientHomePage } from './pages/patient/PatientHomePage';
import { ActivitiesHubPage } from './pages/patient/ActivitiesHubPage';
import { MemoryMatchGamePage } from './pages/patient/games/MemoryMatchGamePage';
import { ObjectRecallGamePage } from './pages/patient/games/ObjectRecallGamePage';
import { AttentionSearchGamePage } from './pages/patient/games/AttentionSearchGamePage';
import { PatternSequenceGamePage } from './pages/patient/games/PatternSequenceGamePage';
import { PlayGamePage } from './pages/patient/games/PlayGamePage';
import { MemoryHubPage } from './pages/patient/MemoryHubPage';
import { AxiomAssistantPage } from './pages/patient/AxiomAssistantPage';
import { MedicineTrackerPage } from './pages/patient/MedicineTrackerPage';
import { RoutineTrackerPage } from './pages/patient/RoutineTrackerPage';
import { PatientSettingsPage } from './pages/patient/PatientSettingsPage';
import { CaregiverLoginPage } from './pages/caregiver/CaregiverLoginPage';
import { CaregiverDashboardPage } from './pages/caregiver/CaregiverDashboardPage';
import { CognitiveAnalyticsPage } from './pages/caregiver/CognitiveAnalyticsPage';
import { ActivityHistoryPage } from './pages/caregiver/ActivityHistoryPage';
import { CaregiverMedicationsPage } from './pages/caregiver/CaregiverMedicationsPage';
import { CaregiverRoutinePage } from './pages/caregiver/CaregiverRoutinePage';
import { AlertsCenterPage } from './pages/caregiver/AlertsCenterPage';
import { AppointmentsManagerPage } from './pages/caregiver/AppointmentsManagerPage';
import { ReportGeneratorPage } from './pages/caregiver/ReportGeneratorPage';
import { CaregiverSettingsPage } from './pages/caregiver/CaregiverSettingsPage';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const { currentRoute, toastMessage } = useApp();

  const renderRoute = () => {
    const routeBase = currentRoute.split('?')[0];
    switch (routeBase) {
      case '/welcome':
        return <WelcomePage />;
      case '/onboarding/flow':
      case '/onboarding/profile':
      case '/onboarding/caregiver':
      case '/onboarding/medicines':
      case '/onboarding/routine':
      case '/onboarding/preferences':
        return <OnboardingFlow />;
      case '/assessment/intro':
        return <AssessmentIntro />;
      case '/assessment/runner':
        return <AssessmentRunner />;
      case '/assessment/result':
      case '/assessment/plan':
        return <AssessmentResultPage />;
      case '/home':
        return <PatientHomePage />;
      case '/activities':
        return <ActivitiesHubPage />;
      case '/activities/memory-match':
        return <MemoryMatchGamePage />;
      case '/activities/object-recall':
      case '/activities/picture-recall':
        return <ObjectRecallGamePage />;
      case '/activities/attention-search':
      case '/activities/attention-finder':
        return <AttentionSearchGamePage />;
      case '/activities/pattern-sequence':
      case '/activities/sequence-builder':
        return <PatternSequenceGamePage />;
      case '/activities/number-memory':
      case '/activities/pattern-recall':
      case '/activities/odd-one-out':
      case '/activities/word-recall':
      case '/activities/spatial-memory':
      case '/activities/category-sorting':
      case '/activities/symbol-matching':
      case '/activities/object-recognition':
      case '/activities/play':
        return <PlayGamePage />;
      case '/memory':
        return <MemoryHubPage />;
      case '/assistant':
        return <AxiomAssistantPage />;
      case '/medicines':
        return <MedicineTrackerPage />;
      case '/routine':
        return <RoutineTrackerPage />;
      case '/settings':
        return <PatientSettingsPage />;

      // Caregiver Routes
      case '/caregiver/login':
        return <CaregiverLoginPage />;
      case '/caregiver/dashboard':
      case '/caregiver/overview':
        return <CaregiverDashboardPage />;
      case '/caregiver/cognition':
        return <CognitiveAnalyticsPage />;
      case '/caregiver/activities':
        return <ActivityHistoryPage />;
      case '/caregiver/medicines':
        return <CaregiverMedicationsPage />;
      case '/caregiver/routine':
        return <CaregiverRoutinePage />;
      case '/caregiver/alerts':
        return <AlertsCenterPage />;
      case '/caregiver/appointments':
        return <AppointmentsManagerPage />;
      case '/caregiver/reports':
        return <ReportGeneratorPage />;
      case '/caregiver/settings':
        return <CaregiverSettingsPage />;

      default:
        return <WelcomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Demo Toolbar for SIH Judges */}
      <DemoToolbar />

      {/* Active Route Content */}
      <div className="flex-1">{renderRoute()}</div>

      {/* SIH Presentation Guide Controller */}
      <GuidedDemoController />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-scale-up text-sm font-bold">
          <CheckCircle2 size={20} className="text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
