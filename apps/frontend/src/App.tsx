import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import SellerView from './pages/SellerView';
import ManagerView from './pages/ManagerView';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'guest' | 'seller' | 'manager'>('guest');
  const [loading, setLoading] = useState(true);
  const [isBypassed, setIsBypassed] = useState(false);

  const resolveRole = async (user: User): Promise<'seller' | 'manager'> => {
    const metaRole = user?.user_metadata?.role;
    if (metaRole === 'seller' || metaRole === 'manager') return metaRole;

    const profileReq = supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const role = data?.role;
        return role === 'seller' || role === 'manager' ? role : null;
      });
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

    try {
      const role = await Promise.race<null | 'seller' | 'manager'>([profileReq, timeout]);
      if (role === 'seller' || role === 'manager') return role;
    } catch {
      // ignore and fallback below
    }

    // MVP fallback: least privilege in UI when role cannot be resolved.
    return 'seller';
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const role = await resolveRole(session.user);
        setUserRole(role);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const role = await resolveRole(session.user);
        setUserRole(role);
      } else {
        setUserRole('guest');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (isBypassed) {
      setIsBypassed(false);
      setUserRole('guest');
      return;
    }
    await supabase.auth.signOut();
    setUserRole('guest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent flex-shrink-0 animate-spin rounded-full"></div>
      </div>
    );
  }

  if (!session && !isBypassed) {
    return <Login onLogin={(role) => {
      setUserRole(role);
      setIsBypassed(true);
    }} />;
  }

  if (userRole === 'seller') {
    return <SellerView onLogout={handleLogout} />;
  }

  if (userRole === 'manager') {
    return <ManagerView onLogout={handleLogout} />;
  }

  return null;
}
