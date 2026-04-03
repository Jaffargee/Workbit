import { supabase } from "@/server/supabase";
import { AppError, AuthContextProps, AuthContextType } from "@/types/auth_types";
import { SupabaseUser } from "@/types/supabase_types";
import { UserProfile } from "@/types/types";
import { ErrorService } from "@/utils/error_service";
import { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const AuthProvider = ({ children }: AuthContextProps) => {

      const [user, setUser] = useState<SupabaseUser | null>(null);
      const [profile, setProfile] = useState<UserProfile | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<AppError | null>(null);
      const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

      const navigate = useNavigate();

      const signOut = useCallback(async () => {
            try {
                  const { error: signOutError } = await supabase.auth.signOut();

                  if (signOutError) throw signOutError;

                  // Clear all state
                  setUser(null);
                  setProfile(null);
                  setError(null);
                  navigate('/auth/signin');

            } catch (err: any) {
                  const authError = ErrorService.handleSupabaseError(err, 'signOut');
                  setError(authError);
                  throw err;
            }
      }, []);

      const contextValue: AuthContextType = {
            user,
            profile,
            loading,
            error,
            isAuthenticated,
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