import { supabase } from "@/server/supabase";
import { AppError, AuthContextProps, AuthContextType } from "@/types/auth_types";
import { SupabaseUser } from "@/types/supabase_types";
import { UserProfile } from "@/types/types";
import { ErrorService } from "@/utils/error_service";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthContextProps) => {

      const [user, setUser] = useState<SupabaseUser | null>(null);
      const [profile, setProfile] = useState<UserProfile | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<AppError | null>(null);
      const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

      const navigate = useNavigate();

      const getUserProfile = useCallback(async (userId: string) => {
            try {
                  const { data, error } = await supabase
                        .from('user_profiles')
                        .select(`
                              *, 
                              user_contacts(email, phone), 
                              user_bank_accounts(account_name, bank_name, account_number, is_default, is_verified),
                              wallet(*, wallet_deposits!wallet_deposits_wallet_id_fkey(*), wallet_transactions!wallet_transactions_wallet_id_fkey(*)),
                              referral_rewards!referral_rewards_referrer_id_fkey(reward_amount, status),
                              jobs(*)
                        `)
                        .eq('user_id', userId)
                        .single();
                  if (error) {
                        const profileError = ErrorService.handleSupabaseError(error, 'getUserProfile');
                        setError(profileError);
                  }
                  return data;
            } catch (err: any) {
                  const profileError = ErrorService.handleSupabaseError(err, 'getUserProfile');
                  setError(profileError);
            }
      }, []);

      const getUserSession = useCallback(async () => {
            try {
                  const { data: { session }, error } = await supabase.auth.getSession();

                  if (error) {
                        const sessionError = ErrorService.handleSupabaseError(error, 'getUserSession');
                        setError(sessionError);
                        setIsAuthenticated(false);
                  }

                  if (session) {
                        setUser(session.user as SupabaseUser);
                        const profileData = await getUserProfile(session.user.id);
                        if (profileData && !('error' in profileData) && typeof profileData !== 'string') {
                              setProfile(profileData);
                        }
                        setIsAuthenticated(true);
                  } else {
                        setUser(null);
                        setProfile(null);
                        setIsAuthenticated(false);
                  }

            } catch (err: any) {
                  const sessionError = ErrorService.handleSupabaseError(err, 'getUserSession');
                  setError(sessionError);
                  setIsAuthenticated(false);
            } finally {
                  setLoading(false);
            }
      }, [])

      const signOut = useCallback(async () => {
            try {
                  const { error: signOutError } = await supabase.auth.signOut();

                  if (signOutError) {
                        const authError = ErrorService.handleSupabaseError(signOutError, 'signOut');
                        setError(authError);
                  }

                  // Clear all state
                  setUser(null);
                  setProfile(null);
                  setError(null);
                  navigate('/auth/login');

            } catch (err: any) {
                  const authError = ErrorService.handleSupabaseError(err, 'signOut');
                  setError(authError);
            }
      }, []);

      useEffect(() => {
            getUserSession();

            const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
                  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        setUser(session?.user as SupabaseUser);
                        if (session?.user) {
                              getUserProfile(session.user.id).then((data: any) => {
                                    if (error) {
                                          console.error("Profile fetch failed:", error.message);
                                          setProfile(null);
                                          return;
                                    }
                                    
                                    // If data is null/empty, setProfile to null to avoid type mismatch
                                    setProfile(data as UserProfile || null);
                              });
                        }
                        setIsAuthenticated(true);
                  } else if (event === 'SIGNED_OUT') {
                        setUser(null);
                        setProfile(null);
                        setIsAuthenticated(false);
                  }
            });

            return () => {
                  authListener.subscription.unsubscribe();
            };
      }, [])

      const refreshUserProfile = useCallback(async () => {
            await getUserSession();
      }, [])

      const contextValue: AuthContextType = {
            user,
            profile,
            loading,
            error,
            isAuthenticated,
            refreshUserProfile,
            signOut
      }

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
}

export default AuthProvider;