import type {
  Student,
  Teacher,
  Parent,
  Subject,
  ResultRecord,
  AttendanceRecord,
  Assignment,
  Announcement,
  TimetableSlot,
  Payment,
  ActivityLog,
  Session,
  AppSettings,
  ClassName,
  Term,
} from '../types';

export const SUBJECTS: Subject[] = [
  { id: 'eng', name: 'English Language', code: 'ENG' },
  { id: 'mat', name: 'Mathematics', code: 'MAT' },
  { id: 'bio', name: 'Biology', code: 'BIO' },
  { id: 'chem', name: 'Chemistry', code: 'CHM' },
  { id: 'phy', name: 'Physics', code: 'PHY' },
  { id: 'civ', name: 'Civic Education', code: 'CIV' },
  { id: 'comp', name: 'Computer Science', code: 'CSC' },
  { id: 'eco', name: 'Economics', code: 'ECO' },
  { id: 'geo', name: 'Geography', code: 'GEO' },
  { id: 'hist', name: 'History', code: 'HST' },
  { id: 'agr', name: 'Agricultural Science', code: 'AGR' },
  { id: 'fmath', name: 'Further Mathematics', code: 'FMH' },
];

export const SETTINGS: AppSettings = {
  schoolName: '001 Secondary School',
  motto: 'Knowledge • Integrity • Excellence',
  address: '12 Education Avenue, Wuse II, Abuja, Nigeria',
  phone: '+234 801 234 5678',
  email: 'info@001school.edu.ng',
  logoText: '001',
  primaryColor: '#2563eb',
};

export const SESSIONS: Session[] = [
  { id: 's2324', name: '2023/2024', active: false, currentTerm: 'Third Term' },
  { id: 's2425', name: '2024/2025', active: false, currentTerm: 'Third Term' },
  { id: 's2526', name: '2025/2026', active: true, currentTerm: 'First Term' },
];

export const CURRENT_SESSION = '2025/2026';
export const CURRENT_TERM: Term = 'First Term';

const PHOTO_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#ca8a04', '#dc2626', '#4f46e5'];

function color(i: number): string {
  return PHOTO_COLORS[i % PHOTO_COLORS.length];
}

export const PARENTS: Parent[] = [
  { id: 'p1', firstName: 'Chinedu', lastName: 'Okafor', email: 'chinedu.okafor@example.com', phone: '+234 803 111 0001', occupation: 'Civil Engineer', relationship: 'Father', childIds: ['s1', 's2'] },
  { id: 'p2', firstName: 'Aisha', lastName: 'Bello', email: 'aisha.bello@example.com', phone: '+234 803 111 0002', occupation: 'Pharmacist', relationship: 'Mother', childIds: ['s3'] },
  { id: 'p3', firstName: 'Emeka', lastName: 'Nwosu', email: 'emeka.nwosu@example.com', phone: '+234 803 111 0003', occupation: 'Banker', relationship: 'Father', childIds: ['s4'] },
  { id: 'p4', firstName: 'Funke', lastName: 'Adeyemi', email: 'funke.adeyemi@example.com', phone: '+234 803 111 0004', occupation: 'Lawyer', relationship: 'Mother', childIds: ['s5'] },
  { id: 'p5', firstName: 'Ibrahim', lastName: 'Sani', email: 'ibrahim.sani@example.com', phone: '+234 803 111 0005', occupation: 'Trader', relationship: 'Guardian', childIds: ['s6'] },
  { id: 'p6', firstName: 'Grace', lastName: 'Eze', email: 'grace.eze@example.com', phone: '+234 803 111 0006', occupation: 'Nurse', relationship: 'Mother', childIds: ['s7'] },
  { id: 'p7', firstName: 'Samuel', lastName: 'Ojo', email: 'samuel.ojo@example.com', phone: '+234 803 111 0007', occupation: 'Architect', relationship: 'Father', childIds: ['s8'] },
  { id: 'p8', firstName: 'Ngozi', lastName: 'Ibrahim', email: 'ngozi.ibrahim@example.com', phone: '+234 803 111 0008', occupation: 'Teacher', relationship: 'Mother', childIds: ['s9', 's10'] },
];

const FIRST_NAMES_M = ['Tunde', 'Ahmed', 'Daniel', 'Joshua', 'Kelechi', 'Musa', 'Femi', 'Ebuka', 'Yakubu', 'Bola', 'Seyi', 'Kunle'];
const FIRST_NAMES_F = ['Zainab', 'Maryam', 'Blessing', 'Joy', 'Amina', 'Chioma', 'Fatima', 'Halima', 'Ngozi', 'Oluwaseun', 'Titilayo', 'Hadiza'];
const LAST_NAMES = ['Okafor', 'Bello', 'Nwosu', 'Adeyemi', 'Sani', 'Eze', 'Ojo', 'Ibrahim', 'Adeola', 'Mohammed', 'Eze', 'Olawale'];

function makeStudents(): Student[] {
  const out: Student[] = [];
  let idx = 0;
  const classCounts: Record<ClassName, number> = { JSS1: 4, JSS2: 3, JSS3: 3, SS1: 4, SS2: 3, SS3: 3 };
  const classes: ClassName[] = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  let pIdx = 0;
  for (const cls of classes) {
    for (let i = 0; i < classCounts[cls]; i++) {
      const isMale = idx % 2 === 0;
      const first = isMale ? FIRST_NAMES_M[idx % FIRST_NAMES_M.length] : FIRST_NAMES_F[idx % FIRST_NAMES_F.length];
      const last = LAST_NAMES[idx % LAST_NAMES.length];
      const parentId = `p${(pIdx % PARENTS.length) + 1}`;
      const feeTotal = cls.startsWith('SS') ? 185000 : 150000;
      const feeBalance = idx % 3 === 0 ? feeTotal : idx % 3 === 1 ? Math.round(feeTotal * 0.5) : 0;
      out.push({
        id: `s${idx + 1}`,
        admissionNo: `001/${cls}/${String(idx + 1).padStart(3, '0')}`,
        firstName: first,
        lastName: last,
        gender: isMale ? 'Male' : 'Female',
        className: cls,
        dateOfBirth: `200${idx % 8 + 2}-0${(idx % 9) + 1}-1${idx % 9}`,
        parentId,
        photoColor: color(idx),
        enrolledAt: `2025-09-0${(idx % 9) + 1}`,
        active: true,
        feeBalance,
        feeTotal,
      });
      idx++;
    }
  }
  // Also append explicit s1..s10 mapping for the demo parents above
  return out;
}

export const STUDENTS: Student[] = makeStudents();
// Ensure s1..s10 explicitly exist with the parents referenced
STUDENTS[0] = { ...STUDENTS[0], id: 's1', firstName: 'Tunde', lastName: 'Okafor', parentId: 'p1', className: 'JSS1', admissionNo: '001/JSS1/001', feeBalance: 75000, feeTotal: 150000 };
STUDENTS[1] = { ...STUDENTS[1], id: 's2', firstName: 'Zainab', lastName: 'Okafor', parentId: 'p1', className: 'JSS2', admissionNo: '001/JSS2/001', feeBalance: 0, feeTotal: 150000 };
STUDENTS[2] = { ...STUDENTS[2], id: 's3', firstName: 'Ahmed', lastName: 'Bello', parentId: 'p2', className: 'SS1', admissionNo: '001/SS1/001', feeBalance: 185000, feeTotal: 185000 };
STUDENTS[3] = { ...STUDENTS[3], id: 's4', firstName: 'Blessing', lastName: 'Nwosu', parentId: 'p3', className: 'SS2', admissionNo: '001/SS2/001', feeBalance: 92500, feeTotal: 185000 };
STUDENTS[4] = { ...STUDENTS[4], id: 's5', firstName: 'Daniel', lastName: 'Adeyemi', parentId: 'p4', className: 'JSS3', admissionNo: '001/JSS3/001', feeBalance: 0, feeTotal: 150000 };
STUDENTS[5] = { ...STUDENTS[5], id: 's6', firstName: 'Amina', lastName: 'Sani', parentId: 'p5', className: 'JSS1', admissionNo: '001/JSS1/002', feeBalance: 150000, feeTotal: 150000 };
STUDENTS[6] = { ...STUDENTS[6], id: 's7', firstName: 'Kelechi', lastName: 'Eze', parentId: 'p6', className: 'SS3', admissionNo: '001/SS3/001', feeBalance: 0, feeTotal: 185000 };
STUDENTS[7] = { ...STUDENTS[7], id: 's8', firstName: 'Joy', lastName: 'Ojo', parentId: 'p7', className: 'SS1', admissionNo: '001/SS1/002', feeBalance: 50000, feeTotal: 185000 };
STUDENTS[8] = { ...STUDENTS[8], id: 's9', firstName: 'Musa', lastName: 'Ibrahim', parentId: 'p8', className: 'JSS2', admissionNo: '001/JSS2/002', feeBalance: 75000, feeTotal: 150000 };
STUDENTS[9] = { ...STUDENTS[9], id: 's10', firstName: 'Fatima', lastName: 'Ibrahim', parentId: 'p8', className: 'JSS3', admissionNo: '001/JSS3/002', feeBalance: 0, feeTotal: 150000 };

export const TEACHERS: Teacher[] = [
  { id: 't1', staffNo: 'STF/001', firstName: 'Patricia', lastName: 'Okon', gender: 'Female', email: 'patricia.okon@001school.edu.ng', phone: '+234 805 222 0001', subjects: ['eng', 'civ'], classes: ['JSS1', 'JSS2', 'SS1'], hiredAt: '2019-09-01', active: true },
  { id: 't2', staffNo: 'STF/002', firstName: 'Sunday', lastName: 'Adeyemi', gender: 'Male', email: 'sunday.adeyemi@001school.edu.ng', phone: '+234 805 222 0002', subjects: ['mat', 'fmath'], classes: ['SS1', 'SS2', 'SS3'], hiredAt: '2018-01-10', active: true },
  { id: 't3', staffNo: 'STF/003', firstName: 'Ngozi', lastName: 'Eze', gender: 'Female', email: 'ngozi.eze@001school.edu.ng', phone: '+234 805 222 0003', subjects: ['bio', 'agr'], classes: ['JSS3', 'SS1', 'SS2'], hiredAt: '2020-09-01', active: true },
  { id: 't4', staffNo: 'STF/004', firstName: 'Yusuf', lastName: 'Bello', gender: 'Male', email: 'yusuf.bello@001school.edu.ng', phone: '+234 805 222 0004', subjects: ['chem', 'phy'], classes: ['SS2', 'SS3'], hiredAt: '2017-09-01', active: true },
  { id: 't5', staffNo: 'STF/005', firstName: 'Comfort', lastName: 'Ojo', gender: 'Female', email: 'comfort.ojo@001school.edu.ng', phone: '+234 805 222 0005', subjects: ['comp', 'geo'], classes: ['JSS1', 'JSS2', 'SS1'], hiredAt: '2021-01-15', active: true },
  { id: 't6', staffNo: 'STF/006', firstName: 'Bashir', lastName: 'Sani', gender: 'Male', email: 'bashir.sani@001school.edu.ng', phone: '+234 805 222 0006', subjects: ['hist', 'eco'], classes: ['JSS3', 'SS2', 'SS3'], hiredAt: '2016-09-01', active: true },
];

export const DEMO_USERS = [
  { id: 'u-admin', role: 'admin' as const, name: 'Mr. Adamu Yusuf', refId: 'admin', avatarColor: '#1e293b', email: 'admin@001school.edu.ng' },
  { id: 'u-teacher', role: 'teacher' as const, name: 'Mrs. Patricia Okon', refId: 't1', avatarColor: '#2563eb', email: 'patricia.okon@001school.edu.ng' },
  { id: 'u-student', role: 'student' as const, name: 'Tunde Okafor', refId: 's1', avatarColor: '#2563eb', email: 'student@001school.edu.ng' },
  { id: 'u-parent', role: 'parent' as const, name: 'Chinedu Okafor', refId: 'p1', avatarColor: '#0d9488', email: 'parent@001school.edu.ng' },
];

// Grade helpers
export function computeTotal(ca1: number, ca2: number, exam: number): number {
  return Math.min(100, Math.max(0, ca1 + ca2 + exam));
}

export function gradeFor(total: number): { grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; remark: string } {
  if (total >= 80) return { grade: 'A', remark: 'Excellent' };
  if (total >= 70) return { grade: 'B', remark: 'Very Good' };
  if (total >= 60) return { grade: 'C', remark: 'Good' };
  if (total >= 50) return { grade: 'D', remark: 'Pass' };
  if (total >= 40) return { grade: 'E', remark: 'Weak Pass' };
  return { grade: 'F', remark: 'Fail' };
}

function makeResults(): ResultRecord[] {
  const out: ResultRecord[] = [];
  let i = 0;
  for (const s of STUDENTS) {
    const subjectPool = s.className.startsWith('SS')
      ? ['eng', 'mat', 'bio', 'chem', 'phy', 'civ', 'comp', 'eco']
      : ['eng', 'mat', 'civ', 'comp', 'bio', 'hist', 'agr', 'geo'];
    for (const subjectId of subjectPool) {
      const teacher = TEACHERS.find((t) => t.subjects.includes(subjectId) && t.classes.includes(s.className));
      if (!teacher) continue;
      const ca1 = 12 + ((i * 7) % 9);
      const ca2 = 11 + ((i * 5) % 9);
      const exam = 38 + ((i * 11) % 23);
      const total = computeTotal(ca1, ca2, exam);
      const g = gradeFor(total);
      out.push({
        id: `r${i + 1}`,
        studentId: s.id,
        subjectId,
        className: s.className,
        term: CURRENT_TERM,
        session: CURRENT_SESSION,
        ca1,
        ca2,
        exam,
        total,
        grade: g.grade,
        remark: g.remark,
        status: 'draft',
        teacherId: teacher.id,
      });
      i++;
    }
  }
  // Mark the demo student's (s1) English and Maths results as published for showcase
  const s1Eng = out.find((r) => r.studentId === 's1' && r.subjectId === 'eng');
  if (s1Eng) s1Eng.status = 'published';
  const s1Mat = out.find((r) => r.studentId === 's1' && r.subjectId === 'mat');
  if (s1Mat) s1Mat.status = 'published';
  const s2Eng = out.find((r) => r.studentId === 's2' && r.subjectId === 'eng');
  if (s2Eng) s2Eng.status = 'published';
  return out;
}

export const RESULTS: ResultRecord[] = makeResults();

// Attendance: last 10 school days for the demo student
function makeAttendance(): AttendanceRecord[] {
  const out: AttendanceRecord[] = [];
  const days = 10;
  for (const s of STUDENTS) {
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      // skip weekends
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;
      const seed = (parseInt(s.id.slice(1)) + d) % 5;
      const status: AttendanceRecord['status'] = seed === 0 ? 'absent' : seed === 1 ? 'late' : 'present';
      out.push({
        id: `att-${s.id}-${d}`,
        date: date.toISOString().slice(0, 10),
        studentId: s.id,
        className: s.className,
        status,
        recordedBy: 't1',
      });
    }
  }
  return out;
}

export const ATTENDANCE: AttendanceRecord[] = makeAttendance();

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Essay: My Favourite Season', description: 'Write a 300-word essay describing your favourite season of the year. Use descriptive language.', subjectId: 'eng', className: 'JSS1', teacherId: 't1', dueDate: '2025-10-25', createdAt: '2025-10-12', term: CURRENT_TERM, session: CURRENT_SESSION },
  { id: 'a2', title: 'Algebra Worksheet 1', description: 'Solve all 20 questions on linear equations from the textbook (page 45).', subjectId: 'mat', className: 'SS1', teacherId: 't2', dueDate: '2025-10-22', createdAt: '2025-10-10', term: CURRENT_TERM, session: CURRENT_SESSION },
  { id: 'a3', title: 'Plant Cell Diagram', description: 'Draw and label a detailed plant cell diagram. Identify 10 organelles.', subjectId: 'bio', className: 'SS1', teacherId: 't3', dueDate: '2025-10-28', createdAt: '2025-10-15', term: CURRENT_TERM, session: CURRENT_SESSION },
  { id: 'a4', title: 'Introduction to Python', description: 'Write a Python program that prints the Fibonacci sequence up to 100.', subjectId: 'comp', className: 'JSS1', teacherId: 't5', dueDate: '2025-10-24', createdAt: '2025-10-13', term: CURRENT_TERM, session: CURRENT_SESSION },
  { id: 'a5', title: 'Map Reading Exercise', description: 'Complete the map reading exercise on page 23 of your Geography textbook.', subjectId: 'geo', className: 'SS1', teacherId: 't5', dueDate: '2025-10-30', createdAt: '2025-10-16', term: CURRENT_TERM, session: CURRENT_SESSION },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'an1', title: 'First Term Resumption Date', body: 'All students are expected to resume for the First Term on Monday, 8th September 2025. Classes begin at 7:45 AM. School uniforms must be complete and tidy.', audience: 'all', createdAt: '2025-09-01', authorId: 'admin', priority: 'high' },
  { id: 'an2', title: 'Parent-Teacher Conference', body: 'The PT conference for First Term will hold on Friday 14th November 2025 from 10:00 AM. All parents are invited to discuss their wards\' progress.', audience: 'parents', createdAt: '2025-10-05', authorId: 'admin', priority: 'normal' },
  { id: 'an3', title: 'Mid-Term Break Schedule', body: 'Mid-term break runs from 27th October to 31st October 2025. Students resume on 3rd November.', audience: 'all', createdAt: '2025-10-08', authorId: 'admin', priority: 'normal' },
  { id: 'an4', title: 'Inter-House Sports Day', body: 'The annual inter-house sports competition holds on 22nd November 2025 at the school field. Parents are invited.', audience: 'all', createdAt: '2025-10-12', authorId: 'admin', priority: 'high' },
  { id: 'an5', title: 'JSS1 CCA Registration', body: 'All JSS1 students should register for their Co-Curricular Activity by Friday. See your class teacher for the form.', audience: 'JSS1', createdAt: '2025-10-14', authorId: 't1', priority: 'normal' },
];

const DAYS: TimetableSlot['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIOD_TIMES = [
  ['08:00', '08:40'],
  ['08:40', '09:20'],
  ['09:20', '10:00'],
  ['10:20', '11:00'],
  ['11:00', '11:40'],
  ['11:40', '12:20'],
  ['13:00', '13:40'],
  ['13:40', '14:20'],
];

function makeTimetable(): TimetableSlot[] {
  const out: TimetableSlot[] = [];
  const classSubjects: Record<ClassName, string[]> = {
    JSS1: ['eng', 'mat', 'civ', 'comp', 'bio', 'hist', 'agr', 'geo'],
    JSS2: ['eng', 'mat', 'civ', 'comp', 'bio', 'hist', 'agr', 'geo'],
    JSS3: ['eng', 'mat', 'civ', 'comp', 'bio', 'hist', 'agr', 'geo'],
    SS1: ['eng', 'mat', 'bio', 'chem', 'phy', 'civ', 'comp', 'eco'],
    SS2: ['eng', 'mat', 'bio', 'chem', 'phy', 'civ', 'comp', 'eco'],
    SS3: ['eng', 'mat', 'bio', 'chem', 'phy', 'civ', 'comp', 'eco'],
  };
  let idx = 0;
  for (const cls of ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'] as ClassName[]) {
    for (const day of DAYS) {
      for (let p = 0; p < 8; p++) {
        if (p === 3) continue; // break
        const subjectId = classSubjects[cls][(idx + p) % classSubjects[cls].length];
        const teacher = TEACHERS.find((t) => t.subjects.includes(subjectId) && t.classes.includes(cls)) || TEACHERS[0];
        out.push({
          id: `tt-${cls}-${day}-${p}`,
          className: cls,
          day,
          period: p + 1,
          startTime: PERIOD_TIMES[p][0],
          endTime: PERIOD_TIMES[p][1],
          subjectId,
          teacherId: teacher.id,
        });
        idx++;
      }
    }
  }
  return out;
}

export const TIMETABLE: TimetableSlot[] = makeTimetable();

export const PAYMENTS: Payment[] = [
  { id: 'pay1', studentId: 's1', amount: 75000, date: '2025-09-15', method: 'Transfer', reference: 'TRX/001/2025/0001', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'First installment - First Term fees' },
  { id: 'pay2', studentId: 's2', amount: 150000, date: '2025-09-12', method: 'POS', reference: 'POS/001/2025/0002', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'Full First Term fees' },
  { id: 'pay3', studentId: 's3', amount: 0, date: '', method: 'Cash', reference: '', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'No payment recorded' },
  { id: 'pay4', studentId: 's4', amount: 92500, date: '2025-09-20', method: 'Online', reference: 'ONL/001/2025/0004', term: CURRENT_TERM, session: CURRENT_SESSION, description: '50% First Term fees' },
  { id: 'pay5', studentId: 's5', amount: 150000, date: '2025-09-08', method: 'Transfer', reference: 'TRX/001/2025/0005', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'Full First Term fees' },
  { id: 'pay6', studentId: 's7', amount: 185000, date: '2025-09-10', method: 'Cash', reference: 'CSH/001/2025/0007', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'Full First Term fees' },
  { id: 'pay7', studentId: 's10', amount: 150000, date: '2025-09-14', method: 'POS', reference: 'POS/001/2025/0010', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'Full First Term fees' },
  { id: 'pay8', studentId: 's1', amount: 0, date: '2025-09-15', method: 'Transfer', reference: 'TRX/001/2025/0001', term: CURRENT_TERM, session: CURRENT_SESSION, description: 'Outstanding balance' },
];

export const ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'l1', action: 'Published First Term results for JSS1 English', actor: 'Admin', timestamp: '2025-10-18 09:14', category: 'results' },
  { id: 'l2', action: 'Recorded attendance for SS1 Mathematics', actor: 'Mrs. Patricia Okon', timestamp: '2025-10-18 08:05', category: 'attendance' },
  { id: 'l3', action: 'Added new student: Amina Sani (JSS1)', actor: 'Admin', timestamp: '2025-10-15 11:22', category: 'students' },
  { id: 'l4', action: 'Recorded fee payment: Tunde Okafor (₦75,000)', actor: 'Admin', timestamp: '2025-10-12 14:48', category: 'finance' },
  { id: 'l5', action: 'Created announcement: Inter-House Sports Day', actor: 'Admin', timestamp: '2025-10-12 10:30', category: 'system' },
  { id: 'l6', action: 'Submitted SS1 Biology results for approval', actor: 'Mrs. Ngozi Eze', timestamp: '2025-10-11 15:55', category: 'results' },
];
