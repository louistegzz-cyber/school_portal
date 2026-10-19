import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import { ToastProvider } from './components/toast';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { AdminPages } from './components/admin';
import { TeacherPages } from './components/teacher';
import { StudentPages } from './components/student';
import { ParentPages } from './components/parent';
import type { Role } from './types';

function Portal() {
  const { currentUser, switchRole, logout } = useStore();
  const [activePage, setActivePage] = useState('dashboard');
  const role: Role | null = currentUser?.role ?? null;

  // Reset to dashboard whenever the role changes
  useEffect(() => {
    setActivePage('dashboard');
  }, [role]);

  if (!role || !currentUser) {
    return <Login />;
  }

  return (
    <Layout role={role} active={activePage} onNavigate={setActivePage} onSwitchRole={(r) => { if (r !== role) switchRole(r); }}>
      {role === 'admin' && <AdminPages page={activePage} />}
      {role === 'teacher' && <TeacherPages page={activePage} />}
      {role === 'student' && <StudentPages page={activePage} />}
      {role === 'parent' && <ParentPages page={activePage} />}
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Portal />
      </ToastProvider>
    </StoreProvider>
  );
}
