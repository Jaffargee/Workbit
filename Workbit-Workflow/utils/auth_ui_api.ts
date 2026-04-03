import { ValidationError } from "@/types/auth_types";


export default class AuthUIApi {

            // Get error message for specific field
      static getFieldError (errors: ValidationError[], field: 'email' | 'password' | 'general' | 'state' | 'phone') {
            return errors.find(err => err.field === field)?.message;
      };

      // Get general error message
      static getGeneralError (errors: ValidationError[]) {
            return errors.find(err => err.field === 'general')?.message;
      };

}