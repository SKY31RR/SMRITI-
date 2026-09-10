export type Role = 'PATIENT' | 'CAREGIVER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  patientProfileId?: string;
  caregiverProfileId?: string;
}

export interface MedicationItem {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  timesOfDay: string;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  active: boolean;
  logs?: MedicationLogItem[];
}

export interface MedicationLogItem {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledFor: string;
  takenAt?: string | null;
  status: 'TAKEN' | 'MISSED' | 'PENDING';
  takenByUserId?: string | null;
}

export interface CareTaskItem {
  id: string;
  patientId: string;
  title: string;
  category: string;
  scheduledTime: string;
  recurring: string;
  notes?: string | null;
  active: boolean;
  logs?: TaskLogItem[];
}

export interface TaskLogItem {
  id: string;
  taskId: string;
  patientId: string;
  date: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface AppointmentItem {
  id: string;
  patientId: string;
  title: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  notes?: string | null;
  status: string;
}

export interface CareNoteItem {
  id: string;
  patientId: string;
  caregiverId: string;
  mood: string;
  activity: string;
  tags: string;
  notes: string;
  createdAt: string;
  caregiver?: {
    name: string;
    avatar?: string | null;
  };
}

export interface MemoryPersonItem {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  photoUrl?: string | null;
  description: string;
  contactPhone?: string | null;
  notes?: string | null;
  memories?: MemoryItem[];
}

export interface MemoryItem {
  id: string;
  patientId: string;
  memoryPersonId?: string | null;
  title: string;
  description: string;
  memoryDate?: string | null;
  imageUrl?: string | null;
  memoryPerson?: MemoryPersonItem | null;
}

export interface EmergencyContactItem {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface SafetyAlertItem {
  id: string;
  patientId: string;
  alertType: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'ACKNOWLEDGED';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
