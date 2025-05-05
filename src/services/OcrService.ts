import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { getGoogleVisionApiKey } from './ConfigService';

// Mock results for testing
const mockOcrResult = `
LISINOPRIL 10 MG TABLET
Rx# 123456789
QTY: 30
Take 1 tablet by mouth once daily for high blood pressure.
Refills: 3
Dr. Smith
Exp: 05/01/2025
`;

/**
 * Extracts text from an image using Google Cloud Vision API
 * @param imageUri URI of the image to process
 * @param useTestMode If true, returns mock data instead of calling API
 * @returns Recognized text from the image
 */
export async function recognizeText(imageUri: string, useTestMode = false): Promise<string> {
  // Use mock data if in test mode
  if (useTestMode) {
    return new Promise(resolve => {
      // Simulate API delay
      setTimeout(() => resolve(mockOcrResult), 800);
    });
  }

  try {
    // Check for internet connectivity
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new Error('Internet connection required for OCR processing');
    }

    // Get API key securely
    const apiKey = await getGoogleVisionApiKey();
    if (!apiKey) {
      throw new Error('Google Vision API key not available');
    }

    // Prepare the image as base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare the API request
    const visionApiEndpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    // Send the request to Google Cloud Vision API
    const response = await fetch(visionApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Vision API error:', errorData);
      throw new Error(`OCR processing failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text from the response
    const textAnnotations = data.responses[0]?.textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      return '';
    }
    
    // The first annotation contains the complete text
    return textAnnotations[0].description || '';
  } catch (error) {
    console.error('OCR recognition error:', error);
    
    if (error.message.includes('Internet connection')) {
      throw new Error('Internet connection required for OCR processing. Please connect to the internet and try again.');
    }
    
    throw new Error('Failed to process image text. Please try again or enter information manually.');
  }
}

/**
 * Extract structured medication information from OCR text
 * @param text Text extracted from OCR
 * @returns Structured medication information
 */
export function extractMedicationInfo(text: string): { 
  name: string; 
  dosage: string; 
  frequency: string;
} {
  if (!text) {
    return { name: '', dosage: '', frequency: '' };
  }

  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Extract medication name (usually in the first line)
  let name = '';
  let dosage = '';
  let frequency = '';
  
  // Look for medication name (typically first line with capital letters and numbers+mg)
  const namePattern = /([A-Z][A-Za-z\s]+)(?:\s+(\d+\s*(?:MG|MCG|G|ML))[^\d]*)?/i;
  const nameMatch = text.match(namePattern);
  if (nameMatch) {
    name = nameMatch[1]?.trim() || '';
    dosage = nameMatch[2]?.trim() || '';
  }
  
  // Look for frequency in instructions (typically contains "take" or "daily")
  const freqPattern = /take\s+(.+?)(?:for|\.|\n|$)/i;
  const freqMatch = text.match(freqPattern);
  if (freqMatch) {
    frequency = freqMatch[1]?.trim() || '';
  }
  
  // Additional patterns can be added here for different label formats
  
  return {
    name,
    dosage,
    frequency
  };
}