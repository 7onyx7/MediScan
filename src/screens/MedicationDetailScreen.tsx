import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useUser } from '../contexts/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatDate } from '../utils/helpers';
import { getMedicationDetails } from '../services/FdaService';

type MedicationDetailRouteProp = RouteProp<RootStackParamList, 'MedicationDetail'>;

const MedicationDetailScreen: React.FC = () => {
  const route = useRoute<MedicationDetailRouteProp>();
  const navigation = useNavigation();
  const { patient } = useUser();
  const { medicationId } = route.params;
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const medication = patient?.medications.find(m => m.id === medicationId);

  useEffect(() => {
    if (medication) {
      fetchMedicationDetails(medication.name);
    }
  }, [medication]);

  const fetchMedicationDetails = async (medicationName: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMedicationDetails(medicationName);
      setDetails(result);
    } catch (err) {
      console.error('Error fetching medication details:', err);
      setError('Failed to fetch medication details from FDA database.');
    } finally {
      setLoading(false);
    }
  };

  if (!medication) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Medication not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Dosage:</Text>
          <Text style={styles.value}>{medication.dosage}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Frequency:</Text>
          <Text style={styles.value}>{medication.frequency}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>{formatDate(medication.startDate)}</Text>
        </View>
        {medication.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>End Date:</Text>
            <Text style={styles.value}>{formatDate(medication.endDate)}</Text>
          </View>
        )}
        {medication.prescribedBy && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Prescribed By:</Text>
            <Text style={styles.value}>{medication.prescribedBy}</Text>
          </View>
        )}
        {medication.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.notes}>{medication.notes}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>FDA Information</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : error ? (
          <View>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Try Again"
              onPress={() => fetchMedicationDetails(medication.name)}
              style={styles.retryButton}
            />
          </View>
        ) : details ? (
          <>
            {details.warnings && (
              <View style={styles.fdaSection}>
                <Text style={styles.fdaSectionTitle}>Warnings</Text>
                <Text style={styles.fdaText}>{details.warnings.join(' ')}</Text>
              </View>
            )}
            {details.warnings_and_cautions && (
              <View style={styles.fdaSection}>
                <Text style={styles.fdaSectionTitle}>Warnings and Cautions</Text>
                <Text style={styles.fdaText}>{details.warnings_and_cautions.join(' ')}</Text>
              </View>
            )}
            {details.drug_interactions && (
              <View style={styles.fdaSection}>
                <Text style={styles.fdaSectionTitle}>Drug Interactions</Text>
                <Text style={styles.fdaText}>{details.drug_interactions.join(' ')}</Text>
              </View>
            )}
            {details.adverse_reactions && (
              <View style={styles.fdaSection}>
                <Text style={styles.fdaSectionTitle}>Adverse Reactions</Text>
                <Text style={styles.fdaText}>{details.adverse_reactions.join(' ')}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noDataText}>No FDA data available for this medication.</Text>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit Medication"
          onPress={() => navigation.navigate('AddMedication' as never, { medicationId } as never)}
          style={styles.button}
        />
      </View>
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
  card: {
    marginBottom: 16,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    width: 120,
  },
  value: {
    flex: 1,
    color: '#333',
  },
  notesSection: {
    marginTop: 16,
  },
  notes: {
    color: '#333',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  fdaSection: {
    marginBottom: 16,
  },
  fdaSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  fdaText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
  },
  noDataText: {
    color: '#666',
    fontStyle: 'italic',
  },
  retryButton: {
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  button: {
    marginTop: 8,
  },
});

export default MedicationDetailScreen;