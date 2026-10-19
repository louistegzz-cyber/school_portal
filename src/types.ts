export type Role = 'admin' | 'teacher' | 'student' | 'parent';

export const CLASSES = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'] as const;
export type ClassName = (typeof CLASSES)[number];

export const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;
export type Term = (typeof TERMS)[number];

export type GradeBand = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: 'Male' | 'Female';
  className: ClassName;
  dateOfBirth: string;
  parentId: string;
  photoColor: string;
  enrolledAt: string;
  active: boolean;
  feeBalance: number;
  feeTotal: number;
}

export interface Teacher {
  id: string;
  staffNo: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  subjects: string[];
  classes: ClassName[];
  hiredAt: string;
  active: boolean;
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  childIds: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  className: ClassName;
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedBy: string;
}

export interface ScoreEntry {
  studentId: string;
  ca1: number; // 20
  ca2: number; // 20
  exam: number; // 60
}

export interface ResultRecord {
  id: string;
  studentId: string;
  subjectId: string;
  className: ClassName;
  term: Term;
  session: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: GradeBand;
  remark: string;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  teacherId: string;
  position?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  className: ClassName;
  teacherId: string;
  dueDate: string;
  createdAt: string;
  term: Term;
  session: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'staff' | 'students' | 'parents' | ClassName;
  createdAt: string;
  authorId: string;
  priority: 'normal' | 'high';
}

export interface TimetableSlot {
  id: string;
  className: ClassName;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1-8
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Transfer' | 'POS' | 'Online';
  reference: string;
  term: Term;
  session: string;
  description: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  category: 'students' | 'results' | 'finance' | 'attendance' | 'system';
}

export interface Session {
  id: string;
  name: string; // e.g. "2025/2026"
  active: boolean;
  currentTerm: Term;
}

export interface AppSettings {
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  logoText: string;
  primaryColor: string;
}

export interface DemoUser {
  id: string;
  role: Role;
  name: string;
  refId: string; // links to teacher/student/parent
  avatarColor: string;
}
