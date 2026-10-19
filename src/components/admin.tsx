import { useMemo, useState } from 'react';
import {
  Users, GraduationCap, UserCog, Wallet, TrendingUp, BookOpen, Megaphone, FolderOpen,
  ClipboardList, ClipboardCheck, Plus, Pencil, Ban, CheckCircle2, Eye, ArrowUpCircle,
  ArrowRight, FileText, History, Settings as SettingsIcon, CalendarDays, Search,
  Send, CheckCheck, BookMarked, AlertTriangle, Building2, CalendarCheck,
} from 'lucide-react';
import { useStore, naira, gradeColor, statusColor } from '../store';
import { SUBJECTS } from '../data/seed';
import { CLASSES, TERMS } from '../types';
import type { ClassName, Term, Student, Teacher, ResultRecord } from '../types';
import {
  Modal, ConfirmDialog, EmptyState, Avatar, StatCard, Badge, SectionHeader,
  SearchInput, Select,
} from './ui';
import { useToast } from './toast';
import { BarChart, Donut, ProgressRow } from './charts';

export function AdminPages({ page }: { page: string }) {
  switch (page) {
    case 'dashboard': return <AdminDashboard />;
    case 'students': return <AdminStudents />;
    case 'teachers': return <AdminTeachers />;
    case 'parents': return <AdminParents />;
    case 'classes': return <AdminClasses />;
    case 'sessions': return <AdminSessions />;
    case 'attendance': return <AdminAttendance />;
    case 'results': return <AdminResults />;
    case 'promotion': return <AdminPromotion />;
    case 'timetable': return <AdminTimetable />;
    case 'assignments': return <AdminAssignments />;
    case 'fees': return <AdminFees />;
    case 'announcements': return <AdminAnnouncements />;
    case 'reports': return <AdminReports />;
    case 'activity': return <AdminActivity />;
    case 'settings': return <AdminSettings />;
    default: return <AdminDashboard />;
  }
}

function AdminDashboard() {
  const { students, teachers, parents, results, attendance, payments, announcements, activityLogs, currentSession, currentTerm } = useStore();

  const activeStudents = students.filter((s) => s.active).length;
  const activeTeachers = teachers.filter((t) => t.active).length;
  const totalFeesExpected = students.reduce((s, st) => s + st.feeTotal, 0);
  const totalFeesPaid = students.reduce((s, st) => s + (st.feeTotal - st.feeBalance), 0);
  const collectionRate = Math.round((totalFeesPaid / (totalFeesExpected || 1)) * 100);

  const today = new Date().toISOString().slice(0, 10);
  const todaysAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todaysAttendance.filter((a) => a.status === 'present').length;
  const attendanceRate = todaysAttendance.length ? Math.round((presentToday / todaysAttendance.length) * 100) : 0;

  const studentsByClass: { label: string; value: number; color?: string }[] = CLASSES.map((c, i) => ({
    label: c,
    value: students.filter((s) => s.className === c).length,
    color: ['#2563eb', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#16a34a'][i],
  }));

  const pendingResults = results.filter((r) => r.status === 'submitted').length;
  const draftResults = results.filter((r) => r.status === 'draft').length;
  const publishedResults = results.filter((r) => r.status === 'published').length;

  const resultsByStatus = [
    { label: 'Draft', value: draftResults, color: '#94a3b8' },
    { label: 'Submitted', value: pendingResults, color: '#f59e0b' },
    { label: 'Approved', value: results.filter((r) => r.status === 'approved').length, color: '#3b82f6' },
    { label: 'Published', value: publishedResults, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-300 text-sm font-medium">Welcome back, Administrator</p>
            <h2 className="text-2xl font-bold mt-1">School Overview — {currentSession}, {currentTerm}</h2>
            <p className="text-slate-300 text-sm mt-2">Manage all aspects of {students.length} students, {teachers.length} teachers and {parents.length} parents.</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-xs text-slate-300">Collection rate</p>
              <p className="text-xl font-bold">{collectionRate}%</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur">
              <p className="text-xs text-slate-300">Attendance today</p>
              <p className="text-xl font-bold">{attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="Students" value={activeStudents} sub={`${students.length - activeStudents} inactive`} tone="blue" />
        <StatCard icon={<GraduationCap size={20} />} label="Teachers" value={activeTeachers} sub={`${parents.length} parents linked`} tone="emerald" />
        <StatCard icon={<ClipboardCheck size={20} />} label="Attendance Today" value={`${attendanceRate}%`} sub={`${presentToday}/${todaysAttendance.length} present`} tone="amber" />
        <StatCard icon={<Wallet size={20} />} label="Fees Collected" value={naira(totalFeesPaid)} sub={`${collectionRate}% of ${naira(totalFeesExpected)}`} tone="cyan" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Students by Class</h3>
              <p className="text-xs text-slate-500">Distribution across JSS &amp; SS classes</p>
            </div>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <BarChart data={studentsByClass} height={200} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Results Status</h3>
          <Donut data={resultsByStatus} size={150} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Fee Collection by Class</h3>
          <div className="space-y-3">
            {CLASSES.map((c) => {
              const cls = students.filter((s) => s.className === c);
              const expected = cls.reduce((s, st) => s + st.feeTotal, 0);
              const paid = cls.reduce((s, st) => s + (st.feeTotal - st.feeBalance), 0);
              return <ProgressRow key={c} label={c} value={paid} max={expected} color="#2563eb" />;
            })}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <History size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-700 line-clamp-2">{log.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{log.actor} &middot; {log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Announcements</h3>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <Megaphone size={16} className={a.priority === 'high' ? 'text-rose-500 mt-0.5' : 'text-blue-500 mt-0.5'} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Pending Approvals</h3>
          {pendingResults > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle size={18} />
                <p className="font-semibold text-sm">{pendingResults} results awaiting approval</p>
              </div>
              <p className="text-xs text-amber-700 mt-2">Teachers have submitted results that need your review before publication.</p>
            </div>
          ) : (
            <EmptyState icon={<CheckCircle2 size={22} />} title="No pending approvals" description="All submitted results have been processed." />
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Students -----
function AdminStudents() {
  const { students, parents, addStudent, updateStudent, toggleStudentActive } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    if (q && !`${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (classFilter && s.className !== classFilter) return false;
    if (statusFilter === 'active' && !s.active) return false;
    if (statusFilter === 'inactive' && s.active) return false;
    return true;
  });

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (s: Student) => { setEditing(s); setModalOpen(true); };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Students"
        description={`${students.length} students enrolled across all classes`}
        action={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Add Student</button>}
      />

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search by name or admission no..." />
          <Select value={classFilter} onChange={setClassFilter} placeholder="All classes" options={CLASSES.map((c) => ({ value: c, label: c }))} />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={22} />} title="No students found" description="Try adjusting your search or filters." />
        ) : (
          <div className="table-wrap border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th><th>Admission No</th><th>Class</th><th>Gender</th><th>Fee Balance</th><th>Status</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${s.firstName} ${s.lastName}`} color={s.photoColor} size={32} />
                        <div>
                          <p className="font-medium text-slate-900">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-slate-500">{parents.find((p) => p.id === s.parentId)?.lastName ?? '—'} family</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{s.admissionNo}</td>
                    <td><Badge className="bg-blue-50 text-blue-700">{s.className}</Badge></td>
                    <td>{s.gender}</td>
                    <td>
                      {s.feeBalance > 0 ? <span className="text-rose-600 font-medium">{naira(s.feeBalance)}</span> : <span className="text-emerald-600 font-medium">Cleared</span>}
                    </td>
                    <td><Badge className={s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}>{s.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => setViewing(s)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" title="View"><Eye size={16} /></button>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => setConfirmDeactivate(s)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" title={s.active ? 'Deactivate' : 'Activate'}><Ban size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StudentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSubmit={(data) => {
          if (editing) {
            updateStudent(editing.id, data);
            notify('Student record updated');
          } else {
            addStudent(data as Omit<Student, 'id' | 'photoColor'>);
            notify('New student added successfully');
          }
          setModalOpen(false);
        }}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Student Details" size="md">
        {viewing && <StudentDetail student={viewing} />}
      </Modal>

      <ConfirmDialog
        open={!!confirmDeactivate}
        title={confirmDeactivate?.active ? 'Deactivate Student' : 'Reactivate Student'}
        message={confirmDeactivate?.active
          ? `Are you sure you want to deactivate ${confirmDeactivate.firstName} ${confirmDeactivate.lastName}? They will lose portal access until reactivated.`
          : `Reactivate ${confirmDeactivate?.firstName} ${confirmDeactivate?.lastName}? They will regain portal access.`}
        confirmLabel={confirmDeactivate?.active ? 'Deactivate' : 'Reactivate'}
        danger={confirmDeactivate?.active}
        onConfirm={() => {
          if (confirmDeactivate) {
            toggleStudentActive(confirmDeactivate.id);
            notify(`Student ${confirmDeactivate.active ? 'deactivated' : 'reactivated'}`);
            setConfirmDeactivate(null);
          }
        }}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </div>
  );
}

function StudentFormModal({ open, onClose, editing, onSubmit }: {
  open: boolean;
  onClose: () => void;
  editing: Student | null;
  onSubmit: (data: Partial<Student>) => void;
}) {
  const { parents } = useStore();
  const [form, setForm] = useState({
    firstName: '', lastName: '', middleName: '', gender: 'Male' as 'Male' | 'Female',
    className: 'JSS1' as ClassName, dateOfBirth: '', parentId: '', feeTotal: 150000, feeBalance: 150000,
  });

  // re-sync when opening
  useMemo(() => {
    if (editing) {
      setForm({
        firstName: editing.firstName, lastName: editing.lastName, middleName: editing.middleName ?? '',
        gender: editing.gender, className: editing.className, dateOfBirth: editing.dateOfBirth,
        parentId: editing.parentId, feeTotal: editing.feeTotal, feeBalance: editing.feeBalance,
      });
    } else {
      setForm({ firstName: '', lastName: '', middleName: '', gender: 'Male', className: 'JSS1', dateOfBirth: '', parentId: '', feeTotal: 150000, feeBalance: 150000 });
    }
  }, [editing, open]);

  const valid = form.firstName.trim() && form.lastName.trim() && form.dateOfBirth && form.parentId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Student' : 'Add New Student'}
      subtitle={editing ? editing.admissionNo : 'New admission'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={() => onSubmit(form)}>
            {editing ? 'Save Changes' : 'Add Student'}
          </button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Tunde" />
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Okafor" />
        </div>
        <div>
          <label className="label">Middle Name</label>
          <input className="input" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
        </div>
        <div>
          <label className="label">Gender *</label>
          <Select value={form.gender} onChange={(v) => setForm({ ...form, gender: v as 'Male' | 'Female' })} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
        </div>
        <div>
          <label className="label">Class *</label>
          <Select value={form.className} onChange={(v) => {
            const cls = v as ClassName;
            const fee = cls.startsWith('SS') ? 185000 : 150000;
            setForm({ ...form, className: cls, feeTotal: fee, feeBalance: fee });
          }} options={CLASSES.map((c) => ({ value: c, label: c }))} />
        </div>
        <div>
          <label className="label">Date of Birth *</label>
          <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Parent / Guardian *</label>
          <Select value={form.parentId} onChange={(v) => setForm({ ...form, parentId: v })} placeholder="Select parent" options={parents.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.relationship})` }))} />
        </div>
        <div>
          <label className="label">Total Fee (₦)</label>
          <input type="number" className="input" value={form.feeTotal} onChange={(e) => setForm({ ...form, feeTotal: Number(e.target.value), feeBalance: Number(e.target.value) - (form.feeTotal - form.feeBalance) })} />
        </div>
        <div>
          <label className="label">Opening Balance (₦)</label>
          <input type="number" className="input" value={form.feeBalance} onChange={(e) => setForm({ ...form, feeBalance: Number(e.target.value) })} />
        </div>
      </div>
      {!valid && <p className="text-xs text-rose-500 mt-3">Please fill all required (*) fields.</p>}
    </Modal>
  );
}

function StudentDetail({ student }: { student: Student }) {
  const { parents, attendance, results, payments } = useStore();
  const parent = parents.find((p) => p.id === student.parentId);
  const stuAttendance = attendance.filter((a) => a.studentId === student.id);
  const present = stuAttendance.filter((a) => a.status === 'present').length;
  const rate = stuAttendance.length ? Math.round((present / stuAttendance.length) * 100) : 0;
  const stuResults = results.filter((r) => r.studentId === student.id && r.status === 'published');
  const stuPayments = payments.filter((p) => p.studentId === student.id && p.amount > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar name={`${student.firstName} ${student.lastName}`} color={student.photoColor} size={56} />
        <div>
          <p className="font-semibold text-lg text-slate-900">{student.firstName} {student.lastName}</p>
          <p className="text-sm text-slate-500 font-mono">{student.admissionNo}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Class" value={student.className} />
        <Field label="Gender" value={student.gender} />
        <Field label="Date of Birth" value={student.dateOfBirth} />
        <Field label="Status" value={student.active ? 'Active' : 'Inactive'} />
        <Field label="Enrolled" value={student.enrolledAt} />
        <Field label="Attendance Rate" value={`${rate}%`} />
        <Field label="Fee Balance" value={naira(student.feeBalance)} />
        <Field label="Total Fee" value={naira(student.feeTotal)} />
      </div>
      {parent && (
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Parent / Guardian</p>
          <p className="text-sm font-medium">{parent.firstName} {parent.lastName} ({parent.relationship})</p>
          <p className="text-xs text-slate-500">{parent.phone} &middot; {parent.email}</p>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recent Payments</p>
        {stuPayments.length ? (
          <div className="space-y-1.5">
            {stuPayments.slice(0, 3).map((p) => (
              <div key={p.id} className="flex justify-between text-sm p-2 rounded-lg bg-slate-50">
                <span>{p.description}</span>
                <span className="font-medium text-emerald-600">{naira(p.amount)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-400">No payments recorded.</p>}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-slate-50">
      <p className="text-[10px] uppercase font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

// ----- Teachers -----
function AdminTeachers() {
  const { teachers, addTeacher, updateTeacher } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const filtered = teachers.filter((t) => !q || `${t.firstName} ${t.lastName} ${t.staffNo} ${t.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Teachers"
        description={`${teachers.length} teaching staff`}
        action={<button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Add Teacher</button>}
      />
      <div className="card p-4"><SearchInput value={q} onChange={setQ} placeholder="Search teachers..." /></div>
      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState icon={<GraduationCap size={22} />} title="No teachers found" />
        ) : (
          <div className="table-wrap border-0">
            <table className="table">
              <thead><tr><th>Teacher</th><th>Staff No</th><th>Subjects</th><th>Classes</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={`${t.firstName} ${t.lastName}`} color="#0d9488" size={32} />
                        <div>
                          <p className="font-medium">{t.firstName} {t.lastName}</p>
                          <p className="text-xs text-slate-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{t.staffNo}</td>
                    <td><div className="flex flex-wrap gap-1">{t.subjects.map((sid) => <Badge key={sid} className="bg-blue-50 text-blue-700">{SUBJECTS.find((s) => s.id === sid)?.code}</Badge>)}</div></td>
                    <td><div className="flex flex-wrap gap-1">{t.classes.map((c) => <Badge key={c} className="bg-slate-100 text-slate-700">{c}</Badge>)}</div></td>
                    <td><Badge className={t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}>{t.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="text-right">
                      <button onClick={() => { setEditing(t); setModalOpen(true); }} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TeacherFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} onSubmit={(data) => {
        if (editing) { updateTeacher(editing.id, data); notify('Teacher updated'); }
        else { addTeacher(data as Omit<Teacher, 'id'>); notify('Teacher added'); }
        setModalOpen(false);
      }} />
    </div>
  );
}

function TeacherFormModal({ open, onClose, editing, onSubmit }: { open: boolean; onClose: () => void; editing: Teacher | null; onSubmit: (d: Partial<Teacher>) => void }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'Male' as 'Male' | 'Female', email: '', phone: '',
    subjects: [] as string[], classes: [] as ClassName[], hiredAt: '', active: true, staffNo: '',
  });
  useMemo(() => {
    if (editing) setForm({ firstName: editing.firstName, lastName: editing.lastName, gender: editing.gender, email: editing.email, phone: editing.phone, subjects: editing.subjects, classes: editing.classes, hiredAt: editing.hiredAt, active: editing.active, staffNo: editing.staffNo });
    else setForm({ firstName: '', lastName: '', gender: 'Male', email: '', phone: '', subjects: [], classes: [], hiredAt: new Date().toISOString().slice(0, 10), active: true, staffNo: `STF/${Math.floor(Math.random() * 900 + 100)}` });
  }, [editing, open]);
  const valid = form.firstName && form.lastName && form.email;
  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Teacher' : 'Add Teacher'} size="lg"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={!valid} onClick={() => onSubmit(form)}>{editing ? 'Save' : 'Add Teacher'}</button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">First Name *</label><input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><label className="label">Last Name *</label><input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        <div><label className="label">Gender</label><Select value={form.gender} onChange={(v) => setForm({ ...form, gender: v as 'Male' | 'Female' })} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Email *</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Staff No</label><input className="input" value={form.staffNo} onChange={(e) => setForm({ ...form, staffNo: e.target.value })} /></div>
        <div><label className="label">Hired Date</label><input type="date" className="input" value={form.hiredAt} onChange={(e) => setForm({ ...form, hiredAt: e.target.value })} /></div>
        <div className="sm:col-span-2">
          <label className="label">Subjects</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button key={s.id} type="button" onClick={() => setForm({ ...form, subjects: toggle(form.subjects, s.id) })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${form.subjects.includes(s.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>{s.name}</button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Classes</label>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button key={c} type="button" onClick={() => setForm({ ...form, classes: toggle(form.classes, c) as ClassName[] })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${form.classes.includes(c) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300'}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ----- Parents -----
function AdminParents() {
  const { parents, students } = useStore();
  const [q, setQ] = useState('');
  const filtered = parents.filter((p) => !q || `${p.firstName} ${p.lastName} ${p.email} ${p.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <SectionHeader title="Parents & Guardians" description={`${parents.length} parents registered`} />
      <div className="card p-4"><SearchInput value={q} onChange={setQ} placeholder="Search parents..." /></div>
      <div className="card">
        <div className="table-wrap border-0">
          <table className="table">
            <thead><tr><th>Parent</th><th>Relationship</th><th>Contact</th><th>Occupation</th><th>Children</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><div className="flex items-center gap-3"><Avatar name={`${p.firstName} ${p.lastName}`} color="#7c3aed" size={32} /><div><p className="font-medium">{p.firstName} {p.lastName}</p><p className="text-xs text-slate-500">{p.email}</p></div></div></td>
                  <td>{p.relationship}</td>
                  <td>{p.phone}</td>
                  <td>{p.occupation}</td>
                  <td><div className="flex flex-wrap gap-1">{p.childIds.map((cid) => { const c = students.find((s) => s.id === cid); return c ? <Badge key={cid} className="bg-blue-50 text-blue-700">{c.firstName} {c.className}</Badge> : null; })}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----- Classes & Subjects -----
function AdminClasses() {
  const { students, teachers, timetable } = useStore();
  return (
    <div className="space-y-5">
      <SectionHeader title="Classes & Subjects" description="Class population, subjects and assigned teachers" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Class Population</h3>
          <div className="space-y-3">
            {CLASSES.map((c) => {
              const count = students.filter((s) => s.className === c && s.active).length;
              const subjectsCount = new Set(timetable.filter((t) => t.className === c).map((t) => t.subjectId)).size;
              const classTeachers = teachers.filter((t) => t.classes.includes(c));
              return (
                <div key={c} className="p-4 rounded-xl border border-slate-200 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{c}</p>
                      <p className="text-xs text-slate-500">{count} students &middot; {subjectsCount} subjects &middot; {classTeachers.length} teachers</p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700">{c.startsWith('SS') ? 'Senior' : 'Junior'}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Subjects Offered</h3>
          <div className="grid grid-cols-2 gap-2">
            {SUBJECTS.map((s) => (
              <div key={s.id} className="p-3 rounded-xl border border-slate-200">
                <p className="font-medium text-sm text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-500 font-mono">{s.code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Sessions & Terms -----
function AdminSessions() {
  const { sessions, currentSession, currentTerm, setCurrentSession, setCurrentTerm } = useStore();
  const { notify } = useToast();
  return (
    <div className="space-y-5">
      <SectionHeader title="Academic Sessions & Terms" description="Manage school sessions and the active term" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-blue-600" /> Sessions</h3>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className={`p-4 rounded-xl border ${s.name === currentSession ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">Current term: {s.currentTerm}</p>
                  </div>
                  {s.active ? <Badge className="bg-emerald-100 text-emerald-700">Active</Badge> : <button className="btn-secondary text-xs px-3 py-1" onClick={() => { setCurrentSession(s.name); notify(`Switched to ${s.name} session`); }}>Activate</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><CalendarCheck size={18} className="text-blue-600" /> Active Term</h3>
          <p className="text-sm text-slate-500 mb-4">Currently in <span className="font-semibold text-slate-800">{currentTerm}</span> of <span className="font-semibold text-slate-800">{currentSession}</span> session.</p>
          <div className="space-y-2">
            {TERMS.map((t) => (
              <button key={t} onClick={() => { setCurrentTerm(t); notify(`Term switched to ${t}`); }} className={`w-full p-3 rounded-xl text-left text-sm font-medium border ${t === currentTerm ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                {t} {t === currentTerm && <CheckCircle2 size={16} className="inline ml-1" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Attendance -----
function AdminAttendance() {
  const { students, attendance, teachers } = useStore();
  const [classFilter, setClassFilter] = useState<ClassName>('JSS1');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const classStudents = students.filter((s) => s.className === classFilter && s.active);
  const dayRecords = attendance.filter((a) => a.className === classFilter && a.date === date);
  const present = dayRecords.filter((a) => a.status === 'present').length;
  const absent = dayRecords.filter((a) => a.status === 'absent').length;
  const late = dayRecords.filter((a) => a.status === 'late').length;

  return (
    <div className="space-y-5">
      <SectionHeader title="Attendance" description="Review attendance records by class and date" />
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><label className="label">Class</label><Select value={classFilter} onChange={(v) => setClassFilter(v as ClassName)} options={CLASSES.map((c) => ({ value: c, label: c }))} /></div>
          <div className="flex-1"><label className="label">Date</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<CheckCircle2 size={18} />} label="Present" value={present} tone="emerald" />
        <StatCard icon={<Ban size={18} />} label="Absent" value={absent} tone="rose" />
        <StatCard icon={<AlertTriangle size={18} />} label="Late" value={late} tone="amber" />
      </div>
      <div className="card">
        {dayRecords.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={22} />} title="No attendance recorded" description={`No records for ${classFilter} on ${date}.`} />
        ) : (
          <div className="table-wrap border-0">
            <table className="table">
              <thead><tr><th>Student</th><th>Status</th><th>Recorded By</th></tr></thead>
              <tbody>
                {dayRecords.map((r) => {
                  const s = students.find((st) => st.id === r.studentId);
                  const t = teachers.find((te) => te.id === r.recordedBy);
                  return (
                    <tr key={r.id}>
                      <td>{s ? `${s.firstName} ${s.lastName}` : r.studentId}</td>
                      <td><Badge className={statusColor(r.status)}>{r.status}</Badge></td>
                      <td className="text-xs">{t ? `${t.firstName} ${t.lastName}` : r.recordedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- Results & Approval -----
function AdminResults() {
  const { results, students, teachers, setResultStatus } = useStore();
  const { notify } = useToast();
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [classFilter, setClassFilter] = useState('');
  const [viewing, setViewing] = useState<ResultRecord | null>(null);

  const filtered = results.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (classFilter && r.className !== classFilter) return false;
    return true;
  });

  const groupedBySubject = useMemo(() => {
    const map = new Map<string, ResultRecord[]>();
    for (const r of filtered) {
      const key = `${r.className}-${r.subjectId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const approveAll = () => {
    setResultStatus(filtered.map((r) => r.id), 'approved');
    notify(`${filtered.length} results approved`);
  };
  const publishAll = () => {
    setResultStatus(filtered.map((r) => r.id), 'published');
    notify(`${filtered.length} results published to students`);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Results & Approval"
        description="Review, approve and publish submitted results"
        action={statusFilter === 'submitted' ? <button className="btn-primary" onClick={approveAll}><CheckCheck size={16} /> Approve All</button> : statusFilter === 'approved' ? <button className="btn-primary" onClick={publishAll}><Send size={16} /> Publish All</button> : null}
      />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><label className="label">Status</label>
          <Select value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'draft', label: 'Draft' }, { value: 'submitted', label: 'Submitted' }, { value: 'approved', label: 'Approved' }, { value: 'published', label: 'Published' },
          ]} />
        </div>
        <div className="flex-1"><label className="label">Class</label><Select value={classFilter} onChange={setClassFilter} placeholder="All classes" options={CLASSES.map((c) => ({ value: c, label: c }))} /></div>
      </div>

      {groupedBySubject.length === 0 ? (
        <div className="card"><EmptyState icon={<ClipboardList size={22} />} title="No results found" description="No results match the current filters." /></div>
      ) : (
        <div className="space-y-4">
          {groupedBySubject.map(([key, recs]) => {
            const cls = recs[0].className;
            const subj = SUBJECTS.find((s) => s.id === recs[0].subjectId);
            const teacher = teachers.find((t) => t.id === recs[0].teacherId);
            return (
              <div key={key} className="card">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{cls} — {subj?.name}</p>
                    <p className="text-xs text-slate-500">{recs.length} students &middot; by {teacher ? `${teacher.firstName} ${teacher.lastName}` : '—'}</p>
                  </div>
                  <Badge className={statusColor(recs[0].status)}>{recs[0].status}</Badge>
                </div>
                <div className="table-wrap border-0">
                  <table className="table">
                    <thead><tr><th>Student</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead>
                    <tbody>
                      {recs.map((r) => {
                        const s = students.find((st) => st.id === r.studentId);
                        return (
                          <tr key={r.id} className="cursor-pointer" onClick={() => setViewing(r)}>
                            <td className="font-medium">{s ? `${s.firstName} ${s.lastName}` : r.studentId}</td>
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
            );
          })}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Result Detail" size="sm">
        {viewing && (() => {
          const s = students.find((st) => st.id === viewing.studentId);
          const subj = SUBJECTS.find((su) => su.id === viewing.subjectId);
          return (
            <div className="space-y-3">
              <p className="font-semibold">{s?.firstName} {s?.lastName}</p>
              <p className="text-sm text-slate-500">{subj?.name} — {viewing.className}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="CA1 (20)" value={String(viewing.ca1)} />
                <Field label="CA2 (20)" value={String(viewing.ca2)} />
                <Field label="Exam (60)" value={String(viewing.exam)} />
                <Field label="Total" value={String(viewing.total)} />
                <Field label="Grade" value={viewing.grade} />
                <Field label="Remark" value={viewing.remark} />
              </div>
              <div className="flex gap-2 pt-2">
                {viewing.status === 'submitted' && <button className="btn-primary flex-1" onClick={() => { setResultStatus([viewing.id], 'approved'); notify('Result approved'); setViewing(null); }}><CheckCheck size={16} /> Approve</button>}
                {viewing.status === 'approved' && <button className="btn-primary flex-1" onClick={() => { setResultStatus([viewing.id], 'published'); notify('Result published'); setViewing(null); }}><Send size={16} /> Publish</button>}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ----- Promotion -----
function AdminPromotion() {
  const { students, promoteStudents } = useStore();
  const { notify } = useToast();
  const [fromClass, setFromClass] = useState<ClassName>('JSS1');
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const order: ClassName[] = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];
  const nextClass = (c: ClassName): ClassName | 'Graduated' => {
    const i = order.indexOf(c);
    if (i === order.length - 1) return 'Graduated';
    return order[i + 1];
  };

  const targets = students.filter((s) => s.className === fromClass && s.active);
  const mappings = targets.map((s) => ({ studentId: s.id, fromClass: s.className, toClass: nextClass(s.className) }));

  return (
    <div className="space-y-5">
      <SectionHeader title="Student Promotion" description="Promote students to the next class at the end of a session" />
      <div className="card p-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 mb-5">
          <AlertTriangle size={18} className="text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">Promotion moves all active students in the selected class to the next class. SS3 students will be marked as graduated (deactivated). Review the preview before confirming.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1"><label className="label">Promote students from</label><Select value={fromClass} onChange={(v) => setFromClass(v as ClassName)} options={CLASSES.map((c) => ({ value: c, label: c }))} /></div>
          <button className="btn-primary" onClick={() => setPreview(true)} disabled={targets.length === 0}><Eye size={16} /> Preview Promotion</button>
        </div>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} title="Promotion Preview" subtitle={`${targets.length} students in ${fromClass}`} size="lg"
        footer={<><button className="btn-secondary" onClick={() => setPreview(false)}>Cancel</button><button className="btn-primary" onClick={() => setConfirm(true)}><ArrowUpCircle size={16} /> Confirm Promotion</button></>}>
        {targets.length === 0 ? <EmptyState icon={<Users size={22} />} title="No students to promote" /> : (
          <div className="table-wrap border-0">
            <table className="table">
              <thead><tr><th>Student</th><th>Admission No</th><th>From</th><th></th><th>To</th></tr></thead>
              <tbody>
                {targets.map((s) => {
                  const to = nextClass(s.className);
                  return (
                    <tr key={s.id}>
                      <td className="font-medium">{s.firstName} {s.lastName}</td>
                      <td className="font-mono text-xs">{s.admissionNo}</td>
                      <td><Badge className="bg-slate-100 text-slate-700">{s.className}</Badge></td>
                      <td><ArrowRight size={14} className="text-slate-400" /></td>
                      <td>{to === 'Graduated' ? <Badge className="bg-violet-100 text-violet-700">Graduated</Badge> : <Badge className="bg-emerald-100 text-emerald-700">{to}</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirm} title="Confirm Promotion" message={`This will promote ${targets.length} student(s) from ${fromClass}. This action will update their class assignments permanently. Continue?`} confirmLabel="Promote Now" danger
        onConfirm={() => { promoteStudents(mappings); notify(`Promoted ${targets.length} student(s) from ${fromClass}`); setConfirm(false); setPreview(false); }}
        onCancel={() => setConfirm(false)} />
    </div>
  );
}

// ----- Timetable (admin view) -----
function AdminTimetable() {
  return <SharedTimetable scope="admin" />;
}

function SharedTimetable({ scope, classFilter: initClass, teacherId }: { scope: 'admin' | 'teacher' | 'student' | 'parent'; classFilter?: ClassName; teacherId?: string }) {
  const { timetable, teachers, students } = useStore();
  const [cls, setCls] = useState<ClassName>(initClass ?? 'JSS1');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
  const slots = timetable.filter((t) => t.className === cls);
  const visibleSlots = scope === 'teacher' && teacherId ? slots.filter((s) => s.teacherId === teacherId) : slots;

  return (
    <div className="space-y-5">
      {scope === 'admin' && <SectionHeader title="Timetable" description="Weekly class schedules" />}
      {scope === 'admin' && (
        <div className="card p-4"><div className="sm:w-64"><label className="label">Class</label><Select value={cls} onChange={(v) => setCls(v as ClassName)} options={CLASSES.map((c) => ({ value: c, label: c }))} /></div></div>
      )}
      <div className="card p-4 overflow-x-auto">
        <table className="table min-w-[700px]">
          <thead><tr><th>Time</th>{days.map((d) => <th key={d}>{d}</th>)}</tr></thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
              const sample = slots.find((s) => s.period === p);
              if (!sample) return null;
              return (
                <tr key={p}>
                  <td className="text-xs font-medium text-slate-600">{sample.startTime}<br />{sample.endTime}</td>
                  {days.map((d) => {
                    const slot = visibleSlots.find((s) => s.day === d && s.period === p);
                    if (!slot) return <td key={d} className="bg-slate-50/50 text-center text-xs text-slate-400">—</td>;
                    const subj = SUBJECTS.find((su) => su.id === slot.subjectId);
                    const t = teachers.find((te) => te.id === slot.teacherId);
                    return (
                      <td key={d}>
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="font-semibold text-xs text-blue-900">{subj?.code}</p>
                          <p className="text-[10px] text-blue-600">{t?.firstName} {t?.lastName}</p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----- Assignments (admin) -----
function AdminAssignments() {
  const { assignments, teachers } = useStore();
  return (
    <div className="space-y-5">
      <SectionHeader title="Assignments" description={`${assignments.length} assignments across all classes`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a) => {
          const subj = SUBJECTS.find((s) => s.id === a.subjectId);
          const t = teachers.find((te) => te.id === a.teacherId);
          const overdue = new Date(a.dueDate) < new Date();
          return (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <Badge className="bg-blue-50 text-blue-700">{a.className}</Badge>
                <Badge className={overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}>Due {a.dueDate}</Badge>
              </div>
              <p className="font-semibold text-slate-900 mt-3">{a.title}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>{subj?.name}</span>
                <span>{t?.firstName} {t?.lastName}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----- Fees -----
function AdminFees() {
  const { students, payments, recordPayment } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [payFor, setPayFor] = useState<Student | null>(null);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<'Cash' | 'Transfer' | 'POS' | 'Online'>('Transfer');
  const [description, setDescription] = useState('');

  const filtered = students.filter((s) => !q || `${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(q.toLowerCase()));
  const totalExpected = students.reduce((s, st) => s + st.feeTotal, 0);
  const totalCollected = students.reduce((s, st) => s + (st.feeTotal - st.feeBalance), 0);
  const totalOutstanding = students.reduce((s, st) => s + st.feeBalance, 0);
  const recentPayments = payments.filter((p) => p.amount > 0).slice().reverse().slice(0, 10);

  return (
    <div className="space-y-5">
      <SectionHeader title="Fees & Payments" description="Track fee collection and record payments" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Wallet size={18} />} label="Expected" value={naira(totalExpected)} tone="blue" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Collected" value={naira(totalCollected)} tone="emerald" />
        <StatCard icon={<AlertTriangle size={18} />} label="Outstanding" value={naira(totalOutstanding)} tone="rose" />
      </div>
      <div className="card p-4"><SearchInput value={q} onChange={setQ} placeholder="Search student..." /></div>
      <div className="card">
        <div className="table-wrap border-0">
          <table className="table">
            <thead><tr><th>Student</th><th>Class</th><th>Total Fee</th><th>Paid</th><th>Balance</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {filtered.map((s) => {
                const paid = s.feeTotal - s.feeBalance;
                return (
                  <tr key={s.id}>
                    <td className="font-medium">{s.firstName} {s.lastName}</td>
                    <td>{s.className}</td>
                    <td>{naira(s.feeTotal)}</td>
                    <td className="text-emerald-600">{naira(paid)}</td>
                    <td className={s.feeBalance > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600'}>{s.feeBalance > 0 ? naira(s.feeBalance) : 'Cleared'}</td>
                    <td className="text-right">{s.feeBalance > 0 && <button className="btn-primary text-xs px-3 py-1.5" onClick={() => { setPayFor(s); setAmount(s.feeBalance); setDescription('Fee payment'); }}><Wallet size={14} /> Record Payment</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-3">Recent Payments</h3>
        <div className="table-wrap border-0">
          <table className="table">
            <thead><tr><th>Reference</th><th>Student</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
            <tbody>
              {recentPayments.map((p) => {
                const s = students.find((st) => st.id === p.studentId);
                return <tr key={p.id}><td className="font-mono text-xs">{p.reference}</td><td>{s?.firstName} {s?.lastName}</td><td className="font-medium text-emerald-600">{naira(p.amount)}</td><td>{p.method}</td><td>{p.date}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!payFor} onClose={() => setPayFor(null)} title="Record Fee Payment" subtitle={payFor ? `${payFor.firstName} ${payFor.lastName} — Balance: ${naira(payFor.feeBalance)}` : ''} size="sm"
        footer={<><button className="btn-secondary" onClick={() => setPayFor(null)}>Cancel</button><button className="btn-primary" disabled={!amount || amount > (payFor?.feeBalance ?? 0)} onClick={() => { if (payFor) { recordPayment(payFor.id, amount, method, description || 'Fee payment'); notify(`Payment of ${naira(amount)} recorded`); setPayFor(null); setAmount(0); } }}>Record Payment</button></>}>
        <div className="space-y-3">
          <div><label className="label">Amount (₦)</label><input type="number" className="input" value={amount} onChange={(e) => setAmount(Number(e.target.value))} max={payFor?.feeBalance} /></div>
          <div><label className="label">Method</label><Select value={method} onChange={(v) => setMethod(v as 'Cash' | 'Transfer' | 'POS' | 'Online')} options={[{ value: 'Cash', label: 'Cash' }, { value: 'Transfer', label: 'Transfer' }, { value: 'POS', label: 'POS' }, { value: 'Online', label: 'Online' }]} /></div>
          <div><label className="label">Description</label><input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Fee payment" /></div>
        </div>
      </Modal>
    </div>
  );
}

// ----- Announcements -----
function AdminAnnouncements() {
  const { announcements, addAnnouncement } = useStore();
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' as 'all' | 'staff' | 'students' | 'parents' | ClassName, priority: 'normal' as 'normal' | 'high' });

  return (
    <div className="space-y-5">
      <SectionHeader title="Announcements" description={`${announcements.length} announcements`} action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New Announcement</button>} />
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${a.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}><Megaphone size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">To: {a.audience} &middot; {a.createdAt}</p>
                </div>
              </div>
              {a.priority === 'high' && <Badge className="bg-rose-100 text-rose-700">High Priority</Badge>}
            </div>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Announcement" size="md"
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={!form.title || !form.body} onClick={() => { addAnnouncement(form); notify('Announcement published'); setOpen(false); setForm({ title: '', body: '', audience: 'all', priority: 'normal' }); }}>Publish</button></>}>
        <div className="space-y-3">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Body *</label><textarea className="input min-h-[100px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Audience</label>
              <Select value={form.audience} onChange={(v) => setForm({ ...form, audience: v as 'all' | 'staff' | 'students' | 'parents' | ClassName })} options={[
                { value: 'all', label: 'Everyone' }, { value: 'staff', label: 'Staff only' }, { value: 'students', label: 'Students only' }, { value: 'parents', label: 'Parents only' }, ...CLASSES.map((c) => ({ value: c, label: c })),
              ]} />
            </div>
            <div><label className="label">Priority</label><Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v as 'normal' | 'high' })} options={[{ value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }]} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ----- Reports -----
function AdminReports() {
  const { students, results, payments, attendance } = useStore();
  const byClass = CLASSES.map((c) => {
    const cls = students.filter((s) => s.className === c);
    const published = results.filter((r) => r.className === c && r.status === 'published');
    const avg = published.length ? Math.round(published.reduce((s, r) => s + r.total, 0) / published.length) : 0;
    const expected = cls.reduce((s, st) => s + st.feeTotal, 0);
    const collected = cls.reduce((s, st) => s + (st.feeTotal - st.feeBalance), 0);
    const att = attendance.filter((a) => a.className === c);
    const present = att.filter((a) => a.status === 'present').length;
    const attRate = att.length ? Math.round((present / att.length) * 100) : 0;
    return { c, count: cls.length, avg, collected, expected, attRate };
  });

  return (
    <div className="space-y-5">
      <SectionHeader title="Reports" description="Performance, attendance and finance summaries by class" />
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Class Performance Summary</h3>
        <div className="table-wrap border-0">
          <table className="table">
            <thead><tr><th>Class</th><th>Students</th><th>Avg Score (Published)</th><th>Attendance</th><th>Fee Collection</th></tr></thead>
            <tbody>
              {byClass.map((r) => (
                <tr key={r.c}>
                  <td className="font-semibold">{r.c}</td>
                  <td>{r.count}</td>
                  <td><Badge className={gradeColor(r.avg >= 70 ? 'A' : r.avg >= 60 ? 'B' : r.avg >= 50 ? 'C' : 'D')}>{r.avg}/100</Badge></td>
                  <td>{r.attRate}%</td>
                  <td>{Math.round((r.collected / (r.expected || 1)) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5"><h3 className="font-semibold text-slate-900 mb-4">Average Score by Class</h3><BarChart data={byClass.map((r) => ({ label: r.c, value: r.avg }))} max={100} /></div>
        <div className="card p-5"><h3 className="font-semibold text-slate-900 mb-4">Fee Collection by Class (%)</h3><BarChart data={byClass.map((r) => ({ label: r.c, value: Math.round((r.collected / (r.expected || 1)) * 100) }))} max={100} suffix="%" /></div>
      </div>
    </div>
  );
}

// ----- Activity -----
function AdminActivity() {
  const { activityLogs } = useStore();
  return (
    <div className="space-y-5">
      <SectionHeader title="Activity History" description="Audit log of all administrative actions" />
      <div className="card">
        <div className="divide-y divide-slate-100">
          {activityLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0"><History size={16} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800">{log.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{log.actor} &middot; {log.timestamp} &middot; {log.category}</p>
              </div>
              <Badge className="bg-slate-100 text-slate-600">{log.category}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----- Settings -----
function AdminSettings() {
  const { settings, updateSettings } = useStore();
  const { notify } = useToast();
  const [form, setForm] = useState(settings);
  return (
    <div className="space-y-5">
      <SectionHeader title="School Settings" description="Configure school branding and contact information" />
      <div className="card p-6 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">School Name</label><input className="input" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Motto</label><input className="input" value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Logo Text</label><input className="input" value={form.logoText} onChange={(e) => setForm({ ...form, logoText: e.target.value })} maxLength={4} /></div>
        </div>
        <div className="mt-5 flex justify-end"><button className="btn-primary" onClick={() => { updateSettings(form); notify('Settings saved'); }}><CheckCircle2 size={16} /> Save Settings</button></div>
      </div>
    </div>
  );
}

export { SharedTimetable };
