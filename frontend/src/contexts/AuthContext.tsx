import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (session: Session) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check "Remember Me" logic
    const isNoPersist = localStorage.getItem('no_persist') === 'true';
    const isNewSession = !sessionStorage.getItem('session_active');
    
    if (isNoPersist && isNewSession) {
      // User didn't check remember me and this is a new browser session. Sign out.
      supabase.auth.signOut().then(() => {
        sessionStorage.setItem('session_active', 'true');
        setUser(null);
        setLoading(false);
      });
      return;
    }

    sessionStorage.setItem('session_active', 'true');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email || '', role: 'admin' });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email || '', role: 'admin' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (session: Session) => {
    if (session.user) {
      setUser({ email: session.user.email || '', role: 'admin' });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
