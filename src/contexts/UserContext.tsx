import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, Medication, Symptom, Diagnosis, MedicalHistory } from '../types';
import { generateId } from '../utils/helpers';

interface UserContextType {
  patient: Patient | null;
  loading: boolean;
  error: string | null;
  initializePatient: (data: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (data: Partial<Patient>) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  addSymptom: (symptom: Omit<Symptom, 'id'>) => Promise<void>;
  updateSymptom: (id: string, symptom: Partial<Symptom>) => Promise<void>;
  deleteSymptom: (id: string) => Promise<void>;
  addDiagnosis: (diagnosis: Omit<Diagnosis, 'id'>) => Promise<void>;
  updateDiagnosis: (id: string, diagnosis: Partial<Diagnosis>) => Promise<void>;
  deleteDiagnosis: (id: string) => Promise<void>;
  addMedicalHistory: (history: Omit<MedicalHistory, 'id'>) => Promise<void>;
  updateMedicalHistory: (id: string, history: Partial<MedicalHistory>) => Promise<void>;
  deleteMedicalHistory: (id: string) => Promise<void>;
  addAllergy: (allergy: string) => Promise<void>;
  deleteAllergy: (allergy: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const storedPatient = await AsyncStorage.getItem('patient');
        if (storedPatient) {
          setPatient(JSON.parse(storedPatient));
        }
      } catch (err) {
        setError('Failed to load patient data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, []);

  const savePatient = async (updatedPatient: Patient) => {
    try {
      const jsonValue = JSON.stringify(updatedPatient);
      await AsyncStorage.setItem('patient', jsonValue);
      setPatient(updatedPatient);
    } catch (err) {
      setError('Failed to save patient data');
      console.error(err);
    }
  };

  const initializePatient = async (data: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...data,
      id: generateId(),
      medications: [],
      symptoms: [],
      diagnoses: [],
      medicalHistory: [],
      allergies: [],
    };
    await savePatient(newPatient);
  };

  const updatePatient = async (data: Partial<Patient>) => {
    if (!patient) return;
    const updatedPatient = { ...patient, ...data };
    await savePatient(updatedPatient);
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    if (!patient) return;
    const newMedication: Medication = { ...medication, id: generateId() };
    const updatedMedications = [...patient.medications, newMedication];
    await savePatient({ ...patient, medications: updatedMedications });
  };

  const updateMedication = async (id: string, medication: Partial<Medication>) => {
    if (!patient) return;
    const updatedMedications = patient.medications.map(med => 
      med.id === id ? { ...med, ...medication } : med
    );
    await savePatient({ ...patient, medications: updatedMedications });
  };

  const deleteMedication = async (id: string) => {
    if (!patient) return;
    const updatedMedications = patient.medications.filter(med => med.id !== id);
    await savePatient({ ...patient, medications: updatedMedications });
  };

  const addSymptom = async (symptom: Omit<Symptom, 'id'>) => {
    if (!patient) return;
    const newSymptom: Symptom = { ...symptom, id: generateId() };
    const updatedSymptoms = [...patient.symptoms, newSymptom];
    await savePatient({ ...patient, symptoms: updatedSymptoms });
  };

  const updateSymptom = async (id: string, symptom: Partial<Symptom>) => {
    if (!patient) return;
    const updatedSymptoms = patient.symptoms.map(sym => 
      sym.id === id ? { ...sym, ...symptom } : sym
    );
    await savePatient({ ...patient, symptoms: updatedSymptoms });
  };

  const deleteSymptom = async (id: string) => {
    if (!patient) return;
    const updatedSymptoms = patient.symptoms.filter(sym => sym.id !== id);
    await savePatient({ ...patient, symptoms: updatedSymptoms });
  };

  const addDiagnosis = async (diagnosis: Omit<Diagnosis, 'id'>) => {
    if (!patient) return;
    const newDiagnosis: Diagnosis = { ...diagnosis, id: generateId() };
    const updatedDiagnoses = [...patient.diagnoses, newDiagnosis];
    await savePatient({ ...patient, diagnoses: updatedDiagnoses });
  };

  const updateDiagnosis = async (id: string, diagnosis: Partial<Diagnosis>) => {
    if (!patient) return;
    const updatedDiagnoses = patient.diagnoses.map(diag => 
      diag.id === id ? { ...diag, ...diagnosis } : diag
    );
    await savePatient({ ...patient, diagnoses: updatedDiagnoses });
  };

  const deleteDiagnosis = async (id: string) => {
    if (!patient) return;
    const updatedDiagnoses = patient.diagnoses.filter(diag => diag.id !== id);
    await savePatient({ ...patient, diagnoses: updatedDiagnoses });
  };

  const addMedicalHistory = async (history: Omit<MedicalHistory, 'id'>) => {
    if (!patient) return;
    const newHistory: MedicalHistory = { ...history, id: generateId() };
    const updatedHistory = [...patient.medicalHistory, newHistory];
    await savePatient({ ...patient, medicalHistory: updatedHistory });
  };

  const updateMedicalHistory = async (id: string, history: Partial<MedicalHistory>) => {
    if (!patient) return;
    const updatedHistory = patient.medicalHistory.map(hist => 
      hist.id === id ? { ...hist, ...history } : hist
    );
    await savePatient({ ...patient, medicalHistory: updatedHistory });
  };

  const deleteMedicalHistory = async (id: string) => {
    if (!patient) return;
    const updatedHistory = patient.medicalHistory.filter(hist => hist.id !== id);
    await savePatient({ ...patient, medicalHistory: updatedHistory });
  };

  const addAllergy = async (allergy: string) => {
    if (!patient) return;
    if (patient.allergies.includes(allergy)) return;
    const updatedAllergies = [...patient.allergies, allergy];
    await savePatient({ ...patient, allergies: updatedAllergies });
  };

  const deleteAllergy = async (allergy: string) => {
    if (!patient) return;
    const updatedAllergies = patient.allergies.filter(a => a !== allergy);
    await savePatient({ ...patient, allergies: updatedAllergies });
  };

  return (
    <UserContext.Provider
      value={{
        patient,
        loading,
        error,
        initializePatient,
        updatePatient,
        addMedication,
        updateMedication,
        deleteMedication,
        addSymptom,
        updateSymptom,
        deleteSymptom,
        addDiagnosis,
        updateDiagnosis,
        deleteDiagnosis,
        addMedicalHistory,
        updateMedicalHistory,
        deleteMedicalHistory,
        addAllergy,
        deleteAllergy,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};