import { SupabaseUser } from "@/types/supabase_types";
import { Email, Gender, NigerianState, UserProfile } from "./types";
import { AuthError as AError } from "@supabase/supabase-js";

export type Field = 'email' | 'password' | 'generic' | 'state' | 'phone' | 'first_name' | 'last_name' | 'username' | 'gender' | 'user_type';

export interface ValidationError {
      field: Field;
      message: string;
}

export type AppErrorType = 'auth' | 'network' | 'profile' | 'generic' | 'unknown';

interface ErrorObject {
      name: string;
      message: string;
      code: string;
      status: number;
}

export interface AppError {
      type: AppErrorType;
      message: string;
      error: ErrorObject;
      context: string;
}

export interface SupabaseError {
      code: string,
      details: string | null,
      message: string,
      hint: string,
}

export interface AuthCredentials {
      email: Email;
      password: string;
}

interface BaseSignupData {
      email?: Email,
      p_phone: string,
      p_gender: Gender,
      p_state: NigerianState,
      ref_code?: string,
      p_user_type: 'EMPLOYER' | 'WORKER' | 'BOTH',
}

export interface EmailAuthSignup extends BaseSignupData {
      p_first_name: string,
      p_last_name: string,
      p_username: string,
}

export interface GoogleOAuthSignup extends BaseSignupData { }

export interface AuthContextProps {
      children: React.ReactNode
}

export interface AuthContextType {
      user: SupabaseUser | null;
      profile: UserProfile | null;
      loading: boolean;
      error: AppError | null;
      isAuthenticated: boolean;
      signOut: () => Promise<void>;
}