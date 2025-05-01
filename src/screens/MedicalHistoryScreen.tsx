import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatDate } from '../utils/helpers';

const MedicalHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient } = useUser();

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

  const getHistoryTypeLabel = (type: string) => {
    switch (type) {
      case 'surgery':
        return 'Surgery';
      case 'illness':
        return 'Illness';
      case 'injury':
        return 'Injury';
      default:
        return 'Other';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical History</Text>
        <Button
          title="Add"
          onPress={() => navigation.navigate('AddMedicalHistory' as never)}
          style={styles.addButton}
        />
      </View>

      {patient.medicalHistory.length > 0 ? (
        <View>
          {patient.medicalHistory.map(history => (
            <Card key={history.id} style={styles.card}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyName}>{history.name}</Text>
                <Text style={styles.historyType}>{getHistoryTypeLabel(history.type)}</Text>
              </View>
              <Text style={styles.historyDate}>Date: {formatDate(history.date)}</Text>
              {history.notes && <Text style={styles.notes}>{history.notes}</Text>}
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't added any medical history items yet</Text>
          <Button
            title="Add Medical History"
            onPress={() => navigation.navigate('AddMedicalHistory' as never)}
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyType: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#1976D2',
    fontWeight: '500',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default MedicalHistoryScreen;