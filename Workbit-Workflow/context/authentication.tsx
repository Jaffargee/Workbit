"use strict";

import { SupabaseUser } from "@/server/auth";
import { supabase } from "@/server/supabase";
import { AuthError } from "@/types/auth_types";
import { UserProfile } from "@/types/types";
import { AuthErrorService } from "@/utils/error_service";
import { NetworkService } from "@/utils/network_service";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'

interface AuthContextProps {
      children: React.ReactNode
}

interface AuthContextType {
      user: SupabaseUser | null;
      profile: UserProfile | null;
      redirectPath: string;
      loading: boolean;
      error: AuthError | null;
      isAuthenticated: boolean;
      signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: AuthContextProps) {

      const [user, setUser] = useState<SupabaseUser | null>(null);
      const [loading, setLoading] = useState<boolean>(true);
      const [redirectPath, setRedirectPath] = useState<string>('/dashboard');
      const [error, setError] = useState<AuthError | null>(null);
      const [profile, setProfile] = useState<UserProfile>(null);

      const isInitializing = useRef<boolean>(false);
      const profileFetchAttempts = useRef<number>(0);
      const MAX_PROFILE_FETCH_ATTEMPTS = 3;

      const navigate = useNavigate();

      async function getUserProfile(user: SupabaseUser) {

            if (!NetworkService.isOnline()) {
                  const networkError = AuthErrorService.createError(
                        'network',
                        'No internet connection. Please check your network.',
                        'OFFLINE'
                  );
                  setError(networkError);
                  AuthErrorService.logError(networkError, 'getUserProfile');
                  return null;
            }

            if (profileFetchAttempts.current > MAX_PROFILE_FETCH_ATTEMPTS) {
                  console.warn('[AuthProvider] Max profile fetch attempts reached');
                  return null;
            }

            profileFetchAttempts.current += 1;

            try {
                  const { data, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('user_id', user.id)
                        // .single();
                  
                  if (profileError) {
                        const authError = AuthErrorService.handleSupabaseError(profileError, 'getUserProfile');
                        setError(authError);
                        // If profile not found, redirect to profile setup
                        if (profileError.code === 'PGRST116') {
                              navigate('/auth/setup-profile');
                        }

                        return null;
                  }
      
                  setError(null);
                  profileFetchAttempts.current = 0;
                  setProfile(data[0] as UserProfile);
                  return data[0] as UserProfile;

            } catch (error) {
                  const unexpected_err = AuthErrorService.createError(
                        'generic',
                        'Unexpected Error.',
                        'Unexpected error has occured.'
                  );
                  setError(unexpected_err);
                  return null;
            }
      }

      const initializeAuth = useCallback(async () => {

            if (isInitializing.current) {
                  console.log('[AuthProvider] Already initializing, skipping...');
                  return;
            };

            isInitializing.current = true;
            setLoading(true);

            try {
                  const { data, error } = await supabase.auth.getUser();

                  if (error) {
                        const authError = AuthErrorService.handleSupabaseError(error, 'initializeAuth');
                        setError(authError);
                        setUser(null);
                        setLoading(false);
                        navigate('/auth/login');
                        return;
                  }

                  if (data.user) {
                        setUser(data.user as SupabaseUser);
                        await getUserProfile(data.user as SupabaseUser);
                        setLoading(false);
                  }

            } catch (error) {
                  const authError = AuthErrorService.handleSupabaseError(error, 'initializeAuth');
                  setError(authError);
                  setUser(null);
                  setProfile(null);
                  setLoading(false);
                  navigate('/auth/login');
            } finally {
                  setLoading(false);
                  isInitializing.current = false;
            }

      }, [getUserProfile]);

      const signOut = useCallback(async () => {
            try {
                  const { error: signOutError } = await supabase.auth.signOut();

                  if (signOutError) throw signOutError;

                  // Clear all state
                  setUser(null);
                  setProfile(null);
                  setError(null);
                  setRedirectPath('/auth/signin');
                  profileFetchAttempts.current = 0;

            } catch (err: any) {
                  const authError = AuthErrorService.handleSupabaseError(err, 'signOut');
                  setError(authError);
                  AuthErrorService.logError(authError, 'signOut');
                  throw err;
            }
      }, []);

      const handleAuthStateChange = useCallback(async (
            event: AuthChangeEvent,
            session: Session | null
      ) => {
            console.log('[AuthProvider] Auth state changed:', event);
            switch (event) {
                  // case 'SIGNED_IN':
                  // case 'TOKEN_REFRESHED':
                  //       if (session?.user) {
                  //             // setUser(session.user as SupabaseUser);
                  //             // await getUserProfile(session.user as SupabaseUser);                          
                  //       }
                  //       break;

                  case 'SIGNED_OUT':
                        setUser(null);
                        setProfile(null);
                        navigate('/auth/signin');
                        setError(null);
                        profileFetchAttempts.current = 0;
                        break;

                  case 'USER_UPDATED':
                        if (session?.user) {
                              setUser(session.user as SupabaseUser);
                              await getUserProfile(session.user as SupabaseUser);
                        }
                        break;
                  case 'PASSWORD_RECOVERY':
                        navigate('/auth/reset-password');
                        break;
                  default:
                        console.log('[AuthProvider] Unhandled auth event:', event);
            }

      }, [getUserProfile]);

      useEffect(() => {
            
            initializeAuth();

            // Subscribe to auth state changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
            
            // Cleanup subscription on unmount
            return () => {
                  subscription.unsubscribe();
            };
            
      }, []);
      
      const contextValue: AuthContextType = {
            user,
            profile,
            redirectPath,
            loading,
            error,
            isAuthenticated: !!user,
            signOut,
      };

      return (
            <AuthContext.Provider value={contextValue}>
                  {children}
            </AuthContext.Provider>
      )
}

export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
            throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
};
