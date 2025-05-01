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
    
    if (!name.trim()) {
      newErrors.name = 'Diagnosis name is required';
    }

    if (!diagnosedDate.trim()) {
      newErrors.diagnosedDate = 'Diagnosis date is required';
    } else {
      // Basic date validation (MM/DD/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(diagnosedDate)) {
        newErrors.diagnosedDate = 'Please use MM/DD/YYYY format';
      }
    }

    if (!diagnosedBy.trim()) {
      newErrors.diagnosedBy = 'Healthcare provider name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await addDiagnosis({
        name,
        diagnosedDate,
        diagnosedBy,
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
        
        <Input
          label="Diagnosis"
          value={name}
          onChangeText={setName}
          placeholder="Enter diagnosis name"
          error={errors.name}
        />

        <Input
          label="Date Diagnosed"
          value={diagnosedDate}
          onChangeText={setDiagnosedDate}
          placeholder="MM/DD/YYYY"
          error={errors.diagnosedDate}
        />

        <Input
          label="Diagnosed By"
          value={diagnosedBy}
          onChangeText={setDiagnosedBy}
          placeholder="Enter healthcare provider's name"
          error={errors.diagnosedBy}
        />

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional information about the diagnosis"
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
    marginBottom: 16,
    color: '#333',
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