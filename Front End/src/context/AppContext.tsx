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
import { supabaseService, DatabaseHealthReport } from '../services/supabaseService';
import { getSupabaseHost } from '../services/supabaseClient';
import { apiService, BackendRecommendationResult } from '../services/apiService';
import { useAuth } from './AuthContext';

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
  linkedPatients: any[];
  linkPatientWithCode: (code: string, relationship?: string) => Promise<{ success: boolean; message?: string }>;
  
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

  // AI Recommendation
  latestAiRecommendation: BackendRecommendationResult | null;
  refreshAiRecommendation: () => Promise<BackendRecommendationResult | null>;

  // Memory Hub
  people: MemoryPerson[];
  places: MemoryPlace[];
  albums: MemoryAlbumItem[];

  // Offline, Supabase & Demo State
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetDemoData: () => void;

  // Supabase Cloud Database
  dbHealth: DatabaseHealthReport | null;
  isSupabaseSyncing: boolean;
  syncToCloud: () => Promise<void>;
  refreshDbHealth: () => Promise<DatabaseHealthReport>;
}

const defaultAccessibility: AccessibilitySettings = {
  textSize: 'large',
  contrast: 'normal',
  voiceGuidance: true,
  voiceSpeed: 'normal',
  reduceMotion: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, profile } = useAuth();

  // Navigation
  const [userMode, setUserModeState] = useState<UserMode>(role || 'patient');
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
  const [linkedPatients, setLinkedPatients] = useState<any[]>([]);

  // Assessment & Onboarding
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('axiom_onboarded') === 'true';
  });
  const [assessmentAnswers, setAssessmentAnswers] = useState<UserAssessmentAnswers>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(() => {
    return getLatestAssessmentResult('patient-asha-001') || evaluateAssessment({});
  });

  // AI Recommendation
  const [latestAiRecommendation, setLatestAiRecommendation] = useState<BackendRecommendationResult | null>(null);

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

  // Supabase Database State
  const [dbHealth, setDbHealth] = useState<DatabaseHealthReport | null>(null);
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState<boolean>(false);

  // Sync authenticated user context into patient profile
  useEffect(() => {
    if (user) {
      setPatient(prev => ({
        ...prev,
        id: user.id,
        name: profile?.full_name || prev.name,
      }));
    }
    if (role) {
      setUserModeState(role);
    }
  }, [user, role, profile]);

  const refreshDbHealth = async (): Promise<DatabaseHealthReport> => {
    try {
      const health = await supabaseService.checkDatabaseHealth();
      setDbHealth(health);
      return health;
    } catch (err: any) {
      const fallbackReport: DatabaseHealthReport = {
        isConfigured: true,
        isConnected: false,
        host: getSupabaseHost(),
        url: 'https://bhbvuyiiccsujrgsfncn.supabase.co',
        latencyMs: null,
        status: 'offline',
        errorMessage: err.message,
        syncedTables: {
          patients: false,
          assessment_sessions: false,
          game_sessions: false,
          medicines: false,
          routine_items: false,
          alerts: false,
          appointments: false,
        },
      };
      setDbHealth(fallbackReport);
      return fallbackReport;
    }
  };

  // Initial Database Health Check & Sync Setup
  useEffect(() => {
    refreshDbHealth().then(report => {
      if (report.isConnected) {
        console.log(`[Axiom] Connected to Supabase Database at ${report.host} (${report.latencyMs}ms)`);
      }
    });
  }, []);

  // Fetch linked patients if in caregiver mode
  useEffect(() => {
    if (userMode === 'caregiver' && user) {
      apiService.getCaregiverPatients().then(pts => {
        setLinkedPatients(pts);
      });
    }
  }, [userMode, user]);

  const refreshAiRecommendation = async (): Promise<BackendRecommendationResult | null> => {
    const rec = await apiService.getRecommendation(patient.id || 'P001');
    if (rec) {
      setLatestAiRecommendation(rec);
    }
    return rec;
  };

  const linkPatientWithCode = async (code: string, relationship: string = 'Family Caregiver') => {
    try {
      const res = await apiService.linkCaregiverPatient(code, relationship);
      if (res.success) {
        showToast(`Successfully linked to patient: ${res.patient.name}`);
        const updated = await apiService.getCaregiverPatients();
        setLinkedPatients(updated);
        return { success: true, message: `Linked to ${res.patient.name}` };
      } else {
        showToast(res.error || 'Linking failed. Invalid code.');
        return { success: false, message: res.error };
      }
    } catch (err: any) {
      showToast(err.message || 'Error linking patient.');
      return { success: false, message: err.message };
    }
  };

  // Browser online/offline event listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      refreshDbHealth();
      showToast('Back online. Synced with Supabase database.');
    };
    const handleOffline = () => {
      setIsOffline(true);
      refreshDbHealth();
      showToast('Offline mode active. Local-first caching enabled.');
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
      supabaseService.syncPatientProfile(updated).catch(err => {
        console.warn('[Supabase Sync Error]', err);
      });
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

    supabaseService.saveAssessmentSession(patient.id, result, answers).catch(err => {
      console.warn('[Supabase Assessment Sync Error]', err);
    });

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
            const alertItem: AlertItem = {
              id: `alert-${Date.now()}`,
              title: 'Medicine Taken',
              message: `${patient.name} confirmed taking ${med.name} (${med.dosage}) at ${timeString}.`,
              type: 'info',
              timestamp: `Today at ${timeString}`,
              isAcknowledged: false,
              category: 'medication',
            };
            setAlerts(currAlerts => [alertItem, ...currAlerts]);
            supabaseService.createAlert(patient.id, alertItem).catch(console.warn);
          }

          supabaseService.updateMedicineStatus(medId, newState, timeString).catch(console.warn);

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
    const updated = [...medicines, newMed];
    setMedicines(updated);
    showToast(`Added ${newMed.name} to medication schedule.`);
    supabaseService.syncMedicines(patient.id, updated).catch(console.warn);
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
          supabaseService.updateRoutineStatus(itemId, newState, timeString).catch(console.warn);

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
    supabaseService.acknowledgeAlert(alertId).catch(console.warn);
  };

  const addAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
    showToast(`Scheduled appointment with ${apt.doctorName}`);
  };

  // Initial rich history
  const initialHistory: ActivityLogItem[] = [
    {
      id: 'log-1',
      activityId: 'memory-match',
      title: 'Assam Heritage Memory Match',
      date: 'Today, 10:42 AM',
      duration: '2m 14s',
      score: 100,
      accuracyText: '100% (6/6 pairs matched)',
      status: 'Optimal',
    },
    {
      id: 'log-2',
      activityId: 'picture-recall',
      title: 'Daily Objects Recall',
      date: 'Today, 09:15 AM',
      duration: '1m 45s',
      score: 100,
      accuracyText: '100% (4/4 items recalled)',
      status: 'Optimal',
    },
    {
      id: 'log-3',
      activityId: 'attention-finder',
      title: 'Brahmaputra Garden Search',
      date: 'Yesterday, 04:30 PM',
      duration: '2m 05s',
      score: 100,
      accuracyText: '100% (3/3 flowers found)',
      status: 'Optimal',
    },
    {
      id: 'log-4',
      activityId: 'sequence-builder',
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

    const alertItem: AlertItem = {
      id: `alert-act-${Date.now()}`,
      title: 'Cognitive Game Completed',
      message: `${patient.name} completed "${activityTitle}" with ${score}% accuracy at ${timeString}.`,
      type: 'info',
      timestamp: `Today at ${timeString}`,
      isAcknowledged: false,
      category: 'cognition',
      actionLabel: 'Review',
    };

    setAlerts(currAlerts => [alertItem, ...currAlerts]);

    supabaseService.recordGameSession(patient.id, {
      activityId,
      title: activityTitle,
      score,
      duration: formattedDuration,
    }).catch(console.warn);
    supabaseService.createAlert(patient.id, alertItem).catch(console.warn);

    showToast(`Activity recorded (${score}% score)! Caregiver dashboard updated.`);
  };

  const syncToCloud = async () => {
    setIsSupabaseSyncing(true);
    try {
      const res = await supabaseService.syncAllDataToCloud({
        patient,
        medicines,
        routineItems,
        alerts,
        appointments,
      });
      showToast(res.message);
      await refreshDbHealth();
    } catch (err: any) {
      showToast(`Sync error: ${err.message}`);
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  const simulatePatientActions = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMedicines(prev =>
      prev.map((med, idx) =>
        idx < 2 ? { ...med, isTakenToday: true, takenAt: timeString } : med
      )
    );

    setRoutineItems(prev =>
      prev.map((r, idx) =>
        idx < 2 ? { ...r, isCompleted: true, completedAt: timeString } : r
      )
    );

    recordActivityPlay('memory-match', 100, '1m 55s');
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
        linkedPatients,
        linkPatientWithCode,
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
        latestAiRecommendation,
        refreshAiRecommendation,
        people,
        places,
        albums,
        isOffline,
        setIsOffline,
        toastMessage,
        showToast,
        resetDemoData,
        dbHealth,
        isSupabaseSyncing,
        syncToCloud,
        refreshDbHealth,
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
