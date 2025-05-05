import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const AddDiagnosisScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, addDiagnosis } = useUser();

  const [name, setName] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [diagnosedBy, setDiagnosedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Only diagnosis name is required in test mode
    if (!name.trim()) {
      newErrors.name = 'Diagnosis name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // If no date provided, use today
    const today = new Date();
    const dateString = diagnosedDate.trim() || 
      `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    try {
      await addDiagnosis({
        name,
        diagnosedDate: dateString,
        diagnosedBy: diagnosedBy.trim() || 'Test Doctor',
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding diagnosis:', error);
    }
  };

  if (!patient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Please set up your profile first</Text>
        <Button
          title="Go to Profile"
          onPress={() => navigation.navigate('Profile' as never)}
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>Add Diagnosis</Text>
        <Text style={styles.subtitle}>(Test Mode - Only Name is Required)</Text>
        
        <Input
          label="Diagnosis Name *"
          value={name}
          onChangeText={setName}
          placeholder="E.g., Diabetes, Hypertension, etc."
          error={errors.name}
        />

        <Input
          label="Date Diagnosed (Optional)"
          value={diagnosedDate}
          onChangeText={setDiagnosedDate}
          placeholder="MM/DD/YYYY"
        />

        <Input
          label="Diagnosed By (Optional)"
          value={diagnosedBy}
          onChangeText={setDiagnosedBy}
          placeholder="Doctor's name"
        />

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional information"
          multiline
        />

        <Button
          title="Save Diagnosis"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    minWidth: 160,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default AddDiagnosisScreen;