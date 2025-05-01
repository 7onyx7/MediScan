import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatDate } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

const DiagnosesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, deleteDiagnosis } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Diagnosis",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteDiagnosis(id);
            } catch (error) {
              console.error('Error deleting diagnosis:', error);
              Alert.alert('Error', 'Failed to delete diagnosis');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnoses</Text>
        <Button
          title="Add"
          onPress={() => navigation.navigate('AddDiagnosis' as never)}
          style={styles.addButton}
        />
      </View>

      {patient.diagnoses.length > 0 ? (
        <View>
          {patient.diagnoses.map(diagnosis => (
            <Card key={diagnosis.id} style={styles.card}>
              <View style={styles.diagnosisHeader}>
                <Text style={styles.diagnosisName}>{diagnosis.name}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDelete(diagnosis.id, diagnosis.name)}
                  disabled={isDeleting}
                >
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Diagnosed On:</Text>
                <Text style={styles.value}>{formatDate(diagnosis.diagnosedDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Diagnosed By:</Text>
                <Text style={styles.value}>{diagnosis.diagnosedBy}</Text>
              </View>
              {diagnosis.notes && (
                <View style={styles.notes}>
                  <Text style={styles.label}>Notes:</Text>
                  <Text style={styles.notesText}>{diagnosis.notes}</Text>
                </View>
              )}
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't added any diagnoses yet</Text>
          <Button
            title="Add Diagnosis"
            onPress={() => navigation.navigate('AddDiagnosis' as never)}
            style={styles.button}
          />
        </View>
      )}
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
  card: {
    marginBottom: 12,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  diagnosisName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginRight: 8,
  },
  value: {
    color: '#333',
  },
  notes: {
    marginTop: 8,
  },
  notesText: {
    color: '#666',
    marginTop: 4,
  },
});

export default DiagnosesScreen;