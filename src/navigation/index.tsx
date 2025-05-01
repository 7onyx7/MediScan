import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import MedicationDetailScreen from '../screens/MedicationDetailScreen';
import SymptomsScreen from '../screens/SymptomsScreen';
import AddSymptomScreen from '../screens/AddSymptomScreen';
import DiagnosesScreen from '../screens/DiagnosesScreen';
import AddDiagnosisScreen from '../screens/AddDiagnosisScreen';
import MedicalHistoryScreen from '../screens/MedicalHistoryScreen';
import AddMedicalHistoryScreen from '../screens/AddMedicalHistoryScreen';
import AnalysisScreen from '../screens/AnalysisScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'MediScan' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'My Profile' }}
        />
        <Stack.Screen
          name="Medications"
          component={MedicationsScreen}
          options={{ title: 'My Medications' }}
        />
        <Stack.Screen
          name="AddMedication"
          component={AddMedicationScreen}
          options={{ title: 'Add Medication' }}
        />
        <Stack.Screen
          name="MedicationDetail"
          component={MedicationDetailScreen}
          options={{ title: 'Medication Details' }}
        />
        <Stack.Screen
          name="Symptoms"
          component={SymptomsScreen}
          options={{ title: 'My Symptoms' }}
        />
        <Stack.Screen
          name="AddSymptom"
          component={AddSymptomScreen}
          options={{ title: 'Record Symptom' }}
        />
        <Stack.Screen
          name="Diagnoses"
          component={DiagnosesScreen}
          options={{ title: 'My Diagnoses' }}
        />
        <Stack.Screen
          name="AddDiagnosis"
          component={AddDiagnosisScreen}
          options={{ title: 'Add Diagnosis' }}
        />
        <Stack.Screen
          name="MedicalHistory"
          component={MedicalHistoryScreen}
          options={{ title: 'Medical History' }}
        />
        <Stack.Screen
          name="AddMedicalHistory"
          component={AddMedicalHistoryScreen}
          options={{ title: 'Add Medical History' }}
        />
        <Stack.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{ title: 'Safety Analysis' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 