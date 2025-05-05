import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import { Medication, Diagnosis, Symptom, MedicalHistory } from '../types';

// For non-sensitive data
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing data:', error);
    throw new Error('Failed to store data');
  }
};

export const getData = async (key: string): Promise<any> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw new Error('Failed to retrieve data');
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw new Error('Failed to remove data');
  }
};

// For sensitive data (medical information, etc.)
export const storeSecureData = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error storing secure data:', error);
    throw new Error('Failed to store secure data');
  }
};

export const getSecureData = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    throw new Error('Failed to retrieve secure data');
  }
};

export const removeSecureData = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing secure data:', error);
    throw new Error('Failed to remove secure data');
  }
};

/**
 * Storage keys for different data types
 */
const STORAGE_KEYS = {
  MEDICATIONS: 'mediscan_medications',
  DIAGNOSES: 'mediscan_diagnoses',
  SYMPTOMS: 'mediscan_symptoms',
  MEDICAL_HISTORY: 'mediscan_medical_history',
  USER_PROFILE: 'mediscan_user_profile',
  ENCRYPTION_KEY: 'mediscan_encryption_key'
};

/**
 * Generate a secure random encryption key
 */
async function generateEncryptionKey(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get the encryption key (create if doesn't exist)
 */
async function getEncryptionKey(): Promise<string> {
  try {
    let key = await SecureStore.getItemAsync(STORAGE_KEYS.ENCRYPTION_KEY);
    if (!key) {
      key = await generateEncryptionKey();
      await SecureStore.setItemAsync(STORAGE_KEYS.ENCRYPTION_KEY, key);
    }
    return key;
  } catch (error) {
    console.error('Failed to get encryption key:', error);
    throw new Error('Could not access secure storage');
  }
}

/**
 * Encrypt data before storing
 */
async function encryptData(data: any): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const jsonStr = JSON.stringify(data);
    
    // In a production app, use a more robust encryption method
    // This is a simple XOR encryption for demo purposes
    const encryptedData = Array.from(jsonStr).map((char, index) => {
      const keyChar = key[index % key.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
    
    return encryptedData;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data after retrieving
 */
async function decryptData(encryptedData: string): Promise<any> {
  try {
    const key = await getEncryptionKey();
    
    // Decrypt using the same XOR operation
    const decryptedStr = Array.from(encryptedData).map((char, index) => {
      const keyChar = key[index % key.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
    
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Save data with encryption
 */
async function saveData<T>(key: string, data: T[]): Promise<void> {
  try {
    const encryptedData = await encryptData(data);
    await SecureStore.setItemAsync(key, encryptedData);
    
    // If online, perform backup to cloud (implement in production)
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      syncDataToCloud(key, encryptedData);
    }
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw new Error(`Failed to save ${key}`);
  }
}

/**
 * Load data with decryption
 */
async function loadData<T>(key: string): Promise<T[]> {
  try {
    const encryptedData = await SecureStore.getItemAsync(key);
    if (!encryptedData) {
      return [];
    }
    
    return await decryptData(encryptedData);
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    throw new Error(`Failed to load ${key}`);
  }
}

/**
 * Sync data to cloud backup when online
 * (Placeholder for actual implementation)
 */
async function syncDataToCloud(key: string, encryptedData: string): Promise<void> {
  // In a production app, implement secure cloud sync
  // using Firebase, AWS Amplify, or another cloud provider
  console.log(`Would sync ${key} to cloud`);
}

/**
 * Delete all stored data (for logout/account deletion)
 */
async function clearAllData(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
  } catch (error) {
    console.error('Error clearing data:', error);
    throw new Error('Failed to clear all data');
  }
}

// ----- Medication functions -----

export async function getMedications(): Promise<Medication[]> {
  return await loadData<Medication>(STORAGE_KEYS.MEDICATIONS);
}

export async function addMedication(medication: Medication): Promise<Medication> {
  const medications = await getMedications();
  
  // Generate ID if not provided
  const newMedication: Medication = {
    ...medication,
    id: medication.id || `med_${Date.now()}`
  };
  
  // Add new medication
  const updatedMedications = [...medications, newMedication];
  await saveData(STORAGE_KEYS.MEDICATIONS, updatedMedications);
  
  return newMedication;
}

export async function updateMedication(medication: Medication): Promise<Medication> {
  if (!medication.id) {
    throw new Error('Medication ID is required for updates');
  }
  
  const medications = await getMedications();
  const index = medications.findIndex(m => m.id === medication.id);
  
  if (index === -1) {
    throw new Error(`Medication with ID ${medication.id} not found`);
  }
  
  // Update medication
  medications[index] = medication;
  await saveData(STORAGE_KEYS.MEDICATIONS, medications);
  
  return medication;
}

export async function deleteMedication(id: string): Promise<void> {
  const medications = await getMedications();
  const updatedMedications = medications.filter(m => m.id !== id);
  await saveData(STORAGE_KEYS.MEDICATIONS, updatedMedications);
}

// ----- Diagnosis functions -----

export async function getDiagnoses(): Promise<Diagnosis[]> {
  return await loadData<Diagnosis>(STORAGE_KEYS.DIAGNOSES);
}

export async function addDiagnosis(diagnosis: Diagnosis): Promise<Diagnosis> {
  const diagnoses = await getDiagnoses();
  
  const newDiagnosis: Diagnosis = {
    ...diagnosis,
    id: diagnosis.id || `diag_${Date.now()}`
  };
  
  const updatedDiagnoses = [...diagnoses, newDiagnosis];
  await saveData(STORAGE_KEYS.DIAGNOSES, updatedDiagnoses);
  
  return newDiagnosis;
}

export async function updateDiagnosis(diagnosis: Diagnosis): Promise<Diagnosis> {
  if (!diagnosis.id) {
    throw new Error('Diagnosis ID is required for updates');
  }
  
  const diagnoses = await getDiagnoses();
  const index = diagnoses.findIndex(d => d.id === diagnosis.id);
  
  if (index === -1) {
    throw new Error(`Diagnosis with ID ${diagnosis.id} not found`);
  }
  
  diagnoses[index] = diagnosis;
  await saveData(STORAGE_KEYS.DIAGNOSES, diagnoses);
  
  return diagnosis;
}

export async function deleteDiagnosis(id: string): Promise<void> {
  const diagnoses = await getDiagnoses();
  const updatedDiagnoses = diagnoses.filter(d => d.id !== id);
  await saveData(STORAGE_KEYS.DIAGNOSES, updatedDiagnoses);
}

// ----- Symptom functions -----

export async function getSymptoms(): Promise<Symptom[]> {
  return await loadData<Symptom>(STORAGE_KEYS.SYMPTOMS);
}

export async function addSymptom(symptom: Symptom): Promise<Symptom> {
  const symptoms = await getSymptoms();
  
  const newSymptom: Symptom = {
    ...symptom,
    id: symptom.id || `sym_${Date.now()}`
  };
  
  const updatedSymptoms = [...symptoms, newSymptom];
  await saveData(STORAGE_KEYS.SYMPTOMS, updatedSymptoms);
  
  return newSymptom;
}

export async function updateSymptom(symptom: Symptom): Promise<Symptom> {
  if (!symptom.id) {
    throw new Error('Symptom ID is required for updates');
  }
  
  const symptoms = await getSymptoms();
  const index = symptoms.findIndex(s => s.id === symptom.id);
  
  if (index === -1) {
    throw new Error(`Symptom with ID ${symptom.id} not found`);
  }
  
  symptoms[index] = symptom;
  await saveData(STORAGE_KEYS.SYMPTOMS, symptoms);
  
  return symptom;
}

export async function deleteSymptom(id: string): Promise<void> {
  const symptoms = await getSymptoms();
  const updatedSymptoms = symptoms.filter(s => s.id !== id);
  await saveData(STORAGE_KEYS.SYMPTOMS, updatedSymptoms);
}

// Export other functions as needed