import { ValidationError } from "@/types/auth_types";
import { AuthCredentials } from "@/types/auth_types";
import { Email } from "@/types/types";

export default class ValidationService {

      // Email validation with comprehensive regex
      static validateEmail(email: string): ValidationError | null {
            if (!email || email.trim().length === 0) {
                  return { field: 'email', message: 'Email is required' };
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(email)) {
                  return { field: 'email', message: 'Please enter a valid email address' };
            }

            // Check for common typos in popular domains
            const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
            const domain = email.split('@')[1]?.toLowerCase();
            const suspiciousDomains = ['gmial.com', 'gmai.com', 'yahhoo.com'];

            if (suspiciousDomains.includes(domain)) {
                  return { field: 'email', message: 'Please check your email domain for typos' };
            }

            return null;
      }

      // Password validation with security requirements
      static validatePassword(password: string): ValidationError | null {
            if (!password || password.length === 0) {
                  return { field: 'password', message: 'Password is required' };
            }

            if (password.length < 8) {
                  return { field: 'password', message: 'Password must be at least 8 characters long' };
            }

            if (password.length > 128) {
                  return { field: 'password', message: 'Password must be less than 128 characters' };
            }

            // Check for at least one uppercase letter
            if (!/[A-Z]/.test(password)) {
                  return { field: 'password', message: 'Password must contain at least one uppercase letter' };
            }

            // Check for at least one lowercase letter
            if (!/[a-z]/.test(password)) {
                  return { field: 'password', message: 'Password must contain at least one lowercase letter' };
            }

            // Check for at least one number
            if (!/\d/.test(password)) {
                  return { field: 'password', message: 'Password must contain at least one number' };
            }

            // Check for at least one special character
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                  return { field: 'password', message: 'Password must contain at least one special character' };
            }

            // Check for common weak passwords
            const commonPasswords = [
                  'password', 'password123', '12345678', 'qwerty123',
                  'letmein', 'welcome123', 'admin123', 'test1234'
            ];

            if (commonPasswords.includes(password.toLowerCase())) {
                  return { field: 'password', message: 'This password is too common. Please choose a stronger password' };
            }

            return null;
      }
      // Password validation with security requirements
      static UIValidatePassword(password: string): string[] {

            const completedRequirements: string[] = [];

            if (password.length >= 8 && password.length < 128) {
                  completedRequirements.push('passwd_len');
            }

            // Check for at least one uppercase letter
            if (/[A-Z]/.test(password)) {
                  completedRequirements.push('passwd_upper');
            }

            // Check for at least one lowercase letter
            if (/[a-z]/.test(password)) {
                  completedRequirements.push('passwd_lower');
            }

            // Check for at least one number
            if (/\d/.test(password)) {
                  completedRequirements.push('passwd_number');
            }

            // Check for at least one special character
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                  completedRequirements.push('passwd_special');
            }

            return completedRequirements;
      }

      // Validate entire form
      static validateForm(formData: AuthCredentials): ValidationError[] {
            const errors: ValidationError[] = [];

            const emailError = this.validateEmail(formData.email);
            if (emailError) errors.push(emailError);

            const passwordError = this.validatePassword(formData.password);
            if (passwordError) errors.push(passwordError);

            return errors;
      }
      
      
}

export function isValidEmail(value: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function toEmail(value: string): Email {
      if (!isValidEmail(value)) {
            throw new Error("Invalid email address")
      }
      return value as Email
}

export function isValidPhone(value: string): boolean {
      return  /^(?:\+234|234|0)(?:[789][01]\d{8}|[1-9]\d{7,9})$/.test(value);
}

export function toPhone(value: string): string {
      if (!isValidPhone(value)) {
            throw new Error("Invalid phone number")
      }
      return value;
}