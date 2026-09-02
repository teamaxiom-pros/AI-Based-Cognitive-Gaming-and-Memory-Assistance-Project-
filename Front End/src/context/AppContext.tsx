import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActivityLogItem,
  AccessibilitySettings,
  AlertItem,
  Appointment,
  AssessmentResult,
  CaregiverProfile,
  CognitiveActivity,
  Language,
  Medicine,
  MemoryAlbumItem,
  MemoryPerson,
  MemoryPlace,
  PatientProfile,
  RoutineItem,
  UserMode,
} from '../types';
import { defaultPatient } from '../data/defaultPatient';
import { caregiverProfiles } from '../data/caregiverData';
import { initialMedicines } from '../data/medicineData';
import { initialRoutineItems } from '../data/routineData';
import { initialAlerts } from '../data/alertsData';
import { initialAppointments } from '../data/appointmentsData';
import { cognitiveActivities } from '../data/activitiesData';
import { memoryAlbums, memoryPeople, memoryPlaces } from '../data/memoryData';
import { translations, getNestedTranslation, formatString } from '../i18n/useTranslation';
import { evaluateAssessment, getLatestAssessmentResult } from '../services/assessmentEngine';
import { UserAssessmentAnswers } from '../types';
import { speechService } from '../services/speechService';

interface AppContextType {
  // Mode & Navigation
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  currentRoute: string;
  navigate: (route: string) => void;
  
  // Localization & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;

  // Accessibility
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;

  // Profiles
  patient: PatientProfile;
  updatePatient: (data: Partial<PatientProfile>) => void;
  caregivers: CaregiverProfile[];
  
  // Onboarding & Assessment
  onboardingCompleted: boolean;
  setOnboardingCompleted: (val: boolean) => void;
  assessmentAnswers: UserAssessmentAnswers;
  setAssessmentAnswers: React.Dispatch<React.SetStateAction<UserAssessmentAnswers>>;
  assessmentResult: AssessmentResult | null;
  setAssessmentResult: React.Dispatch<React.SetStateAction<AssessmentResult | null>>;
  submitAssessment: (answers: UserAssessmentAnswers) => AssessmentResult;

  // Daily Features State
  medicines: Medicine[];
  toggleMedicineTaken: (medId: string) => void;
  addMedicine: (med: Omit<Medicine, 'id' | 'isTakenToday' | 'history7Days'>) => void;

  routineItems: RoutineItem[];
  toggleRoutineItem: (itemId: string) => void;

  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;

  appointments: Appointment[];
  addAppointment: (apt: Appointment) => void;

  // Activities & Games
  activities: CognitiveActivity[];
  activityHistory: ActivityLogItem[];
  recordActivityPlay: (activityId: string, score: number, duration?: string | number) => void;
  simulatePatientActions: () => void;

  // Memory Hub
  people: MemoryPerson[];
  places: MemoryPlace[];
  albums: MemoryAlbumItem[];

  // Offline & Demo State
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetDemoData: () => void;
}

const defaultAccessibility: AccessibilitySettings = {
  textSize: 'large', // Default to large for elderly comfort
  contrast: 'normal',
  voiceGuidance: true,
  voiceSpeed: 'normal',
  reduceMotion: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [userMode, setUserModeState] = useState<UserMode>('patient');
  const [currentRoute, setCurrentRoute] = useState<string>('/welcome');

  // i18n
  const [language, setLanguageState] = useState<Language>('en');

  // Accessibility
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('axiom_accessibility');
    return saved ? JSON.parse(saved) : defaultAccessibility;
  });

  // Patient & Caregiver
  const [patient, setPatient] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('axiom_patient');
    return saved ? JSON.parse(saved) : defaultPatient;
  });
  const [caregivers] = useState<CaregiverProfile[]>(caregiverProfiles);

  // Assessment & Onboarding
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('axiom_onboarded') === 'true';
  });
  const [assessmentAnswers, setAssessmentAnswers] = useState<UserAssessmentAnswers>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(() => {
    return getLatestAssessmentResult('patient-asha-001') || evaluateAssessment({});
  });

  // Data layers
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>(initialRoutineItems);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [activities, setActivities] = useState<CognitiveActivity[]>(cognitiveActivities);
  const [people] = useState<MemoryPerson[]>(memoryPeople);
  const [places] = useState<MemoryPlace[]>(memoryPlaces);
  const [albums] = useState<MemoryAlbumItem[]>(memoryAlbums);

  // Offline & Toast
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Browser online/offline event listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online. Synced your recent activities.');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Offline mode active. All games and memories are accessible.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const navigate = (route: string) => {
    speechService.stop();
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setUserMode = (mode: UserMode) => {
    setUserModeState(mode);
    if (mode === 'caregiver') {
      setCurrentRoute('/caregiver/dashboard');
    } else {
      setCurrentRoute(onboardingCompleted ? '/home' : '/welcome');
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setPatient(prev => ({ ...prev, language: lang }));
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = translations[language] || translations.en;
    const fallbackDict = translations.en;
    let template = getNestedTranslation(currentDict, key);
    if (template === key) {
      template = getNestedTranslation(fallbackDict, key);
    }
    return formatString(template, params);
  };

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibility(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem('axiom_accessibility', JSON.stringify(updated));
      return updated;
    });
  };

  const speakText = (text: string) => {
    if (accessibility.voiceGuidance) {
      speechService.speak(text, language, accessibility.voiceSpeed);
    }
  };

  const stopSpeech = () => {
    speechService.stop();
  };

  const updatePatient = (data: Partial<PatientProfile>) => {
    setPatient(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('axiom_patient', JSON.stringify(updated));
      return updated;
    });
  };

  const submitAssessment = (answers: UserAssessmentAnswers): AssessmentResult => {
    const result = evaluateAssessment(answers);
    setAssessmentResult(result);
    localStorage.setItem('axiom_assessment_result_v2', JSON.stringify(result));
    localStorage.setItem('axiom_assessment_result', JSON.stringify(result));
    setOnboardingCompleted(true);
    localStorage.setItem('axiom_onboarded', 'true');
    return result;
  };

  const toggleMedicineTaken = (medId: string) => {
    setMedicines(prev =>
      prev.map(med => {
        if (med.id === medId) {
          const newState = !med.isTakenToday;
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (newState) {
            showToast(`Marked ${med.name} as taken!`);
            // Add alert for caregiver
            setAlerts(currAlerts => [
              {
                id: `alert-${Date.now()}`,
                title: 'Medicine Taken',
                message: `${patient.name} confirmed taking ${med.name} (${med.dosage}) at ${timeString}.`,
                type: 'info',
                timestamp: `Today at ${timeString}`,
                isAcknowledged: false,
                category: 'medication',
              },
              ...currAlerts,
            ]);
          }
          return {
            ...med,
            isTakenToday: newState,
            takenAt: newState ? timeString : undefined,
          };
        }
        return med;
      })
    );
  };

  const addMedicine = (med: Omit<Medicine, 'id' | 'isTakenToday' | 'history7Days'>) => {
    const newMed: Medicine = {
      ...med,
      id: `med-${Date.now()}`,
      isTakenToday: false,
      history7Days: [true, true, true, true, true, true, false],
    };
    setMedicines(prev => [...prev, newMed]);
    showToast(`Added ${newMed.name} to medication schedule.`);
  };

  const toggleRoutineItem = (itemId: string) => {
    setRoutineItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newState = !item.isCompleted;
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (newState) {
            showToast(`Completed: ${item.title}`);
          }
          return {
            ...item,
            isCompleted: newState,
            completedAt: newState ? timeString : undefined,
          };
        }
        return item;
      })
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, isAcknowledged: true } : a))
    );
    showToast('Alert acknowledged.');
  };

  const addAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
    showToast(`Scheduled appointment with ${apt.doctorName}`);
  };

  // Initial rich history
  const initialHistory: ActivityLogItem[] = [
    {
      id: 'log-1',
      activityId: 'game-memory-match',
      title: 'Assam Heritage Memory Match',
      date: 'Today, 10:42 AM',
      duration: '2m 14s',
      score: 100,
      accuracyText: '100% (6/6 pairs matched)',
      status: 'Optimal',
    },
    {
      id: 'log-2',
      activityId: 'game-object-recall',
      title: 'Daily Objects Recall',
      date: 'Today, 09:15 AM',
      duration: '1m 45s',
      score: 100,
      accuracyText: '100% (4/4 items recalled)',
      status: 'Optimal',
    },
    {
      id: 'log-3',
      activityId: 'game-attention-search',
      title: 'Brahmaputra Garden Search',
      date: 'Yesterday, 04:30 PM',
      duration: '2m 05s',
      score: 100,
      accuracyText: '100% (3/3 flowers found)',
      status: 'Optimal',
    },
    {
      id: 'log-4',
      activityId: 'game-pattern-sequence',
      title: 'Pattern & Shape Sequence',
      date: 'Yesterday, 11:20 AM',
      duration: '3m 10s',
      score: 85,
      accuracyText: '85% (Rhythm completion)',
      status: 'Good',
    },
  ];

  const [activityHistory, setActivityHistory] = useState<ActivityLogItem[]>(() => {
    const saved = localStorage.getItem('axiom_activity_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  const recordActivityPlay = (
    activityId: string,
    score: number,
    duration: string | number = '2m 05s'
  ) => {
    setActivities(prev =>
      prev.map(act => (act.id === activityId ? { ...act, playsCount: act.playsCount + 1 } : act))
    );

    const formattedDuration =
      typeof duration === 'number'
        ? `${Math.floor(duration / 60)}m ${duration % 60}s`
        : duration;

    const activityTitle =
      activities.find(a => a.id === activityId)?.title || 'Assam Heritage Cognitive Game';
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      activityId,
      title: activityTitle,
      date: `Today, ${timeString}`,
      duration: formattedDuration,
      score,
      accuracyText: `${score}% Accuracy achieved`,
      status: score >= 90 ? 'Optimal' : score >= 75 ? 'Good' : 'Needs Practice',
    };

    setActivityHistory(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('axiom_activity_history', JSON.stringify(updated));
      return updated;
    });

    // Add caregiver notification
    setAlerts(currAlerts => [
      {
        id: `alert-act-${Date.now()}`,
        title: 'Cognitive Game Completed',
        message: `${patient.name} completed "${activityTitle}" with ${score}% accuracy at ${timeString}.`,
        type: 'info',
        timestamp: `Today at ${timeString}`,
        isAcknowledged: false,
        category: 'cognition',
        actionLabel: 'Review',
      },
      ...currAlerts,
    ]);

    showToast(`Activity recorded (${score}% score)! Caregiver dashboard updated.`);
  };

  const simulatePatientActions = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Mark first 2 medicines taken
    setMedicines(prev =>
      prev.map((med, idx) =>
        idx < 2 ? { ...med, isTakenToday: true, takenAt: timeString } : med
      )
    );

    // Mark first 2 routines done
    setRoutineItems(prev =>
      prev.map((r, idx) =>
        idx < 2 ? { ...r, isCompleted: true, completedAt: timeString } : r
      )
    );

    // Record game play
    recordActivityPlay('game-memory-match', 100, '1m 55s');

    showToast('Simulated: Asha completed game, took medicines, and finished morning routine!');
  };

  const resetDemoData = () => {
    localStorage.clear();
    setPatient(defaultPatient);
    setMedicines(initialMedicines);
    setRoutineItems(initialRoutineItems);
    setAlerts(initialAlerts);
    setAppointments(initialAppointments);
    setActivities(cognitiveActivities);
    setAccessibility(defaultAccessibility);
    setAssessmentResult(evaluateAssessment({}));
    setOnboardingCompleted(false);
    setCurrentRoute('/welcome');
    showToast('Reset to initial demo state!');
  };

  return (
    <AppContext.Provider
      value={{
        userMode,
        setUserMode,
        currentRoute,
        navigate,
        language,
        setLanguage,
        t,
        accessibility,
        updateAccessibility,
        speakText,
        stopSpeech,
        patient,
        updatePatient,
        caregivers,
        onboardingCompleted,
        setOnboardingCompleted,
        assessmentAnswers,
        setAssessmentAnswers,
        assessmentResult,
        setAssessmentResult,
        submitAssessment,
        medicines,
        toggleMedicineTaken,
        addMedicine,
        routineItems,
        toggleRoutineItem,
        alerts,
        acknowledgeAlert,
        appointments,
        addAppointment,
        activities,
        activityHistory,
        recordActivityPlay,
        simulatePatientActions,
        people,
        places,
        albums,
        isOffline,
        setIsOffline,
        toastMessage,
        showToast,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
