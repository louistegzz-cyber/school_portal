import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as seed from './data/seed';
import type {
  Student,
  Teacher,
  Parent,
  ResultRecord,
  AttendanceRecord,
  Assignment,
  Announcement,
  TimetableSlot,
  Payment,
  ActivityLog,
  Session,
  AppSettings,
  DemoUser,
  Role,
  ClassName,
  Term,
} from './types';

const STORAGE_KEY = '001_portal_state_v1';

interface PersistShape {
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  results: ResultRecord[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  announcements: Announcement[];
  timetable: TimetableSlot[];
  payments: Payment[];
  activityLogs: ActivityLog[];
  sessions: Session[];
  settings: AppSettings;
}

interface StoreState extends PersistShape {
  currentUser: DemoUser | null;
  currentSession: string;
  currentTerm: Term;
  switchRole: (role: Role) => void;
  logout: () => void;
  // mutations
  addStudent: (s: Omit<Student, 'id' | 'photoColor'>) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  toggleStudentActive: (id: string) => void;
  addTeacher: (t: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  addAnnouncement: (a: Omit<Announcement, 'id' | 'createdAt' | 'authorId'>) => void;
  addAssignment: (a: Omit<Assignment, 'id' | 'createdAt' | 'teacherId' | 'term' | 'session'>) => void;
  recordAttendance: (date: string, className: ClassName, entries: { studentId: string; status: AttendanceRecord['status'] }[], byTeacherId: string) => void;
  saveScores: (records: { studentId: string; subjectId: string; ca1: number; ca2: number; exam: number; className: ClassName }[], teacherId: string) => void;
  setResultStatus: (ids: string[], status: ResultRecord['status']) => void;
  promoteStudents: (mappings: { studentId: string; fromClass: ClassName; toClass: ClassName | 'Graduated' }[]) => void;
  recordPayment: (studentId: string, amount: number, method: Payment['method'], description: string) => void;
  addActivity: (action: string, category: ActivityLog['category']) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setCurrentTerm: (term: Term) => void;
  setCurrentSession: (name: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

function loadState(): PersistShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

function persist(state: PersistShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const PHOTO_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#ca8a04', '#dc2626', '#4f46e5'];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [students, setStudents] = useState<Student[]>(seed.STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(seed.TEACHERS);
  const [parents, setParents] = useState<Parent[]>(seed.PARENTS);
  const [results, setResults] = useState<ResultRecord[]>(seed.RESULTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(seed.ATTENDANCE);
  const [assignments, setAssignments] = useState<Assignment[]>(seed.ASSIGNMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(seed.ANNOUNCEMENTS);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(seed.TIMETABLE);
  const [payments, setPayments] = useState<Payment[]>(seed.PAYMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(seed.ACTIVITY_LOGS);
  const [sessions, setSessions] = useState<Session[]>(seed.SESSIONS);
  const [settings, setSettings] = useState<AppSettings>(seed.SETTINGS);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [currentSession, setCurrentSessionState] = useState<string>(seed.CURRENT_SESSION);
  const [currentTerm, setCurrentTermState] = useState<Term>(seed.CURRENT_TERM);

  // hydrate once
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setStudents(saved.students ?? seed.STUDENTS);
      setTeachers(saved.teachers ?? seed.TEACHERS);
      setParents(saved.parents ?? seed.PARENTS);
      setResults(saved.results ?? seed.RESULTS);
      setAttendance(saved.attendance ?? seed.ATTENDANCE);
      setAssignments(saved.assignments ?? seed.ASSIGNMENTS);
      setAnnouncements(saved.announcements ?? seed.ANNOUNCEMENTS);
      setTimetable(saved.timetable ?? seed.TIMETABLE);
      setPayments(saved.payments ?? seed.PAYMENTS);
      setActivityLogs(saved.activityLogs ?? seed.ACTIVITY_LOGS);
      setSessions(saved.sessions ?? seed.SESSIONS);
      setSettings(saved.settings ?? seed.SETTINGS);
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    persist({ students, teachers, parents, results, attendance, assignments, announcements, timetable, payments, activityLogs, sessions, settings });
  }, [hydrated, students, teachers, parents, results, attendance, assignments, announcements, timetable, payments, activityLogs, sessions, settings]);

  const addActivity = (action: string, category: ActivityLog['category']) => {
    setActivityLogs((prev) => [
      { id: genId('log'), action, actor: currentUser?.name ?? 'System', timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), category },
      ...prev,
    ]);
  };

  const state: StoreState = useMemo(() => ({
    students, teachers, parents, results, attendance, assignments, announcements, timetable, payments, activityLogs, sessions, settings,
    currentUser, currentSession, currentTerm,
    addActivity,
    switchRole: (role) => {
      const u = seed.DEMO_USERS.find((d) => d.role === role);
      if (u) setCurrentUser(u);
    },
    logout: () => setCurrentUser(null),
    addStudent: (s) => {
      const id = genId('s');
      const colorIdx = students.length;
      const newStudent: Student = { ...s, id, photoColor: PHOTO_COLORS[colorIdx % PHOTO_COLORS.length] };
      setStudents((prev) => [...prev, newStudent]);
      // link to parent
      if (s.parentId) {
        setParents((prev) => prev.map((p) => (p.id === s.parentId ? { ...p, childIds: [...p.childIds, id] } : p)));
      }
      addActivity(`Added new student: ${s.firstName} ${s.lastName} (${s.className})`, 'students');
    },
    updateStudent: (id, patch) => {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      const s = students.find((x) => x.id === id);
      if (s) addActivity(`Updated student record: ${s.firstName} ${s.lastName}`, 'students');
    },
    toggleStudentActive: (id) => {
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
      const s = students.find((x) => x.id === id);
      addActivity(`${s?.active ? 'Deactivated' : 'Activated'} student: ${s?.firstName} ${s?.lastName}`, 'students');
    },
    addTeacher: (t) => {
      setTeachers((prev) => [...prev, { ...t, id: genId('t') }]);
      addActivity(`Added new teacher: ${t.firstName} ${t.lastName}`, 'students');
    },
    updateTeacher: (id, patch) => {
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    addAnnouncement: (a) => {
      const newA: Announcement = {
        ...a,
        id: genId('an'),
        createdAt: new Date().toISOString().slice(0, 10),
        authorId: currentUser?.refId ?? 'admin',
      };
      setAnnouncements((prev) => [newA, ...prev]);
      addActivity(`Created announcement: ${a.title}`, 'system');
    },
    addAssignment: (a) => {
      const newAsg: Assignment = {
        ...a,
        id: genId('a'),
        createdAt: new Date().toISOString().slice(0, 10),
        teacherId: currentUser?.refId ?? 't1',
        term: currentTerm,
        session: currentSession,
      };
      setAssignments((prev) => [newAsg, ...prev]);
      addActivity(`Created assignment: ${a.title} for ${a.className}`, 'system');
    },
    recordAttendance: (date, className, entries, byTeacherId) => {
      setAttendance((prev) => {
        const filtered = prev.filter((r) => !(r.date === date && r.className === className && entries.some((e) => e.studentId === r.studentId)));
        const newRecords: AttendanceRecord[] = entries.map((e) => ({
          id: genId('att'),
          date,
          studentId: e.studentId,
          className,
          status: e.status,
          recordedBy: byTeacherId,
        }));
        return [...filtered, ...newRecords];
      });
      addActivity(`Recorded attendance for ${className} on ${date}`, 'attendance');
    },
    saveScores: (records, teacherId) => {
      setResults((prev) => {
        const next = [...prev];
        for (const rec of records) {
          const total = seed.computeTotal(rec.ca1, rec.ca2, rec.exam);
          const g = seed.gradeFor(total);
          const existingIdx = next.findIndex((r) => r.studentId === rec.studentId && r.subjectId === rec.subjectId && r.term === currentTerm && r.session === currentSession);
          if (existingIdx >= 0) {
            next[existingIdx] = { ...next[existingIdx], ca1: rec.ca1, ca2: rec.ca2, exam: rec.exam, total, grade: g.grade, remark: g.remark, teacherId, status: next[existingIdx].status === 'published' ? 'published' : 'draft' };
          } else {
            next.push({
              id: genId('r'),
              studentId: rec.studentId,
              subjectId: rec.subjectId,
              className: rec.className,
              term: currentTerm,
              session: currentSession,
              ca1: rec.ca1,
              ca2: rec.ca2,
              exam: rec.exam,
              total,
              grade: g.grade,
              remark: g.remark,
              status: 'draft',
              teacherId,
            });
          }
        }
        return next;
      });
      addActivity(`Saved scores for ${records.length} student(s)`, 'results');
    },
    setResultStatus: (ids, status) => {
      setResults((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r)));
      addActivity(`Updated ${ids.length} result(s) to ${status}`, 'results');
    },
    promoteStudents: (mappings) => {
      setStudents((prev) =>
        prev.map((s) => {
          const m = mappings.find((mm) => mm.studentId === s.id);
          if (!m) return s;
          if (m.toClass === 'Graduated') return { ...s, active: false };
          return { ...s, className: m.toClass };
        })
      );
      addActivity(`Promoted ${mappings.length} student(s) for new session`, 'students');
    },
    recordPayment: (studentId, amount, method, description) => {
      const s = students.find((x) => x.id === studentId);
      const newPay: Payment = {
        id: genId('pay'),
        studentId,
        amount,
        date: new Date().toISOString().slice(0, 10),
        method,
        reference: `${method.slice(0, 3).toUpperCase()}/001/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000 + 1000)}`,
        term: currentTerm,
        session: currentSession,
        description,
      };
      setPayments((prev) => [...prev, newPay]);
      setStudents((prev) => prev.map((st) => (st.id === studentId ? { ...st, feeBalance: Math.max(0, st.feeBalance - amount) } : st)));
      addActivity(`Recorded fee payment: ${s?.firstName} ${s?.lastName} (₦${amount.toLocaleString()})`, 'finance');
    },
    updateSettings: (patch) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      addActivity(`Updated school settings`, 'system');
    },
    setCurrentTerm: (term) => {
      setCurrentTermState(term);
      setSessions((prev) => prev.map((s) => (s.active ? { ...s, currentTerm: term } : s)));
    },
    setCurrentSession: (name) => {
      setCurrentSessionState(name);
      setSessions((prev) => prev.map((s) => ({ ...s, active: s.name === name })));
    },
  }), [students, teachers, parents, results, attendance, assignments, announcements, timetable, payments, activityLogs, sessions, settings, currentUser, currentSession, currentTerm]);

  return <StoreContext.Provider value={state}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Convenience helpers
export function naira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-100 text-emerald-700';
    case 'B': return 'bg-blue-100 text-blue-700';
    case 'C': return 'bg-cyan-100 text-cyan-700';
    case 'D': return 'bg-amber-100 text-amber-700';
    case 'E': return 'bg-orange-100 text-orange-700';
    default: return 'bg-rose-100 text-rose-700';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'published': return 'bg-emerald-100 text-emerald-700';
    case 'approved': return 'bg-blue-100 text-blue-700';
    case 'submitted': return 'bg-amber-100 text-amber-700';
    case 'present': return 'bg-emerald-100 text-emerald-700';
    case 'absent': return 'bg-rose-100 text-rose-700';
    case 'late': return 'bg-amber-100 text-amber-700';
    case 'excused': return 'bg-slate-200 text-slate-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}
