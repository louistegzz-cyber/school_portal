import { useMemo, useState } from 'react';
import {
  BookOpen, Users, ClipboardCheck, Percent, ClipboardList, Megaphone, FolderOpen, Plus,
  Send, CheckCircle2, Save, CalendarCheck, GraduationCap, TrendingUp,
} from 'lucide-react';
import { useStore, gradeColor, statusColor, naira } from '../store';
import { SUBJECTS } from '../data/seed';
import { CLASSES } from '../types';
import type { ClassName, Student, Teacher } from '../types';
import { Modal, EmptyState, Avatar, StatCard, Badge, SectionHeader, Select, SearchInput } from './ui';
import { useToast } from './toast';
import { SharedTimetable } from './admin';
import { BarChart } from './charts';

export function TeacherPages({ page }: { page: string }) {
  const { currentUser, teachers } = useStore();
  const teacher = teachers.find((t) => t.id === currentUser?.refId) as Teacher;
  if (!teacher) return <EmptyState icon={<GraduationCap size={22} />} title="Teacher profile not found" />;
  switch (page) {
    case 'dashboard': return <TeacherDashboard teacher={teacher} />;
    case 'classes': return <TeacherClasses teacher={teacher} />;
    case 'students': return <TeacherStudents teacher={teacher} />;
    case 'attendance': return <TeacherAttendance teacher={teacher} />;
    case 'scores': return <TeacherScores teacher={teacher} />;
    case 'results': return <TeacherResults teacher={teacher} />;
    case 'assignments': return <TeacherAssignments teacher={teacher} />;
    case 'announcements': return <TeacherAnnouncements />;
    case 'timetable': return <SharedTimetable scope="teacher" teacherId={teacher.id} />;
    default: return <TeacherDashboard teacher={teacher} />;
  }
}

function TeacherDashboard({ teacher }: { teacher: Teacher }) {
  const { students, results, assignments, announcements, attendance } = useStore();
  const myStudents = students.filter((s) => teacher.classes.includes(s.className) && s.active);
  const myResults = results.filter((r) => r.teacherId === teacher.id);
  const submitted = myResults.filter((r) => r.status === 'submitted').length;
  const draft = myResults.filter((r) => r.status === 'draft').length;
  const myAssignments = assignments.filter((a) => a.teacherId === teacher.id);
  const myAttendance = attendance.filter((a) => a.recordedBy === teacher.id);
  const recentAnnouncements = announcements.filter((a) => a.audience === 'all' || a.audience === 'staff' || teacher.classes.includes(a.audience as ClassName)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-teal-700 to-slate-900 text-white border-0">
        <p className="text-teal-200 text-sm">Welcome, {teacher.firstName}</p>
        <h2 className="text-2xl font-bold mt-1">Teacher Dashboard</h2>
        <p className="text-slate-300 text-sm mt-2">You teach {teacher.subjects.length} subjects across {teacher.classes.length} classes ({myStudents.length} students total).</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={20} />} label="My Classes" value={teacher.classes.length} tone="blue" />
        <StatCard icon={<Users size={20} />} label="My Students" value={myStudents.length} tone="emerald" />
        <StatCard icon={<ClipboardList size={20} />} label="Draft Results" value={draft} sub={`${submitted} submitted`} tone="amber" />
        <StatCard icon={<FolderOpen size={20} />} label="Assignments" value={myAssignments.length} tone="violet" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Students per Class</h3>
          <BarChart data={teacher.classes.map((c) => ({ label: c, value: students.filter((s) => s.className === c && s.active).length }))} height={180} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">My Subjects</h3>
          <div className="grid grid-cols-2 gap-2">
            {teacher.subjects.map((sid) => {
              const subj = SUBJECTS.find((s) => s.id === sid);
              return (
                <div key={sid} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="font-medium text-sm text-blue-900">{subj?.name}</p>
                  <p className="text-xs text-blue-600 font-mono">{subj?.code}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Megaphone size={18} className="text-blue-600" /> Announcements</h3>
        <div className="space-y-3">
          {recentAnnouncements.map((a) => (
            <div key={a.id} className="p-3 rounded-xl bg-slate-50">
              <p className="font-medium text-sm text-slate-800">{a.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
              <p className="text-[10px] text-slate-400 mt-1">{a.createdAt} &middot; To: {a.audience}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherClasses({ teacher }: { teacher: Teacher }) {
  const { students, timetable } = useStore();
  return (
    <div className="space-y-5">
      <SectionHeader title="My Classes" description={`Classes assigned to ${teacher.firstName} ${teacher.lastName}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacher.classes.map((c) => {
          const count = students.filter((s) => s.className === c && s.active).length;
          const slots = timetable.filter((t) => t.className === c && t.teacherId === teacher.id);
          const subjects = new Set(slots.map((s) => s.subjectId));
          return (
            <div key={c} className="card p-5">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-50 text-blue-700">{c}</Badge>
                <BookOpen size={18} className="text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-3">{count}</p>
              <p className="text-xs text-slate-500">Students &middot; {subjects.size} subjects with you</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {Array.from(subjects).map((sid) => <Badge key={sid} className="bg-slate-100 text-slate-700">{SUBJECTS.find((s) => s.id === sid)?.code}</Badge>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherStudents({ teacher }: { teacher: Teacher }) {
  const { students } = useStore();
  const [q, setQ] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const myStudents = students.filter((s) => teacher.classes.includes(s.className) && s.active);
  const filtered = myStudents.filter((s) => {
    if (q && !`${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (classFilter && s.className !== classFilter) return false;
    return true;
  });
  return (
    <div className="space-y-5">
      <SectionHeader title="Student List" description={`${myStudents.length} students across your classes`} />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search students..." />
        <Select value={classFilter} onChange={setClassFilter} placeholder="All my classes" options={teacher.classes.map((c) => ({ value: c, label: c }))} />
      </div>
      <div className="card">
        {filtered.length ? (
          <div className="table-wrap border-0">
            <table className="table">
              <thead><tr><th>Student</th><th>Admission No</th><th>Class</th><th>Gender</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td><div className="flex items-center gap-3"><Avatar name={`${s.firstName} ${s.lastName}`} color={s.photoColor} size={32} /><span className="font-medium">{s.firstName} {s.lastName}</span></div></td>
                    <td className="font-mono text-xs">{s.admissionNo}</td>
                    <td><Badge className="bg-blue-50 text-blue-700">{s.className}</Badge></td>
                    <td>{s.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={<Users size={22} />} title="No students found" />}
      </div>
    </div>
  );
}

function TeacherAttendance({ teacher }: { teacher: Teacher }) {
  const { students, recordAttendance, attendance } = useStore();
  const { notify } = useToast();
  const [cls, setCls] = useState<ClassName>(teacher.classes[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const classStudents = students.filter((s) => s.className === cls && s.active);
  const [statuses, setStatuses] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});

  const existing = attendance.filter((a) => a.className === cls && a.date === date);
  const existingMap = useMemo(() => Object.fromEntries(existing.map((e) => [e.studentId, e.status])), [existing, cls, date]);

  const getStatus = (id: string) => statuses[id] ?? existingMap[id] ?? 'present';

  const save = () => {
    const entries = classStudents.map((s) => ({ studentId: s.id, status: getStatus(s.id) }));
    recordAttendance(date, cls, entries, teacher.id);
    notify(`Attendance saved for ${cls} on ${date}`);
    setStatuses({});
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Record Attendance" description="Mark daily attendance for your class" action={<button className="btn-primary" onClick={save}><Save size={16} /> Save Attendance</button>} />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><label className="label">Class</label><Select value={cls} onChange={(v) => setCls(v as ClassName)} options={teacher.classes.map((c) => ({ value: c, label: c }))} /></div>
        <div className="flex-1"><label className="label">Date</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      </div>
      <div className="card">
        {classStudents.length === 0 ? <EmptyState icon={<Users size={22} />} title="No students in this class" /> : (
          <div className="divide-y divide-slate-100">
            {classStudents.map((s) => {
              const st = getStatus(s.id);
              return (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3"><Avatar name={`${s.firstName} ${s.lastName}`} color={s.photoColor} size={32} /><div><p className="font-medium text-sm">{s.firstName} {s.lastName}</p><p className="text-xs text-slate-500 font-mono">{s.admissionNo}</p></div></div>
                  <div className="flex gap-1">
                    {(['present', 'absent', 'late', 'excused'] as const).map((opt) => (
                      <button key={opt} onClick={() => setStatuses({ ...statuses, [s.id]: opt })} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${st === opt ? statusColor(opt) + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherScores({ teacher }: { teacher: Teacher }) {
  const { students, results, saveScores, setResultStatus } = useStore();
  const { notify } = useToast();
  const [cls, setCls] = useState<ClassName>(teacher.classes[0]);
  const [subjectId, setSubjectId] = useState(teacher.subjects[0]);
  const classStudents = students.filter((s) => s.className === cls && s.active);
  const [scores, setScores] = useState<Record<string, { ca1: number; ca2: number; exam: number }>>({});
  const [dirty, setDirty] = useState(false);

  const getScore = (id: string) => {
    if (scores[id]) return scores[id];
    const existing = results.find((r) => r.studentId === id && r.subjectId === subjectId);
    return existing ? { ca1: existing.ca1, ca2: existing.ca2, exam: existing.exam } : { ca1: 0, ca2: 0, exam: 0 };
  };
  const setScore = (id: string, field: 'ca1' | 'ca2' | 'exam', value: number) => {
    const cur = getScore(id);
    const max = field === 'exam' ? 60 : 20;
    const v = Math.max(0, Math.min(max, value));
    setScores({ ...scores, [id]: { ...cur, [field]: v } });
    setDirty(true);
  };

  const save = () => {
    const records = classStudents.map((s) => {
      const sc = getScore(s.id);
      return { studentId: s.id, subjectId, ca1: sc.ca1, ca2: sc.ca2, exam: sc.exam, className: cls };
    });
    saveScores(records, teacher.id);
    notify(`Scores saved for ${cls} ${SUBJECTS.find((s) => s.id === subjectId)?.name}`);
    setDirty(false);
  };

  const submitForApproval = () => {
    save();
    const ids = results.filter((r) => r.studentId && r.className === cls && r.subjectId === subjectId && r.teacherId === teacher.id).map((r) => r.id);
    if (ids.length) {
      setResultStatus(ids, 'submitted');
      notify(`${ids.length} results submitted for admin approval`);
    } else {
      notify('Save scores first before submitting', 'error');
    }
  };

  const subjectOptions = teacher.subjects.map((sid) => ({ value: sid, label: SUBJECTS.find((s) => s.id === sid)?.name ?? sid }));

  return (
    <div className="space-y-5">
      <SectionHeader title="Enter Scores" description="Continuous assessment (CA1, CA2) and examination scores" action={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={save} disabled={!dirty}><Save size={16} /> Save Draft</button>
          <button className="btn-primary" onClick={submitForApproval}><Send size={16} /> Submit for Approval</button>
        </div>
      } />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><label className="label">Class</label><Select value={cls} onChange={(v) => { setCls(v as ClassName); setDirty(false); }} options={teacher.classes.map((c) => ({ value: c, label: c }))} /></div>
        <div className="flex-1"><label className="label">Subject</label><Select value={subjectId} onChange={(v) => { setSubjectId(v); setDirty(false); }} options={subjectOptions} /></div>
      </div>
      <div className="card">
        {classStudents.length === 0 ? <EmptyState icon={<Users size={22} />} title="No students" /> : (
          <div className="table-wrap border-0">
            <table className="table">
              <thead><tr><th>Student</th><th>CA1 (20)</th><th>CA2 (20)</th><th>Exam (60)</th><th>Total</th><th>Grade</th></tr></thead>
              <tbody>
                {classStudents.map((s) => {
                  const sc = getScore(s.id);
                  const total = sc.ca1 + sc.ca2 + sc.exam;
                  const g = total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : total >= 40 ? 'E' : 'F';
                  return (
                    <tr key={s.id}>
                      <td className="font-medium">{s.firstName} {s.lastName}</td>
                      <td><input type="number" min={0} max={20} className="input w-20 py-1" value={sc.ca1} onChange={(e) => setScore(s.id, 'ca1', Number(e.target.value))} /></td>
                      <td><input type="number" min={0} max={20} className="input w-20 py-1" value={sc.ca2} onChange={(e) => setScore(s.id, 'ca2', Number(e.target.value))} /></td>
                      <td><input type="number" min={0} max={60} className="input w-20 py-1" value={sc.exam} onChange={(e) => setScore(s.id, 'exam', Number(e.target.value))} /></td>
                      <td className="font-semibold">{total}</td>
                      <td><Badge className={gradeColor(g)}>{g}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">CA1 + CA2 + Exam = Total (out of 100). Grades: A ≥ 80, B ≥ 70, C ≥ 60, D ≥ 50, E ≥ 40, F &lt; 40.</p>
    </div>
  );
}

function TeacherResults({ teacher }: { teacher: Teacher }) {
  const { results, students, setResultStatus } = useStore();
  const { notify } = useToast();
  const myResults = results.filter((r) => r.teacherId === teacher.id);
  const grouped = useMemo(() => {
    const m = new Map<string, typeof myResults>();
    for (const r of myResults) {
      const k = `${r.className}-${r.subjectId}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return Array.from(m.entries());
  }, [myResults]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Submit Results" description="Review and submit your results for admin approval" />
      <div className="space-y-4">
        {grouped.map(([key, recs]) => {
          const subj = SUBJECTS.find((s) => s.id === recs[0].subjectId);
          const status = recs[0].status;
          return (
            <div key={key} className="card">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div><p className="font-semibold text-slate-900">{recs[0].className} — {subj?.name}</p><p className="text-xs text-slate-500">{recs.length} students</p></div>
                <Badge className={statusColor(status)}>{status}</Badge>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {status === 'draft' && <button className="btn-primary text-sm" onClick={() => { setResultStatus(recs.map((r) => r.id), 'submitted'); notify('Results submitted for approval'); }}><Send size={14} /> Submit for Approval</button>}
                {status === 'submitted' && <p className="text-sm text-amber-600 flex items-center gap-1"><TrendingUp size={14} /> Awaiting admin approval</p>}
                {status === 'approved' && <p className="text-sm text-blue-600 flex items-center gap-1"><CheckCircle2 size={14} /> Approved — pending publication by admin</p>}
                {status === 'published' && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Published to students</p>}
              </div>
              <div className="table-wrap border-0">
                <table className="table">
                  <thead><tr><th>Student</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
                  <tbody>
                    {recs.slice(0, 5).map((r) => {
                      const s = students.find((st) => st.id === r.studentId);
                      return <tr key={r.id}><td className="font-medium">{s?.firstName} {s?.lastName}</td><td>{r.ca1}</td><td>{r.ca2}</td><td>{r.exam}</td><td className="font-semibold">{r.total}</td><td><Badge className={gradeColor(r.grade)}>{r.grade}</Badge></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherAssignments({ teacher }: { teacher: Teacher }) {
  const { assignments, addAssignment } = useStore();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subjectId: teacher.subjects[0], className: teacher.classes[0] as ClassName, dueDate: '' });
  const myAssignments = assignments.filter((a) => a.teacherId === teacher.id);

  return (
    <div className="space-y-5">
      <SectionHeader title="Assignments" description="Create and publish assignments to your classes" action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Assignment</button>} />
      {myAssignments.length === 0 ? (
        <div className="card"><EmptyState icon={<FolderOpen size={22} />} title="No assignments yet" description="Create your first assignment." action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Assignment</button>} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAssignments.map((a) => {
            const subj = SUBJECTS.find((s) => s.id === a.subjectId);
            const overdue = new Date(a.dueDate) < new Date();
            return (
              <div key={a.id} className="card p-4">
                <div className="flex items-start justify-between"><Badge className="bg-blue-50 text-blue-700">{a.className}</Badge><Badge className={overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}>Due {a.dueDate}</Badge></div>
                <p className="font-semibold text-slate-900 mt-3">{a.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">{a.description}</p>
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">{subj?.name}</p>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New Assignment" size="md"
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!form.title || !form.description || !form.dueDate} onClick={() => { addAssignment(form); notify('Assignment published'); setOpen(false); setForm({ title: '', description: '', subjectId: teacher.subjects[0], className: teacher.classes[0], dueDate: '' }); }}>Publish</button></>}>
        <div className="space-y-3">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Description *</label><textarea className="input min-h-[90px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Subject</label><Select value={form.subjectId} onChange={(v) => setForm({ ...form, subjectId: v })} options={teacher.subjects.map((sid) => ({ value: sid, label: SUBJECTS.find((s) => s.id === sid)?.name ?? sid }))} /></div>
            <div><label className="label">Class</label><Select value={form.className} onChange={(v) => setForm({ ...form, className: v as ClassName })} options={teacher.classes.map((c) => ({ value: c, label: c }))} /></div>
          </div>
          <div><label className="label">Due Date *</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}

function TeacherAnnouncements() {
  const { announcements, currentUser } = useStore();
  const visible = announcements.filter((a) => a.audience === 'all' || a.audience === 'staff');
  return (
    <div className="space-y-5">
      <SectionHeader title="Announcements" description="School-wide and staff announcements" />
      <div className="space-y-3">
        {visible.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${a.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}><Megaphone size={18} /></div>
              <div><p className="font-semibold text-slate-900">{a.title}</p><p className="text-xs text-slate-500 mt-0.5">{a.createdAt} &middot; To: {a.audience}</p><p className="text-sm text-slate-600 mt-2">{a.body}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
