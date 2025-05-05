import axios from 'axios';
import { MedicationInteraction } from '../types';
import { fdaApiService } from './ApiService';

const FDA_API_KEY = process.env.FDA_API_KEY;

interface DrugInteraction {
  description: string;
  severity: string;
}

interface DrugLabelResponse {
  meta: {
    disclaimer: string;
    license: string;
    last_updated: string;
    results: {
      total: number;
      skip: number;
      limit: number;
    };
  };
  results: DrugLabel[];
}

interface DrugLabel {
  product_type: string;
  openfda: {
    brand_name: string[];
    generic_name: string[];
    route: string[];
    product_ndc: string[];
    product_type: string[];
    application_number: string[];
    [key: string]: any;
  };
  warnings?: string[];
  contraindications?: string[];
  drug_interactions?: string[];
  dosage_and_administration?: string[];
  indications_and_usage?: string[];
  [key: string]: any;
}

/**
 * Search for drug information by name
 */
export async function searchDrugByName(name: string): Promise<DrugLabel[]> {
  try {
    const encodedName = encodeURIComponent(name.trim());
    const query = `search=openfda.brand_name:"${encodedName}"+openfda.generic_name:"${encodedName}"&limit=5`;
    
    const response = await fdaApiService.get<DrugLabelResponse>(
      `/drug/label.json?${query}&api_key=${FDA_API_KEY}`
    );
    
    return response.results;
  } catch (error) {
    console.error('Error searching FDA drug database:', error);
    throw new Error('Failed to search for drug information');
  }
}

/**
 * Get detailed information about a specific drug
 */
export async function getDrugDetails(ndc: string): Promise<DrugLabel> {
  try {
    const encodedNdc = encodeURIComponent(ndc.trim());
    const query = `search=openfda.product_ndc:"${encodedNdc}"`;
    
    const response = await fdaApiService.get<DrugLabelResponse>(
      `/drug/label.json?${query}&api_key=${FDA_API_KEY}`
    );
    
    if (response.results && response.results.length > 0) {
      return response.results[0];
    }
    
    throw new Error('Drug not found');
  } catch (error) {
    console.error('Error getting drug details:', error);
    throw new Error('Failed to retrieve drug details');
  }
}

/**
 * Check for potential interactions between drugs
 */
export async function checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
  // In production, this would call a real drug interaction API
  // For now, we'll simulate some interactions
  
  if (drugs.length < 2) {
    return [];
  }

  const interactions: DrugInteraction[] = [];
  
  // Sample interaction data (would come from API in production)
  const knownInteractions: Record<string, Record<string, DrugInteraction>> = {
    'lisinopril': {
      'potassium': {
        description: 'Lisinopril and potassium supplements can increase potassium levels',
        severity: 'moderate'
      },
      'ibuprofen': {
        description: 'NSAIDs like ibuprofen may reduce the blood pressure-lowering effect of lisinopril',
        severity: 'moderate'
      }
    },
    'warfarin': {
      'aspirin': {
        description: 'Increased risk of bleeding when warfarin is used with aspirin',
        severity: 'major'
      },
      'ibuprofen': {
        description: 'Increased risk of bleeding when warfarin is used with NSAIDs',
        severity: 'major'
      }
    },
    'metformin': {
      'furosemide': {
        description: 'May increase the risk of lactic acidosis',
        severity: 'moderate'
      }
    }
  };
  
  // Check each drug pair for interactions
  for (let i = 0; i < drugs.length; i++) {
    const drug1 = drugs[i].toLowerCase();
    
    for (let j = i + 1; j < drugs.length; j++) {
      const drug2 = drugs[j].toLowerCase();
      
      // Check if we know about an interaction between these drugs
      const interaction = 
        (knownInteractions[drug1] && knownInteractions[drug1][drug2]) ||
        (knownInteractions[drug2] && knownInteractions[drug2][drug1]);
      
      if (interaction) {
        interactions.push({
          ...interaction,
          drugs: [drug1, drug2]
        });
      }
    }
  }
  
  return interactions;
}

/**
 * Get general information about a drug's class and usage
 */
export async function getDrugClassInformation(drugName: string): Promise<string> {
  try {
    const encodedName = encodeURIComponent(drugName.trim());
    const query = `search=openfda.brand_name:"${encodedName}"+openfda.generic_name:"${encodedName}"&count=openfda.pharm_class_epc`;
    
    const response = await fdaApiService.get(
      `/drug/label.json?${query}&api_key=${FDA_API_KEY}`
    );
    
    if (response.results && response.results.length > 0) {
      return response.results
        .map((result: any) => result.term)
        .join(', ');
    }
    
    return 'No class information found';
  } catch (error) {
    console.error('Error getting drug class information:', error);
    return 'Information unavailable';
  }
}