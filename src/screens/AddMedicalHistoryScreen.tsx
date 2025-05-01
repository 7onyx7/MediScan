import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { MedicalHistory } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const AddMedicalHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, addMedicalHistory } = useUser();

  const [name, setName] = useState('');
  const [type, setType] = useState<MedicalHistory['type']>('other');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Description is required';
    }

    if (!date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      // Basic date validation (MM/DD/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Please use MM/DD/YYYY format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await addMedicalHistory({
        name,
        type,
        date,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding medical history:', error);
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
        <Text style={styles.title}>Add Medical History</Text>
        
        <Input
          label="Description"
          value={name}
          onChangeText={setName}
          placeholder="Enter a description"
          error={errors.name}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'surgery' && styles.selectedTypeButton]}
            onPress={() => setType('surgery')}
          >
            <Text style={[styles.typeButtonText, type === 'surgery' && styles.selectedTypeButtonText]}>
              Surgery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'illness' && styles.selectedTypeButton]}
            onPress={() => setType('illness')}
          >
            <Text style={[styles.typeButtonText, type === 'illness' && styles.selectedTypeButtonText]}>
              Illness
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'injury' && styles.selectedTypeButton]}
            onPress={() => setType('injury')}
          >
            <Text style={[styles.typeButtonText, type === 'injury' && styles.selectedTypeButtonText]}>
              Injury
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'other' && styles.selectedTypeButton]}
            onPress={() => setType('other')}
          >
            <Text style={[styles.typeButtonText, type === 'other' && styles.selectedTypeButtonText]}>
              Other
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Date"
          value={date}
          onChangeText={setDate}
          placeholder="MM/DD/YYYY"
          error={errors.date}
        />

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional details"
          multiline
        />

        <Button
          title="Save"
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    color: '#333',
  },
  selectedTypeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddMedicalHistoryScreen;