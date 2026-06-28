export interface OnboardingData {
  wakeTime: string; // e.g., "07:00"
  sleepTime: string; // e.g., "23:00"
  workHours: string; // e.g., "9:00-17:00"
  studyHours: number; // e.g., 4
  preferences: string[]; // e.g., ["Visual Planner", "Heavy Accountability", "Supportive Gamification"]
  goalsText: string;
  deadlineDate: string;
  enableReminders?: boolean;
}

export interface UserProfile {
  username: string;
  email?: string;
  name: string;
  phoneNumber?: string;
  whatsappEnabled?: boolean;
  isOnboarded: boolean;
  onboarding?: OnboardingData;
  xp: number;
  level: number;
  streak: number;
  productivityScore: number; // 0-100
  focusHours: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  active?: boolean;
  locked?: boolean;
  failedLoginAttempts?: number;
  lockUntil?: number | null;
  passwordHash?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  durationMinutes: number;
  scheduledTime: string; // e.g., "10:00"
  status: 'pending' | 'completed' | 'missed' | 'postponed';
  postponementCount: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  successProbability: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  delayRisk: number; // 0-100
  category: string; // e.g., "Student", "Job Seeker", "Freelancer"
  subtasks: SubTask[];
  completed?: boolean;
}

export interface ExcuseLog {
  id: string;
  excuse: string;
  aiResponse: string;
  timestamp: string;
  goalTitle: string;
  consequence: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'humor' | 'warning' | 'recovery' | 'info';
  timestamp: string;
  whatsappTemplate?: string;
  emailTemplate?: string;
  pushChannel?: string;
}

export interface DBState {
  profile: UserProfile;
  goals: Goal[];
  excuseLogs: ExcuseLog[];
  notifications: AppNotification[];
  lastUpdate: string;
}
