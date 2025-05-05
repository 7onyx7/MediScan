import { Medication, Symptom, Diagnosis, MedicalHistory } from '../types';

/**
 * Utility functions for validating user inputs and data structures
 * This ensures data integrity and security throughout the application
 */

/**
 * Validate a medication object
 * @param medication The medication object to validate
 * @returns An object containing validation result and error messages
 */
export function validateMedication(medication: Partial<Medication>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Name validation - required and must be string
  if (!medication.name) {
    errors.name = 'Medication name is required';
  } else if (typeof medication.name !== 'string') {
    errors.name = 'Medication name must be text';
  } else if (medication.name.length > 100) {
    errors.name = 'Medication name must be less than 100 characters';
  }
  
  // Dosage validation - optional but must be string if provided
  if (medication.dosage !== undefined && medication.dosage !== '') {
    if (typeof medication.dosage !== 'string') {
      errors.dosage = 'Dosage must be text';
    } else if (medication.dosage.length > 50) {
      errors.dosage = 'Dosage must be less than 50 characters';
    }
  }
  
  // Frequency validation - optional but must be string if provided
  if (medication.frequency !== undefined && medication.frequency !== '') {
    if (typeof medication.frequency !== 'string') {
      errors.frequency = 'Frequency must be text';
    } else if (medication.frequency.length > 100) {
      errors.frequency = 'Frequency must be less than 100 characters';
    }
  }
  
  // Date validation - required and must be a valid date string
  if (!medication.datePrescribed) {
    errors.datePrescribed = 'Date prescribed is required';
  } else if (!isValidDateString(medication.datePrescribed)) {
    errors.datePrescribed = 'Invalid date format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate a symptom object
 * @param symptom The symptom object to validate
 * @returns An object containing validation result and error messages
 */
export function validateSymptom(symptom: Partial<Symptom>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!symptom.name) {
    errors.name = 'Symptom name is required';
  } else if (typeof symptom.name !== 'string') {
    errors.name = 'Symptom name must be text';
  } else if (symptom.name.length > 100) {
    errors.name = 'Symptom name must be less than 100 characters';
  }
  
  // Severity validation - must be number between 1-10
  if (symptom.severity === undefined || symptom.severity === null) {
    errors.severity = 'Severity is required';
  } else if (typeof symptom.severity !== 'number') {
    errors.severity = 'Severity must be a number';
  } else if (symptom.severity < 1 || symptom.severity > 10) {
    errors.severity = 'Severity must be between 1 and 10';
  }
  
  // Date validation
  if (!symptom.dateRecorded) {
    errors.dateRecorded = 'Date is required';
  } else if (!isValidDateString(symptom.dateRecorded)) {
    errors.dateRecorded = 'Invalid date format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate a diagnosis object
 * @param diagnosis The diagnosis object to validate
 * @returns An object containing validation result and error messages
 */
export function validateDiagnosis(diagnosis: Partial<Diagnosis>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!diagnosis.name) {
    errors.name = 'Diagnosis name is required';
  } else if (typeof diagnosis.name !== 'string') {
    errors.name = 'Diagnosis name must be text';
  } else if (diagnosis.name.length > 100) {
    errors.name = 'Diagnosis name must be less than 100 characters';
  }
  
  // Date validation
  if (!diagnosis.diagnosedDate) {
    errors.diagnosedDate = 'Diagnosis date is required';
  } else if (!isValidDateString(diagnosis.diagnosedDate)) {
    errors.diagnosedDate = 'Invalid date format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate medical history object
 * @param history The medical history object to validate
 * @returns An object containing validation result and error messages
 */
export function validateMedicalHistory(history: Partial<MedicalHistory>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Type validation
  const validTypes = ['surgery', 'illness', 'injury', 'other'];
  if (!history.type) {
    errors.type = 'Type is required';
  } else if (!validTypes.includes(history.type)) {
    errors.type = 'Invalid type - must be surgery, illness, injury, or other';
  }
  
  // Name validation
  if (!history.name) {
    errors.name = 'Name is required';
  } else if (typeof history.name !== 'string') {
    errors.name = 'Name must be text';
  } else if (history.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }
  
  // Date validation
  if (!history.date) {
    errors.date = 'Date is required';
  } else if (!isValidDateString(history.date)) {
    errors.date = 'Invalid date format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate date string in MM/DD/YYYY format
 * @param dateString Date string to validate
 * @returns Whether the date string is valid
 */
export function isValidDateString(dateString: string): boolean {
  // Basic date string validation - we could enhance this as needed
  if (!dateString) return false;
  
  // Check format with regex (MM/DD/YYYY)
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // Check if it's a valid date (e.g., not 02/31/2023)
  const parts = dateString.split('/');
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Sanitize text input to prevent XSS attacks
 * @param input Text input to sanitize
 * @returns Sanitized text
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that a string doesn't contain SQL injection patterns
 * @param input String to check
 * @returns Whether string is safe from SQL injection
 */
export function isSqlInjectionSafe(input: string): boolean {
  if (!input) return true;
  
  const sqlInjectionPatterns = [
    /(\b|-)SELECT\b/i,
    /(\b|-)INSERT\b/i,
    /(\b|-)UPDATE\b/i,
    /(\b|-)DELETE\b/i,
    /(\b|-)DROP\b/i,
    /(\b|-)UNION\b/i,
    /(\b|-)FROM\b/i,
    /(\b|-)WHERE\b/i,
    /--/,
    /;/,
    /\/\*/,
    /\*\//
  ];
  
  return !sqlInjectionPatterns.some(pattern => pattern.test(input));
}