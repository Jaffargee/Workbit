import { Email } from "./types";

export type Field = 'email' | 'password' | 'general' | 'state' | 'phone';

export interface EmailAuthProps {
      email: Email;
      password: string;
}

export interface ValidationError {
      field: Field;
      message: string;
}

export interface AuthError {
      type: 'auth' | 'network' | 'profile' | 'generic';
      code: string;
      message: string;
}

export interface User {
      id: string,
      aud: 'authenticated' | 'unauthenticated'
}

export interface LocalAuth {
      date: Date,
      time: string,
      id: string,
      user: User
}