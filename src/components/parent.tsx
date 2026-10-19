import { useMemo, useState } from 'react';
import {
  Users, ClipboardList, ClipboardCheck, CalendarCheck, FolderOpen, Wallet,
  Megaphone, TrendingUp, CheckCircle2, AlertTriangle, Clock, ChevronDown, GraduationCap,
  BookMarked, BookOpen,
} from 'lucide-react';
import { useStore, naira, gradeColor, statusColor } from '../store';
import { SUBJECTS } from '../data/seed';
import type { Student, Parent, ResultRecord } from '../types';
import { EmptyState, Avatar, StatCard, Badge, SectionHeader, Modal, Select } from './ui';
import { BarChart, ProgressRow } from './charts';
import { SharedTimetable } from './admin';

export function ParentPages({ page }: { page: string }) {
  const { currentUser, parents, students } = useStore();
  const parent = parents.find((p) => p.id === currentUser?.refId) as Parent | undefined;
  const children = useMemo(() => (parent ? students.filter((s) => parent.childIds.includes(s.id)) : []), [parent, students]);
  const [selectedId, setSelectedId] = useState<string>(children[0]?.id ?? '');
  const selected = children.find((c) => c.id === selectedId) ?? children[0];

  if (!parent) return <EmptyState icon={<Users size={22} />} title="Parent profile not found" />;
  if (children.length === 0) return <EmptyState icon={<Users size={22} />} title="No linked children" description="No children are linked to your account yet. Contact the school administrator." />;

  const childSelector = (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {children.map((c) => (
        <button
          key={c.id}
          onClick={() => setSelectedId(c.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${c.id === selected?.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Avatar name={`${c.firstName} ${c.lastName}`} color={c.photoColor} size={22} />
          {c.firstName} {c.lastName}
          <span className={`text-[10px] ${c.id === selected?.id ? 'text-blue-100' : 'text-slate-400'}`}>{c.className}</span>
        </button>
      ))}
    </div>
  );

  if (!selected) return null;

  switch (page) {
    case 'dashboard': return <ParentDashboard parent={parent} children={children} selector={childSelector} selected={selected} setSelectedId={setSelectedId} />;
    case 'results': return <ParentResults child={selected} selector={childSelector} />;
    case 'attendance': return <ParentAttendance child={selected} selector={childSelector} />;
    case 'timetable': return <div className="space-y-4"><div className="card p-3">{childSelector}</div><SharedTimetable scope="parent" classFilter={selected.className} /></div>;
    case 'assignments': return <ParentAssignments child={selected} selector={childSelector} />;
    case 'fees': return <ParentFees child={selected} selector={childSelector} />;
    case 'announcements': return <ParentAnnouncements selector={childSelector} />;
    default: return <ParentDashboard parent={parent} children={children} selector={childSelector} selected={selected} setSelectedId={setSelectedId} />;
  }
}

function ParentDashboard({ parent, children, selector, selected, setSelectedId }: {
  parent: Parent;
  children: Student[];
  selector: React.ReactNode;
  selected: Student;
  setSelectedId: (id: string) => void;
}) {
  const { results, attendance, payments, announcements, currentSession, currentTerm } = useStore();
  const totalOutstanding = children.reduce((s, c) => s + c.feeBalance, 0);
  const allPublished = results.filter((r) => children.some((c) => c.id === r.studentId) && r.status === 'published');
  const overallAvg = allPublished.length ? Math.round(allPublished.reduce((s, r) => s + r.total, 0) / allPublished.length) : 0;
  const allAtt = attendance.filter((a) => children.some((c) => c.id === a.studentId));
  const presentDays = allAtt.filter((a) => a.status === 'present').length;
  const attRate = allAtt.length ? Math.round((presentDays / allAtt.length) * 100) : 0;
  const recentAnnouncements = announcements.filter((a) => a.audience === 'all' || a.audience === 'parents').slice(0, 3);

  const childPublished = results.filter((r) => r.studentId === selected.id && r.status === 'published');
  const childAvg = childPublished.length ? Math.round(childPublished.reduce((s, r) => s + r.total, 0) / childPublished.length) : 0;
  const childAtt = attendance.filter((a) => a.studentId === selected.id);
  const childPresent = childAtt.filter((a) => a.status === 'present').length;
  const childAttRate = childAtt.length ? Math.round((childPresent / childAtt.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-amber-600 to-slate-900 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-200 text-sm">Welcome, {parent.firstName}</p>
            <h2 className="text-2xl font-bold mt-1">Parent Dashboard</h2>
            <p className="text-slate-300 text-sm mt-2">Monitoring {children.length} children &middot; {currentSession}, {currentTerm}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur"><p className="text-xs text-slate-300">Outstanding Fees</p><p className="text-xl font-bold">{naira(totalOutstanding)}</p></div>
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur"><p className="text-xs text-slate-300">Avg Performance</p><p className="text-xl font-bold">{overallAvg}%</p></div>
          </div>
        </div>
      </div>

      <div className="card p-3">{selector}</div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Linked Children" value={children.length} tone="blue" />
        <StatCard icon={<TrendingUp size={20} />} label="Avg Performance" value={`${overallAvg}%`} sub={`${allPublished.length} published results`} tone="emerald" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Attendance (all)" value={`${attRate}%`} tone="amber" />
        <StatCard icon={<Wallet size={20} />} label="Outstanding Fees" value={naira(totalOutstanding)} tone={totalOutstanding > 0 ? 'rose' : 'emerald'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">{selected.firstName} {selected.lastName}</h3>
              <p className="text-xs text-slate-500">{selected.className} &middot; {selected.admissionNo}</p>
            </div>
            <Badge className="bg-blue-50 text-blue-700">Selected child</Badge>
          </div>
          {childPublished.length ? <BarChart data={childPublished.map((r) => ({ label: SUBJECTS.find((s) => s.id === r.subjectId)?.code ?? r.subjectId, value: r.total }))} max={100} height={180} /> : <EmptyState icon={<ClipboardList size={22} />} title="No published results" description="Results will appear once published." />}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div><p className="text-xs text-slate-500">Average</p><p className="text-lg font-bold text-slate-900">{childAvg}%</p></div>
            <div><p className="text-xs text-slate-500">Attendance</p><p className="text-lg font-bold text-slate-900">{childAttRate}%</p></div>
            <div><p className="text-xs text-slate-500">Fee Balance</p><p className={`text-lg font-bold ${selected.feeBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{naira(selected.feeBalance)}</p></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Megaphone size={18} className="text-blue-600" /> Announcements</h3>
          <div className="space-y-3">
            {recentAnnouncements.length ? recentAnnouncements.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-50">
                <p className="font-medium text-sm text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
                <p className="text-[10px] text-slate-400 mt-1">{a.createdAt}</p>
              </div>
            )) : <EmptyState icon={<Megaphone size={20} />} title="No announcements" />}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">All Children Overview</h3>
        <div className="table-wrap border-0">
          <table className="table">
            <thead><tr><th>Child</th><th>Class</th><th>Avg</th><th>Attendance</th><th>Fee Balance</th></tr></thead>
            <tbody>
              {children.map((c) => {
                const pub = results.filter((r) => r.studentId === c.id && r.status === 'published');
                const avg = pub.length ? Math.round(pub.reduce((s, r) => s + r.total, 0) / pub.length) : 0;
                const att = attendance.filter((a) => a.studentId === c.id);
                const pres = att.filter((a) => a.status === 'present').length;
                const rate = att.length ? Math.round((pres / att.length) * 100) : 0;
                return (
                  <tr key={c.id} className="cursor-pointer" onClick={() => setSelectedId(c.id)}>
                    <td><div className="flex items-center gap-3"><Avatar name={`${c.firstName} ${c.lastName}`} color={c.photoColor} size={30} /><span className="font-medium">{c.firstName} {c.lastName}</span></div></td>
                    <td><Badge className="bg-blue-50 text-blue-700">{c.className}</Badge></td>
                    <td>{pub.length ? `${avg}%` : '—'}</td>
                    <td>{rate}%</td>
                    <td className={c.feeBalance > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600'}>{naira(c.feeBalance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChildFrame({ child, selector, title, description }: { child: Student; selector: React.ReactNode; title: string; description: string }) {
  return (
    <div className="space-y-4">
      <SectionHeader title={title} description={description} />
      <div className="card p-3 flex items-center justify-between gap-3">
        {selector}
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-shrink-0">
          <Avatar name={`${child.firstName} ${child.lastName}`} color={child.photoColor} size={26} />
          <span className="hidden sm:inline font-medium text-slate-700">{child.firstName} {child.lastName}</span>
          <Badge className="bg-blue-50 text-blue-700">{child.className}</Badge>
        </div>
      </div>
    </div>
  );
}

function ParentResults({ child, selector }: { child: Student; selector: React.ReactNode }) {
  const { results, currentTerm, currentSession } = useStore();
  const published = results.filter((r) => r.studentId === child.id && r.status === 'published');
  const avg = published.length ? Math.round(published.reduce((s, r) => s + r.total, 0) / published.length) : 0;
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="space-y-4">
      <ChildFrame child={child} selector={selector} title="Results" description={`${child.firstName}'s published results — ${currentSession}, ${currentTerm}`} />
      {published.length === 0 ? (
        <div className="card"><EmptyState icon={<ClipboardList size={22} />} title="No published results" description={`No results published for ${child.firstName} yet.`} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={<TrendingUp size={18} />} label="Average" value={`${avg}%`} tone="blue" />
            <StatCard icon={<BookMarked size={18} />} label="Subjects" value={published.length} tone="emerald" />
            <StatCard icon={<CheckCircle2 size={18} />} label="Highest" value={Math.max(...published.map((r) => r.total))} tone="amber" />
          </div>
          <div className="card">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center"><h3 className="font-semibold text-slate-900">Subject Results</h3><button className="btn-primary text-sm" onClick={() => setReportOpen(true)}><ClipboardList size={14} /> Report Card</button></div>
            <div className="table-wrap border-0">
              <table className="table">
                <thead><tr><th>Subject</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead>
                <tbody>
                  {published.map((r) => {
                    const subj = SUBJECTS.find((s) => s.id === r.subjectId);
                    return <tr key={r.id}><td className="font-medium">{subj?.name}</td><td>{r.ca1}/20</td><td>{r.ca2}/20</td><td>{r.exam}/60</td><td className="font-semibold">{r.total}</td><td><Badge className={gradeColor(r.grade)}>{r.grade}</Badge></td><td className="text-xs">{r.remark}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report Card" subtitle={`${child.firstName} ${child.lastName} — ${currentTerm}, ${currentSession}`} size="lg">
        <ParentReportCard child={child} published={published} avg={avg} />
      </Modal>
    </div>
  );
}

function ParentReportCard({ child, published, avg }: { child: Student; published: ResultRecord[]; avg: number }) {
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
        <div><p className="text-xs text-slate-500">Student Name</p><p className="font-medium">{child.firstName} {child.lastName}</p></div>
        <div><p className="text-xs text-slate-500">Admission No</p><p className="font-medium font-mono">{child.admissionNo}</p></div>
        <div><p className="text-xs text-slate-500">Class</p><p className="font-medium">{child.className}</p></div>
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
    </div>
  );
}

function ParentAttendance({ child, selector }: { child: Student; selector: React.ReactNode }) {
  const { attendance } = useStore();
  const mine = attendance.filter((a) => a.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date));
  const present = mine.filter((a) => a.status === 'present').length;
  const absent = mine.filter((a) => a.status === 'absent').length;
  const late = mine.filter((a) => a.status === 'late').length;
  const rate = mine.length ? Math.round((present / mine.length) * 100) : 0;
  return (
    <div className="space-y-4">
      <ChildFrame child={child} selector={selector} title="Attendance" description={`${child.firstName}'s attendance records`} />
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

function ParentAssignments({ child, selector }: { child: Student; selector: React.ReactNode }) {
  const { assignments } = useStore();
  const mine = assignments.filter((a) => a.className === child.className);
  return (
    <div className="space-y-4">
      <ChildFrame child={child} selector={selector} title="Assignments" description={`${mine.length} assignments for ${child.firstName}'s class (${child.className})`} />
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

function ParentFees({ child, selector }: { child: Student; selector: React.ReactNode }) {
  const { payments } = useStore();
  const mine = payments.filter((p) => p.studentId === child.id && p.amount > 0);
  const paid = child.feeTotal - child.feeBalance;
  return (
    <div className="space-y-4">
      <ChildFrame child={child} selector={selector} title="Fees & Payments" description={`${child.firstName}'s fee records`} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Wallet size={18} />} label="Total Fee" value={naira(child.feeTotal)} tone="blue" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Paid" value={naira(paid)} tone="emerald" />
        <StatCard icon={<AlertTriangle size={18} />} label="Balance" value={naira(child.feeBalance)} tone={child.feeBalance > 0 ? 'rose' : 'emerald'} />
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-3">Payment Progress</h3>
        <ProgressRow label="Paid" value={paid} max={child.feeTotal} color={child.feeBalance > 0 ? '#f59e0b' : '#10b981'} />
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Payment History</h3></div>
        {mine.length === 0 ? <EmptyState icon={<Wallet size={22} />} title="No payments recorded" /> : (
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

function ParentAnnouncements({ selector }: { selector: React.ReactNode }) {
  const { announcements } = useStore();
  const mine = announcements.filter((a) => a.audience === 'all' || a.audience === 'parents');
  return (
    <div className="space-y-4">
      <SectionHeader title="Announcements" description="School and parent announcements" />
      <div className="card p-3">{selector}</div>
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
