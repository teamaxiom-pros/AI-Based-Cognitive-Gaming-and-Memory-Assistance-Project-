import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActivityLogItem,
  AccessibilitySettings,
  AlertItem,
  Appointment,
  AssessmentResult,
  AssessmentSession,
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
import { evaluateAssessment, getLatestAssessmentResult, getAssessmentSessions } from '../services/assessmentEngine';
import { UserAssessmentAnswers } from '../types';
import { speechService } from '../services/speechService';
import { supabaseService, DatabaseHealthReport } from '../services/supabaseService';
import { getSupabaseHost } from '../services/supabaseClient';
import { apiService, BackendRecommendationResult } from '../services/apiService';
import { offlineSyncService } from '../services/offlineSyncService';
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

  // Accessibility & Simple Elderly Mode
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  isSimpleElderlyMode: boolean;
  toggleSimpleElderlyMode: () => void;
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
  assessmentSessions: AssessmentSession[];
  submitAssessment: (answers: UserAssessmentAnswers) => AssessmentResult;
  saveAssessmentSession: (result: AssessmentResult) => Promise<void>;

  // Daily Features State
  medicines: Medicine[];
  toggleMedicineTaken: (medId: string) => void;
  addMedicine: (med: Omit<Medicine, 'id' | 'isTakenToday' | 'history7Days'>) => void;

  routineItems: RoutineItem[];
  toggleRoutineItem: (itemId: string) => void;
  toggleRoutineCompleted: (itemId: string) => void;

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
  pendingSyncCount: number;
  isOfflineSyncing: boolean;
  flushOfflineQueue: () => Promise<void>;
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
  simpleElderlyMode: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, profile } = useAuth();

  // Navigation
  const [userMode, setUserModeState] = useState<UserMode>(role || 'patient');
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // i18n & Persistent Language Choice
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axiom_language');
      if (saved === 'as' || saved === 'bn' || saved === 'hi' || saved === 'en') {
        return saved;
      }
    }
    return 'en';
  });

  // Accessibility
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axiom_accessibility');
      return saved ? JSON.parse(saved) : defaultAccessibility;
    }
    return defaultAccessibility;
  });

  // Patient & Caregiver
  const [patient, setPatient] = useState<PatientProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axiom_patient');
      return saved ? JSON.parse(saved) : defaultPatient;
    }
    return defaultPatient;
  });
  const [caregivers] = useState<CaregiverProfile[]>(caregiverProfiles);
  const [linkedPatients, setLinkedPatients] = useState<any[]>([]);

  // Assessment & Onboarding
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('axiom_onboarded') === 'true';
    }
    return false;
  });
  const [assessmentAnswers, setAssessmentAnswers] = useState<UserAssessmentAnswers>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(() => {
    return getLatestAssessmentResult('patient-asha-001') || evaluateAssessment({});
  });
  const [assessmentSessions, setAssessmentSessions] = useState<AssessmentSession[]>(() => {
    return getAssessmentSessions(patient.id || 'patient-asha-001');
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

  // Offline & Toast State
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => offlineSyncService.getPendingCount());
  const [isOfflineSyncing, setIsOfflineSyncing] = useState<boolean>(false);
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
    if (isOffline) {
      return null;
    }
    const rec = await apiService.getRecommendation(patient.id || 'P001');
    if (rec) {
      setLatestAiRecommendation(rec);
    }
    return rec;
  };

  const flushOfflineQueue = async () => {
    if (!navigator.onLine) return;
    setIsOfflineSyncing(true);
    const result = await offlineSyncService.flush();
    setPendingSyncCount(result.remainingCount);
    setIsOfflineSyncing(false);
    if (result.successCount > 0) {
      showToast(t('common.syncedSuccess'));
      await refreshDbHealth();
    }
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

  // Browser online/offline event listener & automatic sync queue flush
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      refreshDbHealth();
      flushOfflineQueue();
      showToast(t('common.backOnline'));
    };
    const handleOffline = () => {
      setIsOffline(true);
      refreshDbHealth();
      showToast(t('common.offlineNotice'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const navigate = (route: string) => {
    speechService.stop();
    setCurrentRoute(route);
    if (typeof window !== 'undefined' && window.location.pathname !== route) {
      window.history.pushState({}, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setUserMode = (mode: UserMode) => {
    setUserModeState(mode);
    if (mode === 'caregiver') {
      navigate('/caregiver/dashboard');
    } else {
      navigate('/home');
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('axiom_language', lang);
    }
    setPatient(prev => {
      const updated = { ...prev, language: lang };
      localStorage.setItem('axiom_patient', JSON.stringify(updated));
      return updated;
    });
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

  const isSimpleElderlyMode = Boolean(accessibility.simpleElderlyMode);
  const toggleSimpleElderlyMode = () => {
    updateAccessibility({ simpleElderlyMode: !accessibility.simpleElderlyMode });
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
      if (!isOffline) {
        supabaseService.syncPatientProfile(updated).catch(() => {
          offlineSyncService.enqueue('patient_profile', updated);
          setPendingSyncCount(offlineSyncService.getPendingCount());
        });
      } else {
        offlineSyncService.enqueue('patient_profile', updated);
        setPendingSyncCount(offlineSyncService.getPendingCount());
      }
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

    // Update session history
    const newSession: AssessmentSession = {
      sessionId: result.sessionId || `session-${Date.now()}`,
      sessionNumber: assessmentSessions.length + 1,
      patientId: patient.id,
      startTime: new Date(Date.now() - 180000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: 180,
      overallScore: result.overallScore,
      focusDomain: result.focusDomain,
      domainScores: result.domainScores,
      taskResponses: result.taskResponses || [],
      aiSummary: result.aiSummary,
      recommendedActivities: result.recommendedActivities,
      clinicalNotes: result.clinicalNotes,
    };
    const updatedSessions = [newSession, ...assessmentSessions];
    setAssessmentSessions(updatedSessions);
    localStorage.setItem(`axiom_assessment_sessions_${patient.id}`, JSON.stringify(updatedSessions));

    if (!isOffline) {
      supabaseService.saveAssessmentSession(patient.id, result, answers).catch(() => {
        offlineSyncService.enqueue('assessment_session', { patientId: patient.id, result, answers });
        setPendingSyncCount(offlineSyncService.getPendingCount());
      });
    } else {
      offlineSyncService.enqueue('assessment_session', { patientId: patient.id, result, answers });
      setPendingSyncCount(offlineSyncService.getPendingCount());
    }

    return result;
  };

  const saveAssessmentSession = async (result: AssessmentResult): Promise<void> => {
    setAssessmentResult(result);
    localStorage.setItem('axiom_assessment_result_v2', JSON.stringify(result));
    localStorage.setItem('axiom_assessment_result', JSON.stringify(result));
    setOnboardingCompleted(true);
    localStorage.setItem('axiom_onboarded', 'true');

    const newSession: AssessmentSession = {
      id: result.sessionId || `session-${Date.now()}`,
      sessionId: result.sessionId || `session-${Date.now()}`,
      sessionNumber: assessmentSessions.length + 1,
      patientId: patient.id,
      date: result.completedAt || new Date().toISOString(),
      startTime: new Date(Date.now() - 180000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: 180,
      overallScore: result.overallScore,
      focusDomain: result.focusDomain,
      recommendedActivity: result.recommendedActivity,
      recommendedDifficulty: result.recommendedDifficulty,
      domainScores: result.domainScores,
      taskResponses: result.taskResponses || [],
      aiSummary: result.aiSummary,
      recommendedActivities: result.recommendedActivities,
      clinicalNotes: result.clinicalNotes,
    };
    const updatedSessions = [newSession, ...assessmentSessions];
    setAssessmentSessions(updatedSessions);
    localStorage.setItem(`axiom_assessment_sessions_${patient.id}`, JSON.stringify(updatedSessions));

    if (!isOffline) {
      supabaseService.saveAssessmentSession(patient.id, result, {}).catch(() => {
        offlineSyncService.enqueue('assessment_session', { patientId: patient.id, result, answers: {} });
        setPendingSyncCount(offlineSyncService.getPendingCount());
      });
    } else {
      offlineSyncService.enqueue('assessment_session', { patientId: patient.id, result, answers: {} });
      setPendingSyncCount(offlineSyncService.getPendingCount());
    }
  };

  const toggleRoutineCompleted = (itemId: string) => {
    toggleRoutineItem(itemId);
  };

  const toggleMedicineTaken = (medId: string) => {
    setMedicines(prev =>
      prev.map(med => {
        if (med.id === medId) {
          const newState = !med.isTakenToday;
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (newState) {
            showToast(`${med.name}: ${t('medicines.markedTaken')}`);
            const alertItem: AlertItem = {
              id: `alert-${Date.now()}`,
              title: t('caregiver.alertTypeMedication'),
              message: `${patient.name} - ${med.name} (${med.dosage}) at ${timeString}.`,
              type: 'info',
              timestamp: `Today at ${timeString}`,
              isAcknowledged: false,
              category: 'medication',
            };
            setAlerts(currAlerts => [alertItem, ...currAlerts]);
            if (!isOffline) {
              supabaseService.createAlert(patient.id, alertItem).catch(console.warn);
            } else {
              offlineSyncService.enqueue('alert_create', { patientId: patient.id, alert: alertItem });
            }
          }

          if (!isOffline) {
            supabaseService.updateMedicineStatus(medId, newState, timeString).catch(() => {
              offlineSyncService.enqueue('medicine_status', { medId, isTaken: newState, takenAt: timeString });
              setPendingSyncCount(offlineSyncService.getPendingCount());
            });
          } else {
            offlineSyncService.enqueue('medicine_status', { medId, isTaken: newState, takenAt: timeString });
            setPendingSyncCount(offlineSyncService.getPendingCount());
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
    const updated = [...medicines, newMed];
    setMedicines(updated);
    showToast(`${newMed.name}`);
    supabaseService.syncMedicines(patient.id, updated).catch(console.warn);
  };

  const toggleRoutineItem = (itemId: string) => {
    setRoutineItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newState = !item.isCompleted;
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (newState) {
            showToast(`${item.title}: ${t('routine.markedComplete')}`);
          }

          if (!isOffline) {
            supabaseService.updateRoutineStatus(itemId, newState, timeString).catch(() => {
              offlineSyncService.enqueue('routine_status', { itemId, isCompleted: newState, completedAt: timeString });
              setPendingSyncCount(offlineSyncService.getPendingCount());
            });
          } else {
            offlineSyncService.enqueue('routine_status', { itemId, isCompleted: newState, completedAt: timeString });
            setPendingSyncCount(offlineSyncService.getPendingCount());
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
    showToast(t('common.done'));
    supabaseService.acknowledgeAlert(alertId).catch(console.warn);
  };

  const addAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
    showToast(`${apt.doctorName}`);
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
      accuracyText: '100% Accuracy',
      status: 'Optimal',
    },
    {
      id: 'log-2',
      activityId: 'picture-recall',
      title: 'Daily Objects Recall',
      date: 'Today, 09:15 AM',
      duration: '1m 45s',
      score: 100,
      accuracyText: '100% Accuracy',
      status: 'Optimal',
    },
    {
      id: 'log-3',
      activityId: 'attention-finder',
      title: 'Visual Attention Search',
      date: 'Yesterday, 04:30 PM',
      duration: '2m 05s',
      score: 100,
      accuracyText: '100% Accuracy',
      status: 'Optimal',
    },
    {
      id: 'log-4',
      activityId: 'sequence-builder',
      title: 'Pattern & Shape Sequence',
      date: 'Yesterday, 11:20 AM',
      duration: '3m 10s',
      score: 85,
      accuracyText: '85% Accuracy',
      status: 'Good',
    },
  ];

  const [activityHistory, setActivityHistory] = useState<ActivityLogItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('axiom_activity_history');
      return saved ? JSON.parse(saved) : initialHistory;
    }
    return initialHistory;
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
      accuracyText: `${score}% Accuracy`,
      status: score >= 90 ? 'Optimal' : score >= 75 ? 'Good' : 'Needs Practice',
    };

    setActivityHistory(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('axiom_activity_history', JSON.stringify(updated));
      return updated;
    });

    const alertItem: AlertItem = {
      id: `alert-act-${Date.now()}`,
      title: t('caregiver.alertTypePerformance'),
      message: `${patient.name} completed "${activityTitle}" with ${score}% accuracy at ${timeString}.`,
      type: 'info',
      timestamp: `Today at ${timeString}`,
      isAcknowledged: false,
      category: 'cognition',
      actionLabel: 'Review',
    };

    setAlerts(currAlerts => [alertItem, ...currAlerts]);

    const sessionPayload = {
      activityId,
      title: activityTitle,
      score,
      duration: formattedDuration,
    };

    if (!isOffline) {
      supabaseService.recordGameSession(patient.id, sessionPayload).catch(() => {
        offlineSyncService.enqueue('game_session', { patientId: patient.id, session: sessionPayload });
        setPendingSyncCount(offlineSyncService.getPendingCount());
      });
      supabaseService.createAlert(patient.id, alertItem).catch(console.warn);
    } else {
      offlineSyncService.enqueue('game_session', { patientId: patient.id, session: sessionPayload });
      offlineSyncService.enqueue('alert_create', { patientId: patient.id, alert: alertItem });
      setPendingSyncCount(offlineSyncService.getPendingCount());
    }

    showToast(`Activity recorded (${score}% score)!`);
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
      await flushOfflineQueue();
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
    showToast('Simulated: Patient completed game, took medicines, and finished morning routine!');
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
    setAssessmentSessions([]);
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
        isSimpleElderlyMode,
        toggleSimpleElderlyMode,
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
        assessmentSessions,
        submitAssessment,
        saveAssessmentSession,
        medicines,
        toggleMedicineTaken,
        addMedicine,
        routineItems,
        toggleRoutineItem,
        toggleRoutineCompleted,
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
        pendingSyncCount,
        isOfflineSyncing,
        flushOfflineQueue,
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
