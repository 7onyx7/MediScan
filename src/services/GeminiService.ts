import { Medication, Symptom, Diagnosis } from '../types';
// Import API key from env using react-native-dotenv
import { GEMINI_API_KEY } from '@env';

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
