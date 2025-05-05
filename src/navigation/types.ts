import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

/**
 * Type definitions for the application navigation system
 * This ensures type safety when navigating between screens
 */

export type RootStackParamList = {
  // Main Tabs
  Home: undefined;
  Profile: undefined;
  
  // Medication Screens
  Medications: undefined;
  AddMedication: undefined;
  MedicationDetail: { medicationId: string };
  MedicationScan: undefined;
  
  // Diagnosis Screens
  Diagnoses: undefined;
  AddDiagnosis: undefined;
  
  // Symptom Screens
  Symptoms: undefined;
  AddSymptom: undefined;
  
  // Medical History Screens
  MedicalHistory: undefined;
  AddMedicalHistory: undefined;
  
  // Analysis Screen
  Analysis: undefined;
};

// Export navigation prop types for each screen for easy use
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

// Medication navigation prop types
export type MedicationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Medications'>;
export type AddMedicationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMedication'>;
export type MedicationDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MedicationDetail'>;
export type MedicationScanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MedicationScan'>;

// Diagnosis navigation prop types
export type DiagnosesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Diagnoses'>;
export type AddDiagnosisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddDiagnosis'>;

// Symptom navigation prop types
export type SymptomsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Symptoms'>;
export type AddSymptomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddSymptom'>;

// Medical History navigation prop types
export type MedicalHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MedicalHistory'>;
export type AddMedicalHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMedicalHistory'>;

// Analysis navigation prop types
export type AnalysisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analysis'>;

// Route prop types for screens that need route parameters
export type MedicationDetailScreenRouteProp = RouteProp<RootStackParamList, 'MedicationDetail'>;

// Helper hooks for navigation props
export interface NavigationProps {
  navigation: NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList>;
}

// Strongly typed useNavigation hook usage example:
// const navigation = useNavigation<MedicationsScreenNavigationProp>();