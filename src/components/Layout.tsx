import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, UserCog, BookOpen, CalendarDays, ClipboardList,
  FileText, Megaphone, Wallet, Settings, LogOut, Menu, X, Bell, ChevronDown, Building2,
  ClipboardCheck, ArrowUpCircle, History, MessageSquare, BookMarked, CalendarCheck, IdCard,
  Library, Percent, FolderOpen, UserRound, ShieldCheck,
} from 'lucide-react';
import { useStore } from '../store';
import type { Role } from '../types';
import { Avatar } from './ui';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: Record<Role, NavGroup[]> = {
  admin: [
    {
      group: 'Overview',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }],
    },
    {
      group: 'Management',
      items: [
        { id: 'students', label: 'Students', icon: <Users size={18} /> },
        { id: 'teachers', label: 'Teachers', icon: <GraduationCap size={18} /> },
        { id: 'parents', label: 'Parents', icon: <UserCog size={18} /> },
        { id: 'classes', label: 'Classes & Subjects', icon: <BookOpen size={18} /> },
        { id: 'sessions', label: 'Sessions & Terms', icon: <CalendarDays size={18} /> },
      ],
    },
    {
      group: 'Academics',
      items: [
        { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={18} /> },
        { id: 'results', label: 'Results & Approval', icon: <ClipboardList size={18} /> },
        { id: 'promotion', label: 'Promotion', icon: <ArrowUpCircle size={18} /> },
        { id: 'timetable', label: 'Timetable', icon: <CalendarCheck size={18} /> },
        { id: 'assignments', label: 'Assignments', icon: <FolderOpen size={18} /> },
      ],
    },
    {
      group: 'School',
      items: [
        { id: 'fees', label: 'Fees & Payments', icon: <Wallet size={18} /> },
        { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
        { id: 'activity', label: 'Activity History', icon: <History size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
      ],
    },
  ],
  teacher: [
    {
      group: 'Overview',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }],
    },
    {
      group: 'Teaching',
      items: [
        { id: 'classes', label: 'My Classes', icon: <BookOpen size={18} /> },
        { id: 'students', label: 'Student List', icon: <Users size={18} /> },
        { id: 'attendance', label: 'Record Attendance', icon: <ClipboardCheck size={18} /> },
        { id: 'scores', label: 'Enter Scores', icon: <Percent size={18} /> },
        { id: 'results', label: 'Submit Results', icon: <ClipboardList size={18} /> },
      ],
    },
    {
      group: 'Other',
      items: [
        { id: 'assignments', label: 'Assignments', icon: <FolderOpen size={18} /> },
        { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
        { id: 'timetable', label: 'My Timetable', icon: <CalendarCheck size={18} /> },
      ],
    },
  ],
  student: [
    {
      group: 'Overview',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }],
    },
    {
      group: 'Academics',
      items: [
        { id: 'profile', label: 'My Profile & ID', icon: <IdCard size={18} /> },
        { id: 'results', label: 'Results & Report Card', icon: <ClipboardList size={18} /> },
        { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={18} /> },
        { id: 'timetable', label: 'Timetable', icon: <CalendarCheck size={18} /> },
        { id: 'assignments', label: 'Assignments', icon: <FolderOpen size={18} /> },
        { id: 'subjects', label: 'My Subjects', icon: <BookMarked size={18} /> },
      ],
    },
    {
      group: 'Other',
      items: [
        { id: 'fees', label: 'Fees & Payments', icon: <Wallet size={18} /> },
        { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
      ],
    },
  ],
  parent: [
    {
      group: 'Overview',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }],
    },
    {
      group: 'Children',
      items: [
        { id: 'results', label: 'Results', icon: <ClipboardList size={18} /> },
        { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={18} /> },
        { id: 'timetable', label: 'Timetable', icon: <CalendarCheck size={18} /> },
        { id: 'assignments', label: 'Assignments', icon: <FolderOpen size={18} /> },
        { id: 'fees', label: 'Fees & Payments', icon: <Wallet size={18} /> },
        { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
      ],
    },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent / Guardian',
};

interface LayoutProps {
  role: Role;
  active: string;
  onNavigate: (id: string) => void;
  onSwitchRole: (role: Role) => void;
  children: ReactNode;
}

export function Layout({ role, active, onNavigate, onSwitchRole, children }: LayoutProps) {
  const { settings, currentUser, logout, announcements, currentSession, currentTerm } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenu, setRoleMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const nav = NAV[role];
  const activeItem = nav.flatMap((g) => g.items).find((i) => i.id === active);
  const recentAnnouncements = announcements.slice(0, 4);

  const Sidebar = (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30">
            {settings.logoText}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{settings.schoolName}</p>
            <p className="text-[11px] text-slate-400 truncate">{settings.motto}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{group.group}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`nav-item w-full text-left ${active === item.id ? 'nav-item-active' : ''}`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300 space-y-1">
          <div className="flex justify-between"><span>Session</span><span className="font-semibold text-white">{currentSession}</span></div>
          <div className="flex justify-between"><span>Term</span><span className="font-semibold text-white">{currentTerm}</span></div>
        </div>
        <button onClick={() => onSwitchRole(role)} className="nav-item w-full text-left mt-2 text-amber-300 hover:bg-white/10">
          <LogOut size={18} />
          <span>Switch Demo Role</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 z-30">{Sidebar}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full animate-fade-in">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base">{activeItem?.label ?? 'Dashboard'}</h2>
                <p className="text-xs text-slate-500 hidden sm:block">{ROLE_LABELS[role]} Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                <ShieldCheck size={14} />
                <span>Demo Mode</span>
              </div>

              <div className="relative">
                <button onClick={() => setNotifOpen((o) => !o)} className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                  <Bell size={20} />
                  {recentAnnouncements.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 animate-fade-in">
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                        <p className="font-semibold text-sm">Notifications</p>
                        <button onClick={() => setNotifOpen(false)}><X size={16} className="text-slate-400" /></button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {recentAnnouncements.map((a) => (
                          <div key={a.id} className="p-3 border-b border-slate-50 hover:bg-slate-50">
                            <div className="flex items-start gap-2">
                              {a.priority === 'high' ? <Megaphone size={14} className="text-rose-500 mt-0.5" /> : <MessageSquare size={14} className="text-blue-500 mt-0.5" />}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-2">{a.body}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{a.createdAt}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setRoleMenu((o) => !o)} className="flex items-center gap-2 p-1.5 pr-2 rounded-lg hover:bg-slate-100">
                  {currentUser && <Avatar name={currentUser.name} color={currentUser.avatarColor} size={30} />}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser?.name}</p>
                    <p className="text-[10px] text-slate-500">{ROLE_LABELS[role]}</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {roleMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setRoleMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-20 animate-fade-in p-1.5">
                      <p className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wide">Switch demo role</p>
                      {(['admin', 'teacher', 'student', 'parent'] as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => { onSwitchRole(r); setRoleMenu(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 ${r === role ? 'text-blue-600 font-semibold' : 'text-slate-700'}`}
                        >
                          <UserRound size={15} />
                          {ROLE_LABELS[r]}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 my-1.5" />
                      <button onClick={() => logout()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50">
                        <LogOut size={15} /> Exit to login
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>

        <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          {settings.schoolName} &middot; {settings.address} &middot; Demo build for classroom presentation
        </footer>
      </div>
    </div>
  );
}

export { Building2, Library };
