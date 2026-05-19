import { AppError, AppErrorType } from "@/types/auth_types";

const isDevelopment = import.meta.env.DEV;

const ERROR_PATTERNS = [
      {
            match: (error: any) => error.message?.includes('JWT'),
            type: 'auth' as const,
            message: 'Your session has expired. Please sign in again.',
      },
      {
            match: (error: any) => error.code === 'PGRST116',
            type: 'profile' as const,
            message: 'User profile not found. Please complete your profile setup.',
      },
      {
            match: (error: any) => error.message?.includes('User already registered'),
            type: 'auth' as const,
            message: 'This email is already registered. Please sign in instead.',
      },
      {
            match: (error: any) => error.message?.includes('Invalid email'),
            type: 'auth' as const,
            message: 'Please enter a valid email address.',
      },
      {
            match: (error: any) => error.message?.includes('Password should be at least'),
            type: 'auth' as const,
            message: 'Password must be at least 6 characters long.',
      },
      {
            match: (error: any) => error.message?.includes('rate limit'),
            type: 'auth' as const,
            message: 'Too many attempts. Please try again in a few minutes.',
      },
      {
            match: (error: any) => error.message?.includes('Invalid login credentials'),
            type: 'auth' as const,
            message: 'Invalid Login Credentials.',
      },
      {
            match: (error: any) => error.code === 'PGRST301' || error.message?.includes('FetchError'),
            type: 'network' as const,
            message: 'Network error. Please check your connection and try again.',
      },
      {
            match: (error: any) => error.code === 'PGRST205' || error.message?.includes('Could not find the table'),
            type: 'network' as const,
            message: 'An error occurred while processing your request. Please try again later.',
      },
] as const;

class BaseErrorService {

      static createErrorObject(error: AppError) {

            const errObj: AppError = {
                  type: error.type,
                  message: error.message,
                  error: {
                        name: error?.error?.name,
                        message: error?.error?.message,
                        code: error?.error?.code,
                        status: error?.error?.status,
                  },
                  context: error.context,
            };

            return errObj
      }

      static createAndLog(error: AppError, context: string): AppError {
            const errObj = this.createErrorObject(error);
            this.logError(errObj, context);
            return errObj
      }

      static logError(error: AppError, context: string) {

            if (isDevelopment) {
                  console.error(`[AuthProvider:${context}]`, error);
            }

            // In production, send to monitoring service
            // Sentry.captureException(new Error(error.message), {
            //   tags: { type: error.type, code: error.code, context }
            // });
      }

}

export class ErrorService extends BaseErrorService {

      static handleSupabaseError(error: any, context: string): AppError {

            let type: AppErrorType = 'generic';
            let message: string = 'An unexpected error occurred. Please try again.';

            const matchedPattern = ERROR_PATTERNS.find(pattern => pattern.match(error));

            if (matchedPattern) {
                  type = matchedPattern.type;
                  message = matchedPattern.message;
            }

            const errObj: AppError = {
                  type,
                  message,
                  error: {
                        name: error?.name,
                        message: error?.message,
                        code: error?.code,
                        status: error?.status,
                  },
                  context,
            };

            return this.createAndLog(errObj, context);

      }

}

