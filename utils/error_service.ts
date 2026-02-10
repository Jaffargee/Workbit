import { AuthError } from "@/types/auth_types";

export class ErrorService {
      // Map Supabase error codes to user-friendly messages
      static mapSupabaseError(error: any): string {

            const errorCode = error?.code || error?.status;
            const errorMessage = error?.message || '';

            // Authentication specific errors
            if (errorMessage.includes('User already registered')) {
                  return 'This email is already registered. Please sign in instead.';
            }

            if (errorMessage.includes('Invalid email')) {
                  return 'Please enter a valid email address.';
            }

            if (errorMessage.includes('Password should be at least')) {
                  return 'Password must be at least 6 characters long.';
            }

            if (errorMessage.includes('rate limit')) {
                  return 'Too many attempts. Please try again in a few minutes.';
            }
            if (errorMessage.includes('invalid login credentials')) {
                  return 'Invalid Login Credentials.';
            }

            // Network errors
            if (errorCode === 'PGRST301' || errorMessage.includes('FetchError')) {
                  return 'Network error. Please check your connection and try again.';
            }

            // Generic fallback
            if (errorMessage) {
                  return errorMessage;
            }

            return 'An unexpected error occurred. Please try again.';
      }

      // Log error for monitoring (would integrate with services like Sentry)
      static logError(error: any, context: string) {
            console.error(`[${context}]`, {
                  message: error.message,
                  code: error.code,
                  stack: error.stack,
                  timestamp: new Date().toISOString(),
            });

            // In production, send to error tracking service
            // Sentry.captureException(error, { tags: { context } });
      }
}

export class AuthErrorService {

      static createError(type: AuthError['type'], code: string, message: string): AuthError {
            return { type, code, message };
      }

      static handleSupabaseError(error: any, context: string): AuthError {

            console.error(`[AuthError:${context}]`, {
                  message: error.message,
                  code: error.code,
                  status: error.status,
                  timestamp: new Date().toISOString(),
            });

            const errorCode = error?.code || error?.status;
            const errorMessage = error?.message || '';

            if (errorMessage.includes('JWT')) {
                  return this.createError('auth', 'SESSION_EXPIRED', 'Your session has expired. Please sign in again.');
            }

            if (error.code === 'PGRST116') {
                  return this.createError('profile', 'PROFILE_NOT_FOUND', 'User profile not found. Please complete your profile setup.');
            }

            if (error.message?.includes('fetch')) {
                  return this.createError('network', 'NETWORK_ERROR', 'Network error. Please check your connection.', );
            }

            return this.createError('generic', error.code || error.status, 'An unexpected error occurred. Please try again.');

      }

      static logError(error: AuthError, context: string) {
            console.error(`[AuthProvider:${context}]`, error);

            // In production, send to monitoring service
            // Sentry.captureException(new Error(error.message), {
            //   tags: { type: error.type, code: error.code, context }
            // });
      }

}

interface SupabaseError {
      code: string,
      details: string | null,
      message: string,
      hint: string,
}

export class SupabaseErrorService {

      static createError(message: string): { message: string } {
            return { message }
      }

      static handleSupabaseError(error: SupabaseError, context?: string): { message: string } {
            const message = error.message;
            const code = error.code;

            if (code === 'PGRST205' || message.includes('Could not find the table')) {
                  return { message: 'An error occurred while processing your request. Please try again later.' }
            }

            

      }

}
