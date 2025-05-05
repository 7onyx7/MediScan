import { Medication, Symptom, Diagnosis } from '../types';
// Import API key from env using react-native-dotenv
import { GEMINI_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';
import { MedicationAnalysisResult } from '../types';
import { geminiApiService } from './ApiService';
import { getGeminiApiKey } from './ConfigService';

interface GeminiAnalysisResult {
  summary: string;
  potentialIssues: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  recommendations: string[];
  explanations: string[];
}

interface GeminiImageRequest {
  contents: {
    parts: {
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }[];
  }[];
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback: any;
}

// Get API key from environment variable
const getApiKey = () => {
  return GEMINI_API_KEY;
};

export const analyzeHealthData = async (
  medications: Medication[],
  symptoms: Symptom[],
  diagnoses: Diagnosis[]
): Promise<GeminiAnalysisResult> => {
  try {
    // Using a reliable model that's confirmed to work
    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';
    
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('No Gemini API key found in environment variables');
      return getPlaceholderAnalysis();
    }
    
    // Format the patient data for the prompt
    const medicationsText = medications.map(med => 
      `- ${med.name} (${med.dosage}, ${med.frequency})`
    ).join('\n');
    
    const symptomsText = symptoms.map(sym => 
      `- ${sym.name} (Severity: ${sym.severity}/10, Date: ${sym.dateRecorded})`
    ).join('\n');
    
    const diagnosesText = diagnoses.map(diag => 
      `- ${diag.name} (Diagnosed on: ${diag.diagnosedDate})`
    ).join('\n');
    
    // Create the prompt for Gemini
    const prompt = `
      As a medical analysis AI, please analyze the following patient data and identify potential conflicts, 
      interactions, or concerns between medications, symptoms, and diagnoses.
      
      MEDICATIONS:
      ${medicationsText || "None"}
      
      SYMPTOMS:
      ${symptomsText || "None"}
      
      DIAGNOSES:
      ${diagnosesText || "None"}
      
      Please provide:
      1. A brief overall summary written in simple, non-technical language that a layperson could understand
      2. A list of potential issues with title, detailed but simple explanation, and severity (low, medium, high)
      3. Plain-language recommendations for the patient
      4. Simple explanations about why certain combinations might be problematic
      
      Format your response as a structured JSON object with the following structure:
      {
        "summary": "Brief overall assessment in very simple terms",
        "potentialIssues": [
          {
            "title": "Issue title in plain language",
            "description": "Detailed but simple explanation avoiding medical jargon",
            "severity": "low/medium/high"
          }
        ],
        "recommendations": ["Recommendation 1 in simple terms", "Recommendation 2 in simple terms"],
        "explanations": ["Plain-language explanation 1", "Plain-language explanation 2"]
      }
      
      Use everyday language throughout. Imagine you're explaining to someone with no medical background.
      Provide only the JSON object without any additional text.
    `;
    
    console.log('Sending request to Gemini API...');
    
    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        })
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        console.error('Gemini API HTTP error:', response.status);
        return getPlaceholderAnalysis();
      }
      
      const data = await response.json();
      console.log('Received response from Gemini API');
      
      // Check for valid response structure
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid Gemini response structure');
        return getPlaceholderAnalysis();
      }
      
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response with better error handling
      try {
        // Clean the text response to ensure it's valid JSON
        const jsonText = resultText.replace(/```json|```|[\r\n]/g, '').trim();
        const analysisResult = JSON.parse(jsonText) as GeminiAnalysisResult;
        
        // Ensure all required fields are present
        return {
          summary: analysisResult.summary || "Analysis completed. See details below.",
          potentialIssues: analysisResult.potentialIssues || [],
          recommendations: analysisResult.recommendations || [],
          explanations: analysisResult.explanations || []
        };
      } catch (e) {
        console.error('Failed to parse Gemini JSON response');
        return getPlaceholderAnalysis();
      }
    } catch (networkError) {
      console.error('Network error when contacting Gemini API:', networkError);
      return getPlaceholderAnalysis();
    }
  } catch (error) {
    console.error('Error in analyzeHealthData:', error);
    return getPlaceholderAnalysis();
  }
};

// Fallback in case API fails or for development/testing
export const getPlaceholderAnalysis = (): GeminiAnalysisResult => {
  return {
    summary: "This is a sample analysis of your health information. In a real analysis, this would summarize potential medication conflicts and health concerns based on your medications, symptoms, and diagnoses.",
    potentialIssues: [
      {
        title: "Sample Medication Interaction",
        description: "This is an example of how a medication interaction would be displayed. In a real analysis, this would describe how two specific medications might interact and what symptoms you might experience.",
        severity: "medium"
      },
      {
        title: "Sample Symptom Concern",
        description: "This example shows how the analysis would highlight when a symptom might be related to a medication you're taking or might suggest a health condition that requires attention.",
        severity: "low"
      }
    ],
    recommendations: [
      "This sample recommendation demonstrates how the analysis would suggest talking to your doctor about potential medication adjustments.",
      "Another sample recommendation might suggest monitoring certain symptoms or tracking when they occur in relation to medication timing."
    ],
    explanations: [
      "This sample explanation shows how the analysis would explain medical concepts in simple terms.",
      "When the actual API connection works, you'll see personalized explanations based on your specific health information."
    ]
  };
};

/**
 * Analyze a medication image using Google's Gemini API
 * @param imageUri Local file URI of the medication image
 * @param isTestMode If true, return mock data instead of calling API
 */
export async function analyzeMedicationImage(
  imageUri: string, 
  isTestMode = false
): Promise<MedicationAnalysisResult> {
  try {
    // For test mode, return mock data
    if (isTestMode) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return getMockAnalysisResult();
    }
    
    // Convert image to base64
    const b64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Get API key securely
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not available');
    }

    // Create request payload - using the new model gemini-1.5-flash
    const payload: GeminiImageRequest = {
      contents: [
        {
          parts: [
            {
              text: "Analyze this medication image and extract the following information: name of medication, dosage, frequency, possible medical conditions (diagnoses) it treats, and possible symptoms it addresses. Return the result as a JSON object with the following structure: {\"name\": \"medication name\", \"dosage\": \"dosage amount\", \"frequency\": \"how often to take\", \"possibleDiagnoses\": [\"diagnosis1\", \"diagnosis2\"], \"possibleSymptoms\": [\"symptom1\", \"symptom2\"]}."
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: b64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    };

    // Call the Gemini API through our secure client - updated model endpoint to gemini-1.5-flash
    const response = await geminiApiService.post<GeminiResponse>(
      `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      payload
    );

    // Extract and parse the response
    const textResponse = response.candidates[0]?.content?.parts[0]?.text;
    if (!textResponse) {
      throw new Error('No response from AI service');
    }

    try {
      // Find the JSON part in the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not find JSON response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (!parsedResponse.name) {
        throw new Error('Invalid response format');
      }
      
      return {
        name: parsedResponse.name || '',
        dosage: parsedResponse.dosage || '',
        frequency: parsedResponse.frequency || '',
        possibleDiagnoses: Array.isArray(parsedResponse.possibleDiagnoses) 
          ? parsedResponse.possibleDiagnoses 
          : [],
        possibleSymptoms: Array.isArray(parsedResponse.possibleSymptoms) 
          ? parsedResponse.possibleSymptoms 
          : []
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Fallback to basic extraction
      return extractBasicInfo(textResponse);
    }
  } catch (error) {
    console.error('Error analyzing medication image:', error);
    
    // If anything fails, return a default result
    return {
      name: '',
      dosage: '',
      frequency: '',
      possibleDiagnoses: [],
      possibleSymptoms: []
    };
  }
}

/**
 * Extract basic information from text response if JSON parsing fails
 */
function extractBasicInfo(text: string): MedicationAnalysisResult {
  // Basic extraction logic using regex
  const nameMatch = text.match(/name[:\s]+([^\n,]+)/i);
  const dosageMatch = text.match(/dosage[:\s]+([^\n,]+)/i);
  const frequencyMatch = text.match(/frequency[:\s]+([^\n,]+)/i);
  
  // Extract lists from text
  const diagnosesMatch = text.match(/diagnoses[:\s]+([\s\S]+?)(?=symptoms|$)/i);
  const symptomsMatch = text.match(/symptoms[:\s]+([\s\S]+?)(?=$)/i);
  
  // Parse diagnoses and symptoms from possible list formats
  const diagnoses = diagnosesMatch 
    ? extractListItems(diagnosesMatch[1]) 
    : [];
  
  const symptoms = symptomsMatch 
    ? extractListItems(symptomsMatch[1]) 
    : [];
  
  return {
    name: nameMatch?.[1]?.trim() || '',
    dosage: dosageMatch?.[1]?.trim() || '',
    frequency: frequencyMatch?.[1]?.trim() || '',
    possibleDiagnoses: diagnoses,
    possibleSymptoms: symptoms
  };
}

/**
 * Extract list items from a text block
 */
function extractListItems(text: string): string[] {
  // Try to extract items from various list formats like:
  // - item1
  // - item2
  // * item1
  // * item2
  // 1. item1
  // 2. item2
  
  const items: string[] = [];
  
  // Remove quotes if present
  const cleanText = text.replace(/["']/g, '');
  
  // Try to find items by various list markers
  const matches = cleanText.match(/[•\-\*\d]\.?\s+([^\n,]+)/g);
  
  if (matches?.length) {
    matches.forEach(match => {
      const itemText = match.replace(/^[•\-\*\d]\.?\s+/, '').trim();
      if (itemText) {
        items.push(itemText);
      }
    });
  } else {
    // Fallback to comma-separated list
    const commaSeparated = cleanText.split(',');
    commaSeparated.forEach(item => {
      const trimmed = item.trim();
      if (trimmed && trimmed.length < 50) { // Limit length for reasonable items
        items.push(trimmed);
      }
    });
  }
  
  return items.filter(Boolean).slice(0, 5); // Limit to 5 items
}

/**
 * Get mock analysis result for testing
 */
function getMockAnalysisResult(): MedicationAnalysisResult {
  return {
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    possibleDiagnoses: [
      "Hypertension", 
      "Heart Failure", 
      "Post Myocardial Infarction", 
      "Diabetic Nephropathy"
    ],
    possibleSymptoms: [
      "High Blood Pressure",
      "Shortness of Breath",
      "Swelling in Extremities",
      "Fatigue"
    ]
  };
}

/**
 * Get medication information from a generic text query
 */
export async function getMedicationInfo(query: string): Promise<string> {
  try {
    // Get API key securely
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not available');
    }

    // Create a payload for text-only query
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Provide information about ${query}. Include details about what it treats, common dosages, side effects, and any important warnings. Format the response with clear headings and bullet points where appropriate.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    };

    // Call the Gemini API - updated model to gemini-1.5-flash
    const response = await geminiApiService.post<GeminiResponse>(
      `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      payload
    );

    return response.candidates[0]?.content?.parts[0]?.text || "No information available";
  } catch (error) {
    console.error('Error fetching medication info:', error);
    return "Failed to retrieve information. Please try again later.";
  }
}
