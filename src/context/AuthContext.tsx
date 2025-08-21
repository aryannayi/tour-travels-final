import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Demo credentials fallback (works without Supabase)
  const DEMO_ADMIN = { email: 'admin@wanderlust.com', password: 'admin123', fullName: 'Admin' } as const;
  const DEMO_USER = { email: 'user@example.com', password: 'user123', fullName: 'Demo User' } as const;
  const DEMO_STORAGE_KEY = 'wanderlust_demo_auth';

  useEffect(() => {
    // Restore demo auth session if present
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed.user as User);
        setSession(null);
        setUserProfile(parsed.userProfile);
        setLoading(false);
        return;
      }
    } catch {}

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              full_name: fullName,
              role: 'user',
            },
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Demo admin login (no Supabase required)
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        const demoUser = { id: 'demo-admin', email: DEMO_ADMIN.email } as unknown as User;
        const demoProfile = {
          id: 'demo-admin',
          email: DEMO_ADMIN.email,
          full_name: DEMO_ADMIN.fullName,
          role: 'admin',
        };
        setUser(demoUser);
        setSession(null);
        setUserProfile(demoProfile);
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: demoUser, userProfile: demoProfile }));
        toast.success('Signed in successfully!');
        return;
      }

      // Demo regular user login (no Supabase required)
      if (email === DEMO_USER.email && password === DEMO_USER.password) {
        const demoUser = { id: 'demo-user', email: DEMO_USER.email } as unknown as User;
        const demoProfile = {
          id: 'demo-user',
          email: DEMO_USER.email,
          full_name: DEMO_USER.fullName,
          role: 'user',
        };
        setUser(demoUser);
        setSession(null);
        setUserProfile(demoProfile);
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ user: demoUser, userProfile: demoProfile }));
        toast.success('Signed in successfully!');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear demo auth if present
      localStorage.removeItem(DEMO_STORAGE_KEY);

      // If this was a demo user, just clear state locally
      if (user?.id?.startsWith('demo-')) {
        setUser(null);
        setSession(null);
        setUserProfile(null);
        toast.success('Signed out successfully!');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin' || user?.email === DEMO_ADMIN.email;
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};