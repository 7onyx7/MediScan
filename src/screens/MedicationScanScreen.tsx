import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useImageCapture } from '../hooks/useImageCapture';
import { useMedicationAnalysis } from '../hooks/useMedicationAnalysis';
import { MedicationAnalysisResult } from '../types';

const MedicationScanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addMedication, addDiagnosis, addSymptom } = useUser();
  const [isTestMode, setIsTestMode] = useState(false);
  const [showOcrText, setShowOcrText] = useState(false);
  
  // Use our custom hooks
  const { 
    image, 
    pickImage, 
    takePhoto, 
    resetImage 
  } = useImageCapture();
  
  const {
    analyzing,
    medicationInfo,
    recognizedText,
    name,
    dosage,
    frequency,
    diagnoses,
    symptoms,
    selectedDiagnoses,
    selectedSymptoms,
    setName,
    setDosage,
    setFrequency,
    analyzeImage,
    toggleDiagnosis,
    toggleSymptom,
  } = useMedicationAnalysis(isTestMode);

  /**
   * Handle image analysis when the analyze button is clicked
   */
  const handleAnalyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please take a photo or select an image first');
      return;
    }
    
    await analyzeImage(image);
  };

  /**
   * Save all medication data to the user's records
   */
  const saveMedicationData = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }

    try {
      // Add medication
      await addMedication({
        name,
        dosage: dosage || undefined,
        frequency: frequency || undefined,
        datePrescribed: new Date().toLocaleDateString(),
        prescribedBy: 'Detected via MediScan',
      });
      
      // Add selected diagnoses
      for (const diagnosis of diagnoses) {
        if (selectedDiagnoses[diagnosis]) {
          await addDiagnosis({
            name: diagnosis,
            diagnosedDate: new Date().toLocaleDateString(),
            diagnosedBy: 'Suggested by MediScan',
          });
        }
      }
      
      // Add selected symptoms
      for (const symptom of symptoms) {
        if (selectedSymptoms[symptom]) {
          await addSymptom({
            name: symptom,
            severity: 5, // Default mid-level severity
            dateRecorded: new Date().toLocaleDateString(),
          });
        }
      }
      
      Alert.alert(
        'Success',
        'Medication information saved successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save medication information');
    }
  };

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

      <Card>
        <Text style={styles.title}>Scan Medication {isTestMode ? "(Test Mode)" : ""}</Text>
        <Text style={styles.subtitle}>Take a photo or upload an image of your medication to automatically extract information</Text>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Take Photo" 
            onPress={takePhoto}
            style={styles.halfButton}
            icon={<Ionicons name="camera" size={20} color="white" style={styles.buttonIcon} />} 
          />
          <Button 
            title="Pick Image" 
            onPress={pickImage}
            style={styles.halfButton}
            icon={<Ionicons name="images" size={20} color="white" style={styles.buttonIcon} />}
          />
        </View>
        
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.medicationImage} />
            {!medicationInfo && !analyzing && (
              <Button 
                title="Analyze Image" 
                onPress={handleAnalyzeImage} 
                style={styles.analyzeButton}
                icon={<Ionicons name="scan" size={20} color="white" style={styles.buttonIcon} />}
              />
            )}
          </View>
        )}
        
        {/* OCR Results Display */}
        {recognizedText && !analyzing && (
          <View style={styles.ocrResultsContainer}>
            <TouchableOpacity 
              style={styles.ocrResultsHeader}
              onPress={() => setShowOcrText(prevState => !prevState)}
            >
              <Text style={styles.ocrResultsTitle}>
                OCR Text Recognition Results
              </Text>
              <Ionicons 
                name={showOcrText ? "chevron-up-outline" : "chevron-down-outline"} 
                size={20} 
                color="#2196F3" 
              />
            </TouchableOpacity>
            
            {showOcrText && (
              <View style={styles.ocrTextContainer}>
                <Text style={styles.ocrText}>{recognizedText}</Text>
              </View>
            )}
          </View>
        )}
        
        {analyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>
              Analyzing medication image{isTestMode ? " (using test data)" : ""}...
            </Text>
          </View>
        )}
        
        {medicationInfo && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Detected Medication Information</Text>
            <Text style={styles.infoSubtitle}>Edit any information that's incorrect</Text>
            
            <Input
              label="Medication Name *"
              value={name}
              onChangeText={setName}
              placeholder="Medication name"
            />
            
            <Input
              label="Dosage"
              value={dosage}
              onChangeText={setDosage}
              placeholder="Dosage (e.g. 10mg)"
            />
            
            <Input
              label="Frequency"
              value={frequency}
              onChangeText={setFrequency}
              placeholder="How often to take (e.g. twice daily)"
            />
            
            {diagnoses.length > 0 && (
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionTitle}>Possible Diagnoses</Text>
                <Text style={styles.selectionSubtitle}>Select conditions this medication might treat</Text>
                
                {diagnoses.map((diagnosis, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.selectionItem,
                      selectedDiagnoses[diagnosis] && styles.selectedItem
                    ]}
                    onPress={() => toggleDiagnosis(diagnosis)}
                  >
                    <Text style={[
                      styles.selectionText,
                      selectedDiagnoses[diagnosis] && styles.selectedText
                    ]}>
                      {diagnosis}
                    </Text>
                    {selectedDiagnoses[diagnosis] ? (
                      <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color="#757575" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {symptoms.length > 0 && (
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionTitle}>Related Symptoms</Text>
                <Text style={styles.selectionSubtitle}>Select symptoms you're experiencing</Text>
                
                {symptoms.map((symptom, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.selectionItem,
                      selectedSymptoms[symptom] && styles.selectedItem
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text style={[
                      styles.selectionText,
                      selectedSymptoms[symptom] && styles.selectedText
                    ]}>
                      {symptom}
                    </Text>
                    {selectedSymptoms[symptom] ? (
                      <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color="#757575" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <Button
              title="Save All Information"
              onPress={saveMedicationData}
              style={styles.saveButton}
            />
          </View>
        )}
      </Card>
      
      {isTestMode && (
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Test Mode: Using demo data instead of Gemini AI analysis. Results are pre-defined for demonstration purposes.
          </Text>
        </View>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Note: This feature uses AI to analyze medication images. Always verify the information before saving.
        </Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  analyzeButton: {
    width: '80%',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  selectionContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  selectionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    fontWeight: '500',
    color: '#0D47A1',
  },
  saveButton: {
    marginTop: 16,
  },
  disclaimer: {
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#5D4037',
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
  ocrResultsContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  ocrResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  ocrResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ocrTextContainer: {
    padding: 16,
  },
  ocrText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default MedicationScanScreen;