import { useState } from 'react';
import { Alert } from 'react-native';
import { recognizeText, extractMedicationInfo } from '../services/OcrService';
import { analyzeMedicationImage } from '../services/GeminiService';

interface MedicationInfo {
  name: string;
  dosage: string;
  frequency: string;
  possibleDiagnoses: string[];
  possibleSymptoms: string[];
}

interface AnalysisResult {
  recognizedText: string;
  name: string;
  dosage: string;
  frequency: string;
  diagnoses: string[];
  symptoms: string[];
  selectedDiagnoses: Record<string, boolean>;
  selectedSymptoms: Record<string, boolean>;
}

/**
 * Custom hook for medication image analysis including OCR and AI processing
 */
export function useMedicationAnalysis(isTestMode: boolean = false) {
  const [analyzing, setAnalyzing] = useState(false);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  
  // States for proposed diagnoses and symptoms
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Record<string, boolean>>({});
  
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>({});

  /**
   * Perform OCR on the provided image URI
   */
  const performOcrOnImage = async (imageUri: string): Promise<string> => {
    setIsOcrProcessing(true);
    try {
      // Perform OCR using our service
      const text = await recognizeText(imageUri, isTestMode);
      setRecognizedText(text);
      
      // Extract structured data
      const { name: ocrName, dosage: ocrDosage, frequency: ocrFreq } =
        extractMedicationInfo(text);
      
      // Update form state
      setName(ocrName);
      setDosage(ocrDosage);
      setFrequency(ocrFreq);
  
      return text;
    } catch (err) {
      console.error('OCR Error:', err);
      Alert.alert('OCR Error', 'Failed to recognize text');
      return '';
    } finally {
      setIsOcrProcessing(false);
    }
  };

  /**
   * Analyze the image to extract medication data
   * Includes OCR text recognition and AI-based analysis
   */
  const analyzeImage = async (imageUri: string | null): Promise<AnalysisResult | null> => {
    if (!imageUri) return null;
    setAnalyzing(true);
    
    try {
      // Reset state
      resetAnalysisState();
      
      // Step 1: OCR processing
      await performOcrOnImage(imageUri);

      // Step 2: AI analysis for additional metadata
      const result = await analyzeMedicationImage(imageUri);
      
      // Update state with the results
      setMedicationInfo(result);
      setDiagnoses(result.possibleDiagnoses);
      setSymptoms(result.possibleSymptoms);

      // Initialize selection maps
      const diagMap: Record<string, boolean> = {};
      result.possibleDiagnoses.forEach(d => { diagMap[d] = true; });
      setSelectedDiagnoses(diagMap);
      
      const sympMap: Record<string, boolean> = {};
      result.possibleSymptoms.forEach(s => { sympMap[s] = true; });
      setSelectedSymptoms(sympMap);

      // Return all the analyzed data
      return {
        recognizedText,
        name,
        dosage,
        frequency,
        diagnoses: result.possibleDiagnoses,
        symptoms: result.possibleSymptoms,
        selectedDiagnoses: diagMap,
        selectedSymptoms: sympMap,
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Error', 
        'Failed to analyze the medication image. Please try again or enter information manually.'
      );
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Toggle selection of a diagnosis
   */
  const toggleDiagnosis = (diagnosis: string) => {
    setSelectedDiagnoses(prev => ({
      ...prev,
      [diagnosis]: !prev[diagnosis]
    }));
  };
  
  /**
   * Toggle selection of a symptom
   */
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => ({
      ...prev,
      [symptom]: !prev[symptom]
    }));
  };

  /**
   * Reset all analysis state to default values
   */
  const resetAnalysisState = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setDiagnoses([]);
    setSymptoms([]);
    setSelectedDiagnoses({});
    setSelectedSymptoms({});
    setRecognizedText('');
    setMedicationInfo(null);
  };

  return {
    // State
    analyzing,
    medicationInfo,
    recognizedText,
    isOcrProcessing,
    name,
    dosage,
    frequency,
    diagnoses,
    selectedDiagnoses,
    symptoms,
    selectedSymptoms,
    
    // Setters
    setName,
    setDosage,
    setFrequency,
    
    // Actions
    analyzeImage,
    performOcrOnImage,
    toggleDiagnosis,
    toggleSymptom,
    resetAnalysisState,
  };
}