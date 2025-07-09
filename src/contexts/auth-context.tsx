"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user in Supabase when Firebase user changes
  const syncUserWithSupabase = async (firebaseUser: User) => {
    if (!firebaseUser) return;

    try {
      // First, try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is expected for new users
        throw fetchError;
      }

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update({
            email: firebaseUser.email || '',
            full_name: firebaseUser.displayName || '',
            updated_at: new Date().toISOString(),
          })
          .eq('firebase_uid', firebaseUser.uid)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log('User updated in Supabase:', data);
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            full_name: firebaseUser.displayName || '',
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log('User created in Supabase:', data);
      }
    } catch (error: any) {
      console.error('Error syncing user with Supabase:', error);
      // Don't throw the error to prevent auth flow from breaking
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncUserWithSupabase(result.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      await syncUserWithSupabase(result.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncUserWithSupabase(result.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        ...(photoURL && { photoURL }),
      });
      
      // Update in Supabase as well
      await supabase
        .from('users')
        .update({
          full_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('firebase_uid', auth.currentUser.uid);
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
        await syncUserWithSupabase(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}