import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export type UserRole = 'patient' | 'caregiver';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  language: string;
  avatar_url?: string;
  invite_code?: string;
}

export interface PatientRegistrationData {
  fullName: string;
  email: string;
  password?: string;
  age?: number;
  gender?: string;
  location?: string;
  language?: string;
}

export interface CaregiverRegistrationData {
  fullName: string;
  email: string;
  password?: string;
  relationship?: string;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUpPatient: (data: PatientRegistrationData) => Promise<{ success: boolean; error?: string }>;
  signUpCaregiver: (data: CaregiverRegistrationData) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  setRole: (role: UserRole) => void;
  quickDemoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateInviteCode(name?: string): string {
  const prefix = (name?.slice(0, 3) || 'AXM').toUpperCase().replace(/[^A-Z]/g, 'A');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AXM-${prefix}-${randomSuffix}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<UserRole>('patient');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile from backend or Supabase
  const loadUserProfile = async (userId: string, userEmail?: string, fallbackRole?: UserRole) => {
    if (!supabase) return;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      let patientInviteCode: string | undefined;

      if (profileData) {
        const userRole = (profileData.role as UserRole) || fallbackRole || 'patient';
        setRoleState(userRole);

        if (userRole === 'patient') {
          const { data: patData } = await supabase
            .from('patient_profiles')
            .select('invite_code')
            .eq('user_id', userId)
            .single();
          patientInviteCode = patData?.invite_code;
        }

        setProfile({
          ...profileData,
          invite_code: patientInviteCode,
        } as UserProfile);
      } else {
        // Create initial profile
        const inviteCode = generateInviteCode(userEmail);
        const newProfile: Partial<UserProfile> = {
          user_id: userId,
          full_name: userEmail?.split('@')[0] || (fallbackRole === 'caregiver' ? 'Priya Sharma' : 'Asha Devi'),
          role: fallbackRole || 'patient',
          language: 'en',
        };
        await supabase.from('profiles').upsert(newProfile);

        if ((fallbackRole || 'patient') === 'patient') {
          await supabase.from('patient_profiles').upsert({
            user_id: userId,
            name: newProfile.full_name,
            invite_code: inviteCode,
            age: 68,
            preferred_language: 'en',
          });
        }

        setProfile({ ...newProfile, invite_code: inviteCode } as UserProfile);
        setRoleState(newProfile.role as UserRole);
      }
    } catch (err) {
      console.warn('[AuthContext] Error loading user profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user.email, role);
    }
  };

  // Restore Supabase Auth session on app mount
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setToken(session?.access_token ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string = 'AxiomSecure2026!'): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If user does not exist, auto-signup for seamless demo experience
        if (error.message.toLowerCase().includes('invalid login credentials') || error.message.includes('User not found')) {
          return await signUp(email, password);
        }
        return { success: false, error: error.message };
      }

      setSession(data.session);
      setUser(data.user);
      setToken(data.session?.access_token || null);
      if (data.user) {
        await loadUserProfile(data.user.id, data.user.email);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpPatient = async (data: PatientRegistrationData): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
      setIsLoading(true);
      const password = data.password || 'AxiomSecure2026!';
      const inviteCode = generateInviteCode(data.fullName);

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'patient',
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').upsert({
          user_id: authData.user.id,
          full_name: data.fullName,
          role: 'patient',
          language: data.language || 'en',
        });

        // Create patient profile with real invite code
        await supabase.from('patient_profiles').upsert({
          user_id: authData.user.id,
          name: data.fullName,
          age: data.age || 68,
          gender: data.gender || 'Female',
          location: data.location || 'Guwahati, Assam',
          preferred_language: data.language || 'en',
          invite_code: inviteCode,
        });

        setSession(authData.session);
        setUser(authData.user);
        setToken(authData.session?.access_token || null);
        setRoleState('patient');
        setProfile({
          id: authData.user.id,
          user_id: authData.user.id,
          full_name: data.fullName,
          role: 'patient',
          language: data.language || 'en',
          invite_code: inviteCode,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpCaregiver = async (data: CaregiverRegistrationData): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
      setIsLoading(true);
      const password = data.password || 'AxiomSecure2026!';

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'caregiver',
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (authData.user) {
        await supabase.from('profiles').upsert({
          user_id: authData.user.id,
          full_name: data.fullName,
          role: 'caregiver',
          language: data.language || 'en',
        });

        setSession(authData.session);
        setUser(authData.user);
        setToken(authData.session?.access_token || null);
        setRoleState('caregiver');
        setProfile({
          id: authData.user.id,
          user_id: authData.user.id,
          full_name: data.fullName,
          role: 'caregiver',
          language: data.language || 'en',
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string = 'AxiomSecure2026!',
    fullName?: string,
    userRole: UserRole = 'patient'
  ): Promise<{ success: boolean; error?: string }> => {
    if (userRole === 'caregiver') {
      return signUpCaregiver({ email, password, fullName: fullName || 'Caregiver User' });
    }
    return signUpPatient({ email, password, fullName: fullName || 'Patient User' });
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('axiom_session_cache');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!supabase) return { success: false, error: 'Supabase client is not configured.' };
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: `Password reset instructions sent to ${email}.` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    }
  };

  const quickDemoLogin = async (demoRole: UserRole) => {
    const email = demoRole === 'caregiver' ? 'caregiver.priya@axiomcare.in' : 'patient.asha@axiomcare.in';
    const name = demoRole === 'caregiver' ? 'Priya Sharma (Caregiver)' : 'Asha Devi (Patient)';
    await signUp(email, 'AxiomCare2026!', name, demoRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signUpPatient,
        signUpCaregiver,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        setRole,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
