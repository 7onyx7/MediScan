import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';
import { Medication } from '../types';
import { formatDate } from '../utils/helpers';

const MedicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, deleteMedication, loading } = useUser();

  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>Please set up your profile first</Text>
        <Button
          title="Go to Profile"
          onPress={() => navigation.navigate('Profile')}
          style={styles.button}
        />
      </View>
    );
  }

  if (patient.medications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Medications</Text>
          <Button
            title="Add"
            onPress={() => navigation.navigate('AddMedication')}
            style={styles.addButton}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't added any medications yet</Text>
          <Button
            title="Add Medication"
            onPress={() => navigation.navigate('AddMedication')}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medications</Text>
        <Button
          title="Add"
          onPress={() => navigation.navigate('AddMedication')}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={patient.medications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity
              onPress={() => navigation.navigate('MedicationDetail', { medicationId: item.id })}
            >
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{item.name}</Text>
                <Text style={styles.medicationDosage}>{item.dosage}</Text>
              </View>
              <Text style={styles.medicationFrequency}>
                <Text style={styles.label}>Frequency: </Text>
                {item.frequency}
              </Text>
              <Text style={styles.medicationDate}>
                <Text style={styles.label}>Started: </Text>
                {formatDate(item.startDate)}
              </Text>
              {item.endDate && (
                <Text style={styles.medicationDate}>
                  <Text style={styles.label}>Ended: </Text>
                  {formatDate(item.endDate)}
                </Text>
              )}
              {item.prescribedBy && (
                <Text style={styles.medicationPrescriber}>
                  <Text style={styles.label}>Prescribed by: </Text>
                  {item.prescribedBy}
                </Text>
              )}
              <View style={styles.actionRow}>
                <Button
                  title="Edit"
                  onPress={() => 
                    navigation.navigate('AddMedication', { 
                      medicationId: item.id 
                    })
                  }
                  type="secondary"
                  style={styles.actionButton}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDeleteMedication(item.id)}
                  type="danger"
                  style={styles.actionButton}
                />
              </View>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    minWidth: 80,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 16,
    color: '#333',
  },
  medicationFrequency: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  medicationDate: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  medicationPrescriber: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  label: {
    fontWeight: '500',
    color: '#555',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    minWidth: 80,
    marginLeft: 8,
  },
});

export default MedicationsScreen;