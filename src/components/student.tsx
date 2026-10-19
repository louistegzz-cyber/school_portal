import { useState } from 'react';
import {
  IdCard, ClipboardList, ClipboardCheck, CalendarCheck, FolderOpen, BookMarked, Wallet,
  Megaphone, TrendingUp, CheckCircle2, AlertTriangle, Clock, GraduationCap, BookOpen,
} from 'lucide-react';
import { useStore, naira, gradeColor, statusColor } from '../store';
import { SUBJECTS } from '../data/seed';
import type { Student, Term, ResultRecord } from '../types';
import { EmptyState, Avatar, StatCard, Badge, SectionHeader, Modal } from './ui';
import { BarChart, ProgressRow } from './charts';
import { SharedTimetable } from './admin';

export function StudentPages({ page }: { page: string }) {
  const { currentUser, students } = useStore();
  const student = students.find((s) => s.id === currentUser?.refId) as Student;
  if (!student) return <EmptyState icon={<GraduationCap size={22} />} title="Student profile not found" />;
  switch (page) {
    case 'dashboard': return <StudentDashboard student={student} />;
    case 'profile': return <StudentProfile student={student} />;
    case 'results': return <StudentResults student={student} />;
    case 'attendance': return <StudentAttendance student={student} />;
    case 'timetable': return <SharedTimetable scope="student" classFilter={student.className} />;
    case 'assignments': return <StudentAssignments student={student} />;
    case 'subjects': return <StudentSubjects student={student} />;
    case 'fees': return <StudentFees student={student} />;
    case 'announcements': return <StudentAnnouncements student={student} />;
    default: return <StudentDashboard student={student} />;
  }
}

function StudentDashboard({ student }: { student: Student }) {
  const { results, attendance, assignments, announcements, payments, currentTerm, currentSession } = useStore();
  const published = results.filter((r) => r.studentId === student.id && r.status === 'published');
  const avg = published.length ? Math.round(published.reduce((s, r) => s + r.total, 0) / published.length) : 0;
  const myAttendance = attendance.filter((a) => a.studentId === student.id);
  const present = myAttendance.filter((a) => a.status === 'present').length;
  const attRate = myAttendance.length ? Math.round((present / myAttendance.length) * 100) : 0;
  const myAssignments = assignments.filter((a) => a.className === student.className);
  const upcoming = myAssignments.filter((a) => new Date(a.dueDate) >= new Date()).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3);
  const myAnnouncements = announcements.filter((a) => a.audience === 'all' || a.audience === 'students' || a.audience === student.className).slice(0, 3);
  const myPayments = payments.filter((p) => p.studentId === student.id && p.amount > 0);

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-blue-700 to-slate-900 text-white border-0">
        <div className="flex items-center gap-4">
          <Avatar name={`${student.firstName} ${student.lastName}`} color={student.photoColor} size={56} />
          <div>
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
            <p className="text-slate-300 text-sm mt-1">{student.className} &middot; {student.admissionNo} &middot; {currentSession}, {currentTerm}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp size={20} />} label="Avg Score" value={published.length ? `${avg}%` : '—'} sub={`${published.length} published`} tone="blue" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Attendance" value={`${attRate}%`} sub={`${present}/${myAttendance.length} days`} tone="emerald" />
        <StatCard icon={<Wallet size={20} />} label="Fee Balance" value={naira(student.feeBalance)} sub={student.feeBalance > 0 ? 'Outstanding' : 'Cleared'} tone={student.feeBalance > 0 ? 'rose' : 'emerald'} />
        <StatCard icon={<FolderOpen size={20} />} label="Assignments" value={myAssignments.length} sub={`${upcoming.length} upcoming`} tone="amber" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Subject Performance</h3>
          {published.length ? <BarChart data={published.map((r) => ({ label: SUBJECTS.find((s) => s.id === r.subjectId)?.code ?? r.subjectId, value: r.total }))} max={100} height={180} /> : <EmptyState icon={<ClipboardList size={22} />} title="No published results yet" description="Your results will appear here once published by the administrator." />}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-amber-500" /> Upcoming Assignments</h3>
          {upcoming.length ? (
            <div className="space-y-3">
              {upcoming.map((a) => {
                const subj = SUBJECTS.find((s) => s.id === a.subjectId);
                const days = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-50">
                    <div className="flex justify-between items-start"><p className="font-medium text-sm text-slate-800">{a.title}</p><Badge className="bg-amber-100 text-amber-700">{days <= 2 ? `${days}d left` : `${days} days`}</Badge></div>
                    <p className="text-xs text-slate-500 mt-1">{subj?.name} &middot; Due {a.dueDate}</p>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState icon={<CheckCircle2 size={22} />} title="No upcoming assignments" />}
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Megaphone size={18} className="text-blue-600" /> Announcements</h3>
        <div className="space-y-3">
          {myAnnouncements.map((a) => (
            <div key={a.id} className="p-3 rounded-xl bg-slate-50">
              <p className="font-medium text-sm text-slate-800">{a.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
              <p className="text-[10px] text-slate-400 mt-1">{a.createdAt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentProfile({ student }: { student: Student }) {
  const { parents, settings } = useStore();
  const parent = parents.find((p) => p.id === student.parentId);
  return (
    <div className="space-y-5">
      <SectionHeader title="My Profile & Student ID" description="Personal information and printable ID card" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={`${student.firstName} ${student.lastName}`} color={student.photoColor} size={64} />
            <div>
              <p className="text-xl font-bold text-slate-900">{student.firstName} {student.lastName}</p>
              <p className="text-sm text-slate-500 font-mono">{student.admissionNo}</p>
              <Badge className="bg-blue-50 text-blue-700 mt-1">{student.className}</Badge>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['Gender', student.gender], ['Date of Birth', student.dateOfBirth], ['Class', student.className], ['Status', student.active ? 'Active' : 'Inactive'], ['Enrolled On', student.enrolledAt], ['Session', '2025/2026']].map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-slate-50"><p className="text-[10px] uppercase font-semibold text-slate-400">{k}</p><p className="text-sm font-medium text-slate-800 mt-0.5">{v}</p></div>
            ))}
          </div>
          {parent && (
            <div className="mt-5 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Parent / Guardian</p>
              <p className="font-medium">{parent.firstName} {parent.lastName} ({parent.relationship})</p>
              <p className="text-sm text-slate-500">{parent.phone} &middot; {parent.email}</p>
              <p className="text-xs text-slate-400 mt-1">{parent.occupation}</p>
            </div>
          )}
        </div>
        <div className="card p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Student ID Card</p>
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-br from-blue-700 to-slate-900 text-white p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">{settings.logoText}</div>
                <div><p className="text-sm font-semibold">{settings.schoolName}</p><p className="text-[10px] text-blue-200">{settings.motto}</p></div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={`${student.firstName} ${student.lastName}`} color={student.photoColor} size={48} />
                <div><p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p><p className="text-xs text-slate-500 font-mono">{student.admissionNo}</p></div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Class</span><span className="font-medium">{student.className}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender</span><span className="font-medium">{student.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Session</span><span className="font-medium">2025/2026</span></div>
              </div>
              <p className="text-[9px] text-slate-400 mt-3 text-center">This card must be carried at all times within school premises.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentResults({ student }: { student: Student }) {
  const { results, currentTerm, currentSession } = useStore();
  const [viewTerm, setViewTerm] = useState<Term>(currentTerm);
  const published = results.filter((r) => r.studentId === student.id && r.status === 'published' && r.term === viewTerm);
  const avg = published.length ? Math.round(published.reduce((s, r) => s + r.total, 0) / published.length) : 0;
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader title="Results & Report Card" description={`${currentSession} — ${viewTerm}`} action={<button className="btn-primary" onClick={() => setReportOpen(true)}><ClipboardList size={16} /> View Report Card</button>} />
      {published.length === 0 ? (
        <div className="card"><EmptyState icon={<ClipboardList size={22} />} title="No published results" description={`No results have been published for ${viewTerm} yet. Check back after the administrator approves and publishes results.`} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={<TrendingUp size={18} />} label="Average" value={`${avg}%`} tone="blue" />
            <StatCard icon={<BookMarked size={18} />} label="Subjects" value={published.length} tone="emerald" />
            <StatCard icon={<CheckCircle2 size={18} />} label="Highest" value={Math.max(...published.map((r) => r.total))} tone="amber" />
          </div>
          <div className="card">
            <div className="table-wrap border-0">
              <table className="table">
                <thead><tr><th>Subject</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead>
                <tbody>
                  {published.map((r) => {
                    const subj = SUBJECTS.find((s) => s.id === r.subjectId);
                    return (
                      <tr key={r.id}>
                        <td className="font-medium">{subj?.name}</td>
                        <td>{r.ca1}/20</td><td>{r.ca2}/20</td><td>{r.exam}/60</td>
                        <td className="font-semibold">{r.total}</td>
                        <td><Badge className={gradeColor(r.grade)}>{r.grade}</Badge></td>
                        <td className="text-xs">{r.remark}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report Card" subtitle={`${student.firstName} ${student.lastName} — ${viewTerm}, ${currentSession}`} size="lg">
        <ReportCard student={student} published={published} avg={avg} />
      </Modal>
    </div>
  );
}

function ReportCard({ student, published, avg }: { student: Student; published: ResultRecord[]; avg: number }) {
  const { settings } = useStore();
  const overall = avg >= 80 ? 'Excellent' : avg >= 70 ? 'Very Good' : avg >= 60 ? 'Good' : avg >= 50 ? 'Pass' : 'Needs Improvement';
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">{settings.logoText}</div>
          <div><p className="font-bold">{settings.schoolName}</p><p className="text-xs text-blue-200">{settings.motto}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-slate-500">Student Name</p><p className="font-medium">{student.firstName} {student.lastName}</p></div>
        <div><p className="text-xs text-slate-500">Admission No</p><p className="font-medium font-mono">{student.admissionNo}</p></div>
        <div><p className="text-xs text-slate-500">Class</p><p className="font-medium">{student.className}</p></div>
        <div><p className="text-xs text-slate-500">Term / Session</p><p className="font-medium">First Term / 2025-2026</p></div>
      </div>
      <div className="table-wrap border border-slate-200">
        <table className="table">
          <thead><tr><th>Subject</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead>
          <tbody>
            {published.length ? published.map((r) => {
              const subj = SUBJECTS.find((s) => s.id === r.subjectId);
              return <tr key={r.id}><td className="font-medium">{subj?.name}</td><td>{r.ca1}</td><td>{r.ca2}</td><td>{r.exam}</td><td className="font-semibold">{r.total}</td><td><Badge className={gradeColor(r.grade)}>{r.grade}</Badge></td><td className="text-xs">{r.remark}</td></tr>;
            }) : <tr><td colSpan={7} className="text-center text-slate-400 py-6">No published results for this term.</td></tr>}
          </tbody>
        </table>
      </div>
      {published.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 text-center"><p className="text-xs text-slate-500">Average</p><p className="text-lg font-bold text-slate-900">{avg}%</p></div>
          <div className="p-3 rounded-xl bg-slate-50 text-center"><p className="text-xs text-slate-500">Overall</p><p className="text-lg font-bold text-blue-700">{overall}</p></div>
          <div className="p-3 rounded-xl bg-slate-50 text-center"><p className="text-xs text-slate-500">Subjects</p><p className="text-lg font-bold text-slate-900">{published.length}</p></div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div><p className="text-xs text-slate-500">Class Teacher's Remark</p><p className="text-sm italic text-slate-700 mt-1">A diligent student. Keep up the good work.</p></div>
        <div><p className="text-xs text-slate-500">Principal's Remark</p><p className="text-sm italic text-slate-700 mt-1">Satisfactory performance. Aim higher next term.</p></div>
      </div>
    </div>
  );
}

function StudentAttendance({ student }: { student: Student }) {
  const { attendance } = useStore();
  const mine = attendance.filter((a) => a.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const present = mine.filter((a) => a.status === 'present').length;
  const absent = mine.filter((a) => a.status === 'absent').length;
  const late = mine.filter((a) => a.status === 'late').length;
  const rate = mine.length ? Math.round((present / mine.length) * 100) : 0;
  return (
    <div className="space-y-5">
      <SectionHeader title="My Attendance" description="Attendance history and summary" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 size={18} />} label="Present" value={present} tone="emerald" />
        <StatCard icon={<AlertTriangle size={18} />} label="Absent" value={absent} tone="rose" />
        <StatCard icon={<Clock size={18} />} label="Late" value={late} tone="amber" />
        <StatCard icon={<TrendingUp size={18} />} label="Rate" value={`${rate}%`} tone="blue" />
      </div>
      <div className="card p-5"><h3 className="font-semibold text-slate-900 mb-3">Attendance Rate</h3><ProgressRow label="Present days" value={present} max={mine.length} color="#10b981" /></div>
      <div className="card">
        <div className="table-wrap border-0">
          <table className="table">
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>{mine.slice(0, 20).map((a) => <tr key={a.id}><td>{a.date}</td><td><Badge className={statusColor(a.status)}>{a.status}</Badge></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentAssignments({ student }: { student: Student }) {
  const { assignments } = useStore();
  const mine = assignments.filter((a) => a.className === student.className);
  return (
    <div className="space-y-5">
      <SectionHeader title="Assignments" description={`${mine.length} assignments for ${student.className}`} />
      {mine.length === 0 ? <div className="card"><EmptyState icon={<FolderOpen size={22} />} title="No assignments" /></div> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {mine.map((a) => {
            const subj = SUBJECTS.find((s) => s.id === a.subjectId);
            const overdue = new Date(a.dueDate) < new Date();
            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between"><Badge className="bg-blue-50 text-blue-700">{subj?.name}</Badge><Badge className={overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}>Due {a.dueDate}</Badge></div>
                <p className="font-semibold text-slate-900 mt-3">{a.title}</p>
                <p className="text-sm text-slate-600 mt-1">{a.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentSubjects({ student }: { student: Student }) {
  const { timetable, teachers } = useStore();
  const subjectIds = Array.from(new Set(timetable.filter((t) => t.className === student.className).map((t) => t.subjectId)));
  return (
    <div className="space-y-5">
      <SectionHeader title="My Subjects" description={`Subjects offered in ${student.className}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectIds.map((sid) => {
          const subj = SUBJECTS.find((s) => s.id === sid);
          const slot = timetable.find((t) => t.className === student.className && t.subjectId === sid);
          const t = teachers.find((te) => te.id === slot?.teacherId);
          return (
            <div key={sid} className="card p-5">
              <div className="flex items-center justify-between"><div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BookOpen size={18} /></div><Badge className="bg-slate-100 text-slate-700 font-mono">{subj?.code}</Badge></div>
              <p className="font-semibold text-slate-900 mt-3">{subj?.name}</p>
              <p className="text-xs text-slate-500 mt-1">Teacher: {t ? `${t.firstName} ${t.lastName}` : '—'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentFees({ student }: { student: Student }) {
  const { payments } = useStore();
  const mine = payments.filter((p) => p.studentId === student.id && p.amount > 0);
  const paid = student.feeTotal - student.feeBalance;
  return (
    <div className="space-y-5">
      <SectionHeader title="Fees & Payments" description="Fee balance and payment history" />
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Wallet size={18} />} label="Total Fee" value={naira(student.feeTotal)} tone="blue" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Paid" value={naira(paid)} tone="emerald" />
        <StatCard icon={<AlertTriangle size={18} />} label="Balance" value={naira(student.feeBalance)} tone={student.feeBalance > 0 ? 'rose' : 'emerald'} />
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-3">Payment Progress</h3>
        <ProgressRow label="Paid" value={paid} max={student.feeTotal} color={student.feeBalance > 0 ? '#f59e0b' : '#10b981'} />
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Payment History</h3></div>
        {mine.length === 0 ? <EmptyState icon={<Wallet size={22} />} title="No payments recorded" description="Your payment history will appear here." /> : (
          <div className="table-wrap border-0">
            <table className="table">
              <thead><tr><th>Date</th><th>Reference</th><th>Method</th><th>Description</th><th>Amount</th></tr></thead>
              <tbody>{mine.map((p) => <tr key={p.id}><td>{p.date}</td><td className="font-mono text-xs">{p.reference}</td><td>{p.method}</td><td>{p.description}</td><td className="font-medium text-emerald-600">{naira(p.amount)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentAnnouncements({ student }: { student: Student }) {
  const { announcements } = useStore();
  const mine = announcements.filter((a) => a.audience === 'all' || a.audience === 'students' || a.audience === student.className);
  return (
    <div className="space-y-5">
      <SectionHeader title="Announcements" description="School and class announcements" />
      <div className="space-y-3">
        {mine.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${a.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}><Megaphone size={18} /></div>
              <div><p className="font-semibold text-slate-900">{a.title}</p><p className="text-xs text-slate-500 mt-0.5">{a.createdAt} &middot; To: {a.audience}</p><p className="text-sm text-slate-600 mt-2 leading-relaxed">{a.body}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
