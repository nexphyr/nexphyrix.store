import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  avatar_url?: string;
  has_used_new_user_promo?: boolean;
}

interface OnlineUser {
  id: string;
  role: string;
  email: string | null;
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (session: Session) => void;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  onlineUsers: Record<string, OnlineUser[]>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser[]>>({});
  const [sessionId] = useState(() => 'visitor-' + Math.random().toString(36).substr(2, 9));

  const fetchProfile = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user role if profile not yet created by trigger
        setUser({ 
          id: session.user.id,
          email: session.user.email || '', 
          role: 'user',
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url,
          has_used_new_user_promo: false
        });
      } else if (data) {
        setUser({ 
          id: session.user.id,
          email: data.email || session.user.email || '', 
          role: data.role || 'user',
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          has_used_new_user_promo: data.has_used_new_user_promo
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      fetchProfile(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Presence
  useEffect(() => {
    // Only subscribe once
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user ? user.id : sessionId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<OnlineUser>();
        setOnlineUsers(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user ? user.id : sessionId,
            role: user ? user.role : 'guest',
            email: user ? user.email : null,
            full_name: user ? user.full_name : null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sessionId]);

  const login = (session: Session) => {
    fetchProfile(session);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      }
    });
    if (error) {
      console.error('Google Login Error:', error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signInWithGoogle, onlineUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
