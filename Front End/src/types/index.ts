export type Language = 'en' | 'as' | 'bn' | 'hi';

export type UserMode = 'patient' | 'caregiver';

export type TextSize = 'normal' | 'large' | 'xlarge';
export type ContrastMode = 'normal' | 'high';
export type VoiceSpeed = 'slow' | 'normal';

export interface AccessibilitySettings {
  textSize: TextSize;
  contrast: ContrastMode;
  voiceGuidance: boolean;
  voiceSpeed: VoiceSpeed;
  reduceMotion: boolean;
}

export type GenderOption = 'Female' | 'Male' | 'Non-binary / Other' | 'Prefer not to say';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: GenderOption;
  location: string;
  region: string; // e.g. "Guwahati, Assam (NER)"
  photoUrl: string; // Active avatar / photo URL
  avatarId?: string;
  customPhotoUploaded?: boolean;
  language: Language;
  interests: string[];
  cognitiveBaseline: string; // e.g. "Mild Cognitive Support"
  joinedDate: string;
  primaryCaregiverId: string;
  inviteCode?: string;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  photoUrl: string;
  patientIds: string[];
  role: 'Family Caregiver' | 'Clinical Specialist' | 'Nurse';
}

export type CognitiveDomain = 'orientation' | 'memory' | 'attention' | 'recognition' | 'sequencing' | 'recall' | 'executive_function' | 'processing_speed';

export interface AssessmentQuestion {
  id: string;
  domain: CognitiveDomain;
  taskTitle: string;
  instruction: string;
  audioPromptText: string;
  difficultyWeight: number; // 1 = Easy, 2 = Medium, 3 = Hard
  type: 'multiple-choice' | 'memorize' | 'find-object' | 'sequence-choice' | 'multi-select';
  options?: { id: string; label: string; icon?: string; image?: string; isCorrect?: boolean }[];
  correctAnswers?: string[];
  expectedOptionId?: string;
  memorizeItems?: { name: string; icon: string; image?: string; description?: string }[];
  targetItem?: string;
  distractors?: { id: string; name: string; icon: string; isTarget?: boolean }[];
  sequenceItems?: { name: string; icon: string }[];
  hint?: string;
}

export interface UserAssessmentAnswers {
  orientationSelected?: string;
  locationSelected?: string;
  memorizeCompleted?: boolean;
  attentionFound?: boolean;
  attentionTimeSeconds?: number;
  sequencingSelected?: string;
  recognitionSelected?: string;
  recallSelected?: string[];
}

export interface AssessmentTaskResponse {
  taskId: string;
  domain: string;
  taskTitle?: string;
  taskType?: string;
  question?: string;
  difficultyWeight?: number;
  expectedAnswer?: any;
  patientAnswer?: any;
  isCorrect?: boolean;
  score?: number; // 0 to 100
  responseTimeMs?: number;
  hintsUsed?: number;
  skipped?: boolean;
  timestamp?: string;
}

export interface CognitiveScore {
  domain: string;
  score: number; // 0 to 100 calculated from real responses
  status: 'Strong' | 'Good' | 'Needs Practice' | 'Developing';
  recommendation: string;
  taskCount: number;
  correctCount: number;
  averageResponseTimeMs: number;
}

export interface AssessmentSession {
  sessionId: string;
  sessionNumber: number;
  patientId: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  overallScore: number;
  domainScores: Record<string, CognitiveScore>;
  taskResponses: AssessmentTaskResponse[];
  aiSummary: string;
  recommendedActivities: string[];
  clinicalNotes: string;
}

export interface AssessmentResult {
  sessionId?: string;
  patientId?: string;
  completedAt: string;
  overallScore: number;
  focusDomain?: string;
  domainScores: Record<string, CognitiveScore>;
  aiSummary: string;
  recommendedActivities: string[];
  clinicalNotes: string;
  taskResponses?: AssessmentTaskResponse[];
  rawAiBaseline?: Record<string, any>;
}

export interface CognitiveActivity {
  id: string;
  title: string;
  category: CognitiveDomain;
  description: string;
  estimatedMinutes: number;
  difficulty: 'Gentle' | 'Standard' | 'Challenging';
  icon: string;
  badge?: string;
  color: string;
  recommendedFor?: string;
  playsCount: number;
}

export interface MemoryPerson {
  id: string;
  name: string;
  relationship: string;
  photoUrl: string;
  phone: string;
  location: string;
  voiceNoteUrl?: string;
  audioTranscription: string;
  notes: string;
  recentInteraction: string;
}

export interface MemoryPlace {
  id: string;
  name: string;
  location: string;
  photoUrl: string;
  description: string;
  significance: string;
  audioTranscription: string;
}

export interface MemoryAlbumItem {
  id: string;
  title: string;
  year: string;
  photoUrl: string;
  description: string;
  tags: string[];
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string; // e.g. "Take 1 tablet after breakfast"
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  schedule?: string;
  time: string; // "09:00 AM"
  purpose: string; // "Blood Pressure"
  pillColor: string;
  pillShape: string;
  isTakenToday: boolean;
  takenAt?: string;
  history7Days: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export interface RoutineItem {
  id: string;
  title: string;
  time: string;
  timeBlock: 'Morning' | 'Afternoon' | 'Evening';
  icon: string;
  isCompleted: boolean;
  description: string;
  completedAt?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'warning' | 'urgent';
  timestamp: string;
  isAcknowledged: boolean;
  category: 'medication' | 'routine' | 'cognition' | 'appointment';
  actionLabel?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  dateTime: string;
  time: string;
  notes: string;
  reminderEnabled: boolean;
  location: string;
}

export interface ActivityLogItem {
  id: string;
  activityId: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  accuracyText: string;
  status: 'Optimal' | 'Good' | 'Needs Practice';
}
