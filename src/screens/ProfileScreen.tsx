import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, initializePatient, updatePatient, loading } = useUser();

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setDateOfBirth(patient.dateOfBirth);
      setGender(patient.gender);
    }
  }, [patient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Basic date validation (MM/DD/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(dateOfBirth)) {
        newErrors.dateOfBirth = 'Please use MM/DD/YYYY format';
      }
    }

    if (!gender.trim()) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (patient) {
        // Update existing patient
        await updatePatient({
          name,
          dateOfBirth,
          gender,
        });
      } else {
        // Create new patient
        await initializePatient({
          name,
          dateOfBirth,
          gender,
          allergies: [],
          medications: [],
          symptoms: [],
          diagnoses: [],
          medicalHistory: [],
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;

    try {
      if (patient) {
        const updatedAllergies = [...patient.allergies, newAllergy];
        await updatePatient({ allergies: updatedAllergies });
        setNewAllergy('');
      }
    } catch (error) {
      console.error('Error adding allergy:', error);
    }
  };

  const handleRemoveAllergy = async (allergy: string) => {
    try {
      if (patient) {
        const updatedAllergies = patient.allergies.filter(a => a !== allergy);
        await updatePatient({ allergies: updatedAllergies });
      }
    } catch (error) {
      console.error('Error removing allergy:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          error={errors.name}
        />
        <Input
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="MM/DD/YYYY"
          error={errors.dateOfBirth}
        />
        <Input
          label="Gender"
          value={gender}
          onChangeText={setGender}
          placeholder="Enter your gender"
          error={errors.gender}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Allergies</Text>
        <View style={styles.allergiesContainer}>
          {patient?.allergies.map((allergy, index) => (
            <View key={index} style={styles.allergyItem}>
              <Text style={styles.allergyText}>{allergy}</Text>
              <Button
                title="Remove"
                onPress={() => handleRemoveAllergy(allergy)}
                type="danger"
                style={styles.removeButton}
              />
            </View>
          ))}
        </View>
        <View style={styles.addAllergyContainer}>
          <Input
            value={newAllergy}
            onChangeText={setNewAllergy}
            placeholder="Add a new allergy"
            style={styles.allergyInput}
          />
          <Button
            title="Add"
            onPress={handleAddAllergy}
            style={styles.addButton}
            disabled={!newAllergy.trim()}
          />
        </View>
      </Card>

      <Button
        title={patient ? 'Update Profile' : 'Create Profile'}
        onPress={handleSave}
        style={styles.saveButton}
      />
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
  },
  card: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  allergiesContainer: {
    marginBottom: 16,
  },
  allergyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  allergyText: {
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    minWidth: 80,
    padding: 4,
  },
  addAllergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergyInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addButton: {
    minWidth: 80,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default ProfileScreen;