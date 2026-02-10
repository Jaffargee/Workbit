import { Email, Gender, NigerianState } from "./types";

export type Field = 'email' | 'password' | 'general' | 'state' | 'phone' | 'first_name' | 'last_name' | 'username' | 'gender' | 'user_type';

export interface ValidationError {
      field: Field;
      message: string;
}

export interface AuthError {
      type: 'auth' | 'network' | 'profile' | 'generic';
      code: string;
      message: string;
}

export interface AuthCredentials {
      email: Email;
      password: string;
}

interface BaseSignupData {
      email: Email,
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

export interface GoogleOAuthSignup extends BaseSignupData {}


