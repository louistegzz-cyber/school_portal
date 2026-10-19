import { useState } from 'react';
import { ShieldCheck, ArrowRight, GraduationCap, Users, UserRound, Building2, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import type { Role } from '../types';

const ROLES: { role: Role; title: string; desc: string; icon: typeof Users; color: string }[] = [
  { role: 'admin', title: 'Administrator', desc: 'Manage students, staff, results, fees and school operations.', icon: ShieldCheck, color: 'from-blue-600 to-blue-700' },
  { role: 'teacher', title: 'Teacher', desc: 'Take attendance, enter scores and submit results.', icon: GraduationCap, color: 'from-teal-600 to-teal-700' },
  { role: 'student', title: 'Student', desc: 'View results, timetable, assignments and announcements.', icon: BookOpen, color: 'from-violet-600 to-violet-700' },
  { role: 'parent', title: 'Parent / Guardian', desc: 'Monitor results, attendance and fees for your children.', icon: Users, color: 'from-amber-600 to-amber-700' },
];

export function Login() {
  const { switchRole, settings } = useStore();
  const [selected, setSelected] = useState<Role | null>(null);

  const handleLogin = (role: Role) => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="lg:w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13,148,136,0.3) 0%, transparent 50%)' }} />
        <div className="relative h-full flex flex-col justify-between p-8 lg:p-12 min-h-[280px] lg:min-h-screen">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/40">
              {settings.logoText}
            </div>
            <div>
              <p className="font-bold text-lg">{settings.schoolName}</p>
              <p className="text-xs text-slate-300">{settings.motto}</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
              The complete school management portal for Nigerian secondary schools.
            </h1>
            <p className="text-slate-300 mt-4 text-sm leading-relaxed">
              Manage students, teachers, results, attendance, fees, timetables and more — all in one place. Built for JSS &amp; SS classes with three academic terms per session.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              {['JSS1 — SS3', 'Three Terms', 'Results & Report Cards', 'Fees & Attendance'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" /> {f}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">© 2025 {settings.schoolName}. Demo environment for presentation only.</p>
        </div>
      </div>

      {/* Login panel */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">School Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign in to your portal</h2>
          <p className="text-slate-500 mt-2 text-sm">
            This is a <span className="font-semibold text-amber-600">demo environment</span>. Choose a role to explore the portal with realistic demonstration data. No real authentication is performed.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-3">
            {ROLES.map(({ role, title, desc, icon: Icon, color }) => (
              <button
                key={role}
                onClick={() => setSelected(role)}
                onDoubleClick={() => handleLogin(role)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selected === role
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-200 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon size={20} />
                </div>
                <p className="font-semibold text-slate-900 mt-3">{title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>

          <button
            disabled={!selected}
            onClick={() => selected && handleLogin(selected)}
            className="btn-primary w-full mt-6 py-3 text-base disabled:opacity-40"
          >
            Continue as {selected ? ROLES.find((r) => r.role === selected)?.title : '...'}
            <ArrowRight size={18} />
          </button>

          <p className="text-xs text-slate-400 mt-6 text-center flex items-center justify-center gap-1.5">
            <UserRound size={12} /> Demo accounts are pre-populated. All names, results and payments are fictional.
          </p>
        </div>
      </div>
    </div>
  );
}
