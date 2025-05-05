import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import ErrorBoundary from '../components/ErrorBoundary';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import MedicationDetailScreen from '../screens/MedicationDetailScreen';
import MedicationScanScreen from '../screens/MedicationScanScreen';
import SymptomsScreen from '../screens/SymptomsScreen';
import AddSymptomScreen from '../screens/AddSymptomScreen';
import DiagnosesScreen from '../screens/DiagnosesScreen';
import AddDiagnosisScreen from '../screens/AddDiagnosisScreen';
import MedicalHistoryScreen from '../screens/MedicalHistoryScreen';
import AddMedicalHistoryScreen from '../screens/AddMedicalHistoryScreen';
import AnalysisScreen from '../screens/AnalysisScreen';

// Create type-safe navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main navigation container with proper error handling
 */
const Navigation = () => {
  return (
    <NavigationContainer
      fallback={<Text>Loading...</Text>}
      onReady={() => {
        console.log('Navigation is ready');
        // Could track analytics events here
      }}
      onStateChange={(state) => {
        // Track screen views for analytics
        const currentRouteName = state?.routes[state.index]?.name;
        if (currentRouteName) {
          console.log(`Screen visited: ${currentRouteName}`);
          // Analytics.logScreenView({ screen_name: currentRouteName });
        }
      }}
    >
      <ErrorBoundary>
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
            // Add animation and gesture settings for a polished feel
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            // Add proper accessibility settings
            headerBackTitle: 'Back',
          }}
        >
          {/* Home and Profile */}
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
          
          {/* Medication Routes */}
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
            options={({ route }) => ({ 
              title: route.params?.medicationId ? `Medication: ${route.params.medicationId}` : 'Medication Details' 
            })}
          />
          <Stack.Screen
            name="MedicationScan"
            component={MedicationScanScreen}
            options={{ title: 'Scan Medication' }}
          />
          
          {/* Symptom Routes */}
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
          
          {/* Diagnosis Routes */}
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
          
          {/* Medical History Routes */}
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
          
          {/* Analysis Routes */}
          <Stack.Screen
            name="Analysis"
            component={AnalysisScreen}
            options={{ title: 'Safety Analysis' }}
          />
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

export default Navigation;