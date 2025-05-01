import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';

const SymptomsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient, deleteSymptom } = useUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Symptom",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteSymptom(id);
            } catch (error) {
              console.error('Error deleting symptom:', error);
              Alert.alert('Error', 'Failed to delete symptom');
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
        <Text style={styles.title}>Symptoms</Text>
        <Button
          title="Add"
          onPress={() => navigation.navigate('AddSymptom' as never)}
          style={styles.addButton}
        />
      </View>

      {patient.symptoms.length > 0 ? (
        <View>
          {patient.symptoms.map(symptom => (
            <Card key={symptom.id} style={styles.card}>
              <View style={styles.symptomHeader}>
                <Text style={styles.symptomName}>{symptom.name}</Text>
                <View style={styles.actionsContainer}>
                  <Text style={styles.symptomSeverity}>Severity: {symptom.severity}/10</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDelete(symptom.id, symptom.name)}
                    disabled={isDeleting}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.symptomDate}>Recorded: {symptom.dateRecorded}</Text>
              {symptom.notes && <Text style={styles.notes}>{symptom.notes}</Text>}
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't recorded any symptoms yet</Text>
          <Button
            title="Record Symptom"
            onPress={() => navigation.navigate('AddSymptom' as never)}
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
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  symptomSeverity: {
    color: '#E91E63',
    fontWeight: '500',
  },
  symptomDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default SymptomsScreen;