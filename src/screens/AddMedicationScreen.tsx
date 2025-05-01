import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useUser } from '../contexts/UserContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { searchMedication } from '../services/FdaService';

type AddMedicationScreenRouteProp = RouteProp<RootStackParamList, 'AddMedication'>;

const AddMedicationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddMedicationScreenRouteProp>();
  const { patient, addMedication, updateMedication } = useUser();

  const medicationId = (route.params as any)?.medicationId;
  const existingMedication = patient?.medications.find(med => med.id === medicationId);
  const isEditing = !!existingMedication;

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (existingMedication) {
      setName(existingMedication.name);
      setDosage(existingMedication.dosage);
      setFrequency(existingMedication.frequency);
      setStartDate(existingMedication.startDate);
      setEndDate(existingMedication.endDate || '');
      setPrescribedBy(existingMedication.prescribedBy || '');
      setNotes(existingMedication.notes || '');
    }
  }, [existingMedication]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Medication name is required';
    }

    if (!dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (!frequency.trim()) {
      newErrors.frequency = 'Frequency is required';
    }

    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    } else {
      // Basic date validation (MM/DD/YYYY)
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(startDate)) {
        newErrors.startDate = 'Please use MM/DD/YYYY format';
      }
    }

    if (endDate.trim()) {
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(endDate)) {
        newErrors.endDate = 'Please use MM/DD/YYYY format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchMedication = async () => {
    if (!name.trim()) return;

    try {
      setSearching(true);
      const results = await searchMedication(name);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching medication:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMedication = (result: any) => {
    const brandName = result.openfda.brand_name ? result.openfda.brand_name[0] : '';
    const genericName = result.openfda.generic_name ? result.openfda.generic_name[0] : '';
    setName(brandName || genericName);
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const medicationData = {
        name,
        dosage,
        frequency,
        startDate,
        endDate: endDate || undefined,
        prescribedBy: prescribedBy || undefined,
        notes: notes || undefined,
      };

      if (isEditing && medicationId) {
        await updateMedication(medicationId, medicationData);
      } else {
        await addMedication(medicationData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving medication:', error);
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
        <Text style={styles.title}>{isEditing ? 'Edit Medication' : 'Add Medication'}</Text>

        <View style={styles.searchContainer}>
          <Input
            label="Medication Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter medication name"
            error={errors.name}
            style={styles.searchInput}
          />
          <Button
            title="Search"
            onPress={handleSearchMedication}
            style={styles.searchButton}
            loading={searching}
          />
        </View>

        {searchResults.length > 0 && (
          <Card style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Search Results</Text>
            {searchResults.map((result, index) => {
              const brandName = result.openfda.brand_name ? result.openfda.brand_name[0] : '';
              const genericName = result.openfda.generic_name ? result.openfda.generic_name[0] : '';
              return (
                <Button
                  key={index}
                  title={brandName || genericName}
                  onPress={() => handleSelectMedication(result)}
                  type="secondary"
                  style={styles.resultButton}
                />
              );
            })}
          </Card>
        )}

        <Input
          label="Dosage"
          value={dosage}
          onChangeText={setDosage}
          placeholder="e.g., 10mg"
          error={errors.dosage}
        />

        <Input
          label="Frequency"
          value={frequency}
          onChangeText={setFrequency}
          placeholder="e.g., Twice daily"
          error={errors.frequency}
        />

        <Input
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="MM/DD/YYYY"
          error={errors.startDate}
        />

        <Input
          label="End Date (Optional)"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="MM/DD/YYYY"
          error={errors.endDate}
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
          placeholder="Additional notes"
          multiline
        />

        <Button
          title={isEditing ? 'Update Medication' : 'Add Medication'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    minWidth: 80,
    marginBottom: 16,
  },
  resultsCard: {
    marginBottom: 16,
    padding: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  resultButton: {
    marginBottom: 8,
  },
});

export default AddMedicationScreen;