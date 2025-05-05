import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { checkMedicationInteractions } from '../services/FdaService';
import { analyzeHealthData, getPlaceholderAnalysis } from '../services/GeminiService';
import { MedicationInteraction } from '../types';

const AnalysisScreen: React.FC = () => {
  const navigation = useNavigation();
  const { patient } = useUser();
  const [interactions, setInteractions] = useState<MedicationInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<{ [key: string]: boolean }>({});
  
  // New state for Gemini analysis
  const [geminiResults, setGeminiResults] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Test mode toggle
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // No automatic analysis on load - wait for user to request it
  }, [patient]);

  const checkInteractions = async () => {
    if (!patient || patient.medications.length < 2) return;

    try {
      setLoading(true);
      setError(null);
      
      // Just use medication names for API call
      const medicationNames = patient.medications.map(med => med.name);
      
      // If in test mode, use placeholder data
      if (isTestMode) {
        setTimeout(() => {
          // Mock data for test mode
          const placeholderData = getPlaceholderAnalysis();
          setGeminiResults(placeholderData);
          setLoading(false);
        }, 1000);
        return;
      }
      
      // Use actual API in real mode
      try {
        const results = await checkMedicationInteractions(medicationNames);
        setInteractions(results);
        setLoading(false);
      } catch (err) {
        console.error('Error checking interactions:', err);
        setError('Failed to check medication interactions. Try switching to Test Mode for demo data.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error initiating interaction check:', err);
      setError('Failed to check medication interactions.');
      setLoading(false);
    }
  };
  
  // Analysis function that handles real or test mode
  const runGeminiAnalysis = async () => {
    if (!patient) return;
    
    try {
      setGeminiLoading(true);
      setGeminiError(null);
      
      if (isTestMode) {
        // Use placeholder data in test mode
        setTimeout(() => {
          const placeholderData = getPlaceholderAnalysis();
          setGeminiResults(placeholderData);
          setGeminiLoading(false);
        }, 1000);
      } else {
        // Use real Gemini API in real mode
        try {
          const results = await analyzeHealthData(
            patient.medications,
            patient.symptoms,
            patient.diagnoses
          );
          setGeminiResults(results);
        } catch (err) {
          console.error('Error running Gemini analysis:', err);
          setGeminiError('Failed to analyze health data. Try switching to Test Mode for demo data.');
        } finally {
          setGeminiLoading(false);
        }
      }
    } catch (err) {
      console.error('Error in analysis:', err);
      setGeminiError('Failed to run analysis');
      setGeminiLoading(false);
    }
  };

  const toggleTechnicalDetails = (index: number) => {
    setExpandedDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
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
      {/* Mode Toggle */}
      <View style={styles.modeToggleContainer}>
        <Text style={styles.modeToggleLabel}>Test Mode</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isTestMode ? "#2196F3" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsTestMode(previousState => !previousState)}
          value={isTestMode}
        />
        <Text style={styles.modeDescription}>
          {isTestMode ? "Using demo data" : "Using Gemini AI"}
        </Text>
      </View>

      {/* Comprehensive Health Analysis Card */}
      <Card style={styles.card}>
        <Text style={styles.title}>
          Health Analysis {isTestMode ? "(Test Mode)" : ""}
        </Text>
        <Text style={styles.subtitle}>
          Click the button below to analyze your health information
        </Text>

        {geminiLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Analyzing your health data...</Text>
          </View>
        ) : geminiError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{geminiError}</Text>
            <Button
              title={isTestMode ? "Try Test Analysis" : "Try Analysis"}
              onPress={runGeminiAnalysis}
              style={styles.retryButton}
            />
          </View>
        ) : geminiResults ? (
          // ...existing gemini results display code...
          <View style={styles.resultsContainer}>
            {/* Overall Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{geminiResults.summary}</Text>
            </View>

            {/* Potential Issues */}
            {geminiResults.potentialIssues && geminiResults.potentialIssues.length > 0 ? (
              <View style={styles.issuesSection}>
                <Text style={styles.sectionTitle}>Potential Health Concerns</Text>
                {geminiResults.potentialIssues.map((issue: any, index: number) => (
                  <Card key={index} style={{
                    ...styles.issueCard,
                    ...(issue.severity === 'low' ? styles.lowSeverityCard :
                      issue.severity === 'medium' ? styles.mediumSeverityCard :
                      styles.highSeverityCard)
                  }}>
                    <View style={styles.issueHeader}>
                      <Text style={styles.issueTitle}>{issue.title}</Text>
                      <View style={{
                        ...styles.severityBadge,
                        ...(issue.severity === 'low' ? styles.minorBadge :
                          issue.severity === 'medium' ? styles.moderateBadge :
                          styles.majorBadge)
                      }}>
                        <Text style={styles.severityText}>
                          {issue.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.issueDescription}>{issue.description}</Text>
                  </Card>
                ))}
              </View>
            ) : (
              <View style={styles.noIssuesContainer}>
                <Text style={styles.noIssuesText}>No potential health concerns were identified from your current information.</Text>
              </View>
            )}

            {/* Recommendations */}
            {geminiResults.recommendations && geminiResults.recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {geminiResults.recommendations.map((recommendation: string, index: number) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Explanations */}
            {geminiResults.explanations && geminiResults.explanations.length > 0 && (
              <View style={styles.explanationsSection}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                {geminiResults.explanations.map((explanation: string, index: number) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.explanationText}>{explanation}</Text>
                  </View>
                ))}
              </View>
            )}

            <Button
              title="Refresh Health Analysis"
              onPress={runGeminiAnalysis}
              style={styles.refreshButton}
            />
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.message}>
              Click below to analyze your health information
              {isTestMode ? " (using test data)" : ""}
            </Text>
            <Button
              title="Run Health Analysis"
              onPress={runGeminiAnalysis}
              style={styles.button}
            />
          </View>
        )}
      </Card>

      {/* FDA Medication Interactions Card */}
      <Card>
        <Text style={styles.title}>
          Medication Interactions {isTestMode ? "(Test Mode)" : ""}
        </Text>
        <Text style={styles.subtitle}>
          Click below to see potential interactions between medications
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Analyzing your medications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title={isTestMode ? "Try Test Analysis" : "Try Analysis"}
              onPress={checkInteractions}
              style={styles.retryButton}
            />
          </View>
        ) : interactions.length > 0 ? (
          // ...existing interactions display code...
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              Potential Interactions Found
            </Text>

            {interactions.map((interaction, index) => (
              <Card key={index} style={styles.interactionCard}>
                <View style={styles.interactionHeader}>
                  <Text style={styles.interactionTitle}>
                    {interaction.drug1} + {interaction.drug2}
                  </Text>
                  <View style={{
                    ...styles.severityBadge,
                    ...(interaction.severity === 'minor' ? styles.minorBadge :
                      interaction.severity === 'moderate' ? styles.moderateBadge :
                      styles.majorBadge)
                  }}>
                    <Text style={styles.severityText}>
                      {interaction.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Simple explanation for laypeople */}
                <Text style={styles.simplifiedExplanation}>
                  {interaction.simplifiedExplanation}
                </Text>

                {/* Added FDA source information */}
                {interaction.source && (
                  <Text style={styles.sourceText}>{interaction.source}</Text>
                )}

                {/* Possible effects section */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionSubtitle}>FDA Information on Potential Effects:</Text>
                  {interaction.possibleEffects.map((effect, idx) => (
                    <View key={idx} style={styles.bulletPoint}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{effect}</Text>
                    </View>
                  ))}
                </View>

                {/* Recommendations section */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionSubtitle}>FDA Recommendations:</Text>
                  {interaction.recommendations.map((recommendation, idx) => (
                    <View key={idx} style={styles.bulletPoint}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>

                {/* Technical details that toggle on/off */}
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => toggleTechnicalDetails(index)}
                >
                  <Text style={styles.toggleButtonText}>
                    {expandedDetails[index] ? 'Hide Technical Details' : 'Show Technical Details'}
                  </Text>
                </TouchableOpacity>

                {expandedDetails[index] && (
                  <View style={styles.technicalDetails}>
                    <Text style={styles.technicalTitle}>Technical Description:</Text>
                    <Text style={styles.technicalText}>{interaction.description}</Text>
                  </View>
                )}
              </Card>
            ))}

            <View style={styles.medicationsSection}>
              <Text style={styles.sectionTitle}>Your Medications</Text>
              {patient.medications.map((medication, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>{medication.dosage || 'No dosage specified'}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Refresh FDA Analysis"
              onPress={checkInteractions}
              style={styles.refreshButton}
            />
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.message}>
              Click below to check medication interactions
              {isTestMode ? " (using test data)" : ""}
            </Text>
            <Button
              title="Check Interactions"
              onPress={checkInteractions}
              style={styles.button}
            />
          </View>
        )}
      </Card>

      {isTestMode && (
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Test Mode Disclaimer: This analysis shows sample data for demonstration purposes only and may not reflect actual health information.
          </Text>
        </View>
      )}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHelpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  partialResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  resultsContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
    color: '#333',
  },
  interactionCard: {
    marginBottom: 16,
  },
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  interactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#757575',
  },
  minorBadge: {
    backgroundColor: '#FFC107',
  },
  moderateBadge: {
    backgroundColor: '#FF9800',
  },
  majorBadge: {
    backgroundColor: '#F44336',
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  simplifiedExplanation: {
    fontSize: 16,
    marginVertical: 12,
    color: '#333',
  },
  sectionContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 8,
    color: '#555',
    marginTop: -2,
  },
  bulletText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  toggleButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#555',
  },
  noInteractionsText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 24,
  },
  medicationsSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    marginTop: 16,
  },
  disclaimer: {
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  technicalDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#555',
  },
  technicalText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  sourceText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 12,
  },
  
  // New styles for Gemini analysis
  card: {
    marginBottom: 20,
  },
  summaryContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#E1F5FE',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  issuesSection: {
    marginBottom: 20,
  },
  issueCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  lowSeverityCard: {
    borderLeftColor: '#FFC107',
  },
  mediumSeverityCard: {
    borderLeftColor: '#FF9800',
  },
  highSeverityCard: {
    borderLeftColor: '#F44336',
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  issueDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    lineHeight: 20,
  },
  explanationsSection: {
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    lineHeight: 20,
  },
  noIssuesContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noIssuesText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  modeToggleLabel: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  modeDescription: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // ...existing styles...
});

export default AnalysisScreen;