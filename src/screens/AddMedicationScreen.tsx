import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const AddMedicationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, addMedication } = useUser();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Only medication name is required in test mode
    if (!name.trim()) {
      newErrors.name = 'Medication name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const today = new Date();
    const dateString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    try {
      await addMedication({
        name,
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
        datePrescribed: dateString,
        prescribedBy: prescribedBy.trim() || 'Test Doctor',
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding medication:', error);
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
        <Text style={styles.title}>Add Medication</Text>
        <Text style={styles.subtitle}>(Test Mode - Only Name is Required)</Text>
        
        <Input
          label="Medication Name *"
          value={name}
          onChangeText={setName}
          placeholder="E.g., Advil, Tylenol, etc."
          error={errors.name}
        />

        <Input
          label="Dosage (Optional)"
          value={dosage}
          onChangeText={setDosage}
          placeholder="E.g., 200mg, 1 tablet, etc."
        />

        <Input
          label="Frequency (Optional)"
          value={frequency}
          onChangeText={setFrequency}
          placeholder="E.g., Once daily, Twice a week, etc."
        />

        <Input
          label="Prescribed By (Optional)"
          value={prescribedBy}
          onChangeText={setPrescribedBy}
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
          title="Save Medication"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
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

export default AddMedicationScreen;