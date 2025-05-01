import axios from 'axios';
import { MedicationInteraction } from '../types';
import { FDA_API_KEY } from '@env';

const BASE_URL = 'https://api.fda.gov/drug';
const API_KEY = FDA_API_KEY || '';

interface DrugLabelResponse {
  results: Array<{
    openfda: {
      brand_name?: string[];
      generic_name?: string[];
      substance_name?: string[];
      manufacturer_name?: string[];
      rxcui?: string[];
      product_ndc?: string[];
    };
    warnings?: string[];
    warnings_and_cautions?: string[];
    drug_interactions?: string[];
    contraindications?: string[];
    adverse_reactions?: string[];
    dosage_and_administration?: string[];
  }>;
}

interface DrugInteractionResponse {
  results: Array<{
    drug_interactions: string[];
  }>;
}

export const searchMedication = async (query: string) => {
  try {
    const response = await axios.get<DrugLabelResponse>(
      `${BASE_URL}/label.json?search=${encodeURIComponent(query)}&limit=5&api_key=${API_KEY}`
    );
    return response.data.results;
  } catch (error) {
    console.error('Error searching medication:', error);
    throw new Error('Failed to search medication');
  }
};

export const getMedicationDetails = async (brandName: string) => {
  try {
    const response = await axios.get<DrugLabelResponse>(
      `${BASE_URL}/label.json?search=openfda.brand_name:"${encodeURIComponent(brandName)}"&limit=1&api_key=${API_KEY}`
    );
    return response.data.results[0];
  } catch (error) {
    console.error('Error getting medication details:', error);
    throw new Error('Failed to get medication details');
  }
};

export const checkMedicationInteractions = async (medications: string[]): Promise<MedicationInteraction[]> => {
  const interactions: MedicationInteraction[] = [];
  
  try {
    // For each pair of medications, check for interactions
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i];
        const drug2 = medications[j];
        
        // Skip empty medication names
        if (!drug1 || !drug2 || drug1.trim() === '' || drug2.trim() === '') {
          continue;
        }
        
        try {
          // Try multiple search strategies to find interactions
          let response = null;
          let hasResults = false;
          let interactionSource = '';
          
          // Strategy 1: Search for drug2 in drug1's interactions using brand name
          try {
            response = await axios.get<DrugInteractionResponse>(
              `${BASE_URL}/label.json?search=drug_interactions:"${encodeURIComponent(drug2)}"AND+openfda.brand_name:"${encodeURIComponent(drug1)}"&limit=1&api_key=${API_KEY}`
            );
            hasResults = !!(response.data.results && response.data.results.length > 0 && response.data.results[0].drug_interactions);
            if (hasResults) interactionSource = `${drug1} label mentions ${drug2}`;
          } catch (err) {
            console.log(`Strategy 1 failed for ${drug1} and ${drug2}`);
          }
          
          // Strategy 2: Search for drug1 in drug2's interactions using brand name
          if (!hasResults) {
            try {
              response = await axios.get<DrugInteractionResponse>(
                `${BASE_URL}/label.json?search=drug_interactions:"${encodeURIComponent(drug1)}"AND+openfda.brand_name:"${encodeURIComponent(drug2)}"&limit=1&api_key=${API_KEY}`
              );
              hasResults = !!(response.data.results && response.data.results.length > 0 && response.data.results[0].drug_interactions);
              if (hasResults) interactionSource = `${drug2} label mentions ${drug1}`;
            } catch (err) {
              console.log(`Strategy 2 failed for ${drug1} and ${drug2}`);
            }
          }
          
          // Strategy 3: Search using generic names
          if (!hasResults) {
            try {
              response = await axios.get<DrugInteractionResponse>(
                `${BASE_URL}/label.json?search=drug_interactions:"${encodeURIComponent(drug2)}"AND+openfda.generic_name:"${encodeURIComponent(drug1)}"&limit=1&api_key=${API_KEY}`
              );
              hasResults = !!(response.data.results && response.data.results.length > 0 && response.data.results[0].drug_interactions);
              if (hasResults) interactionSource = `${drug1} generic label mentions ${drug2}`;
            } catch (err) {
              console.log(`Strategy 3 failed for ${drug1} and ${drug2}`);
            }
          }
          
          // Strategy 4: Try the reverse with generic names
          if (!hasResults) {
            try {
              response = await axios.get<DrugInteractionResponse>(
                `${BASE_URL}/label.json?search=drug_interactions:"${encodeURIComponent(drug1)}"AND+openfda.generic_name:"${encodeURIComponent(drug2)}"&limit=1&api_key=${API_KEY}`
              );
              hasResults = !!(response.data.results && response.data.results.length > 0 && response.data.results[0].drug_interactions);
              if (hasResults) interactionSource = `${drug2} generic label mentions ${drug1}`;
            } catch (err) {
              console.log(`Strategy 4 failed for ${drug1} and ${drug2}`);
            }
          }
          
          // Strategy 5: Broader search in drug interactions field
          if (!hasResults) {
            try {
              response = await axios.get<DrugInteractionResponse>(
                `${BASE_URL}/label.json?search=drug_interactions:"${encodeURIComponent(drug1.toLowerCase())}"&limit=5&api_key=${API_KEY}`
              );
              
              // Check if drug2 is mentioned in any of the interactions
              if (response.data.results && response.data.results.length > 0) {
                for (const result of response.data.results) {
                  if (result.drug_interactions) {
                    const interactionText = result.drug_interactions.join(' ').toLowerCase();
                    if (interactionText.includes(drug2.toLowerCase())) {
                      hasResults = true;
                      interactionSource = 'Broad search';
                      break;
                    }
                  }
                }
              }
            } catch (err) {
              console.log(`Strategy 5 failed for ${drug1} and ${drug2}`);
            }
          }
          
          // If we found results in any strategy
          if (hasResults && response && response.data.results && response.data.results.length > 0 && response.data.results[0].drug_interactions) {
            // Extract the full interaction text from FDA data
            const relevantTexts = [];
            
            for (const result of response.data.results) {
              if (result.drug_interactions) {
                for (const interactionText of result.drug_interactions) {
                  const lower = interactionText.toLowerCase();
                  
                  // Only include text that mentions both medications or is clearly relevant
                  if ((lower.includes(drug1.toLowerCase()) && lower.includes(drug2.toLowerCase())) || 
                      (lower.includes(drug1.toLowerCase()) && drug1.toLowerCase() !== drug2.toLowerCase()) || 
                      (lower.includes(drug2.toLowerCase()) && drug1.toLowerCase() !== drug2.toLowerCase())) {
                    relevantTexts.push(interactionText);
                  }
                }
              }
            }
            
            // Get the most relevant interaction text
            const description = relevantTexts.length > 0 
              ? relevantTexts.join(' ') 
              : response.data.results[0].drug_interactions.join(' ');
            
            // Determine severity based on text analysis
            const severity = determineSeverity(description);
            
            // Extract relevant sentences directly from FDA text
            const { simplifiedExplanation, possibleEffects, recommendations } = extractDirectFromFdaText(
              drug1, 
              drug2, 
              severity, 
              description
            );
            
            interactions.push({
              drug1,
              drug2,
              severity,
              description,
              simplifiedExplanation,
              possibleEffects,
              recommendations,
              source: `Data from FDA API: ${interactionSource}`
            });
          }
        } catch (innerError) {
          console.error(`Error checking interaction between ${drug1} and ${drug2}:`, innerError);
          // Continue checking other combinations rather than failing completely
        }
      }
    }
    
    return interactions;
  } catch (error) {
    console.error('Error checking medication interactions:', error);
    throw new Error('Failed to check medication interactions. Please ensure you have a valid internet connection and try again.');
  }
};

// Helper function to determine severity based on the interaction description
const determineSeverity = (description: string): 'minor' | 'moderate' | 'major' => {
  const lowercaseDesc = description.toLowerCase();
  
  if (
    lowercaseDesc.includes('contraindicated') ||
    lowercaseDesc.includes('avoid') ||
    lowercaseDesc.includes('not recommended') ||
    lowercaseDesc.includes('severe') ||
    lowercaseDesc.includes('serious') ||
    lowercaseDesc.includes('life-threatening') ||
    lowercaseDesc.includes('fatal') ||
    lowercaseDesc.includes('death') ||
    lowercaseDesc.includes('warning')
  ) {
    return 'major';
  } else if (
    lowercaseDesc.includes('caution') ||
    lowercaseDesc.includes('monitor') ||
    lowercaseDesc.includes('adjust') ||
    lowercaseDesc.includes('modify') ||
    lowercaseDesc.includes('increase') ||
    lowercaseDesc.includes('decrease') ||
    lowercaseDesc.includes('may affect') ||
    lowercaseDesc.includes('potential')
  ) {
    return 'moderate';
  } else {
    return 'minor';
  }
};

// Extract information directly from FDA text without keyword matching
const extractDirectFromFdaText = (
  drug1: string, 
  drug2: string, 
  severity: 'minor' | 'moderate' | 'major', 
  description: string
): { 
  simplifiedExplanation: string; 
  possibleEffects: string[]; 
  recommendations: string[] 
} => {
  // Extract sentences from the FDA description
  const sentences = extractSentences(description, 10);
  
  // Find relevant sentences specifically mentioning the drugs or their effects
  const relevantSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return lowerSentence.includes(drug1.toLowerCase()) || 
           lowerSentence.includes(drug2.toLowerCase()) ||
           lowerSentence.includes('interact') ||
           lowerSentence.includes('effect') ||
           lowerSentence.includes('risk') ||
           lowerSentence.includes('may') ||
           lowerSentence.includes('can') ||
           lowerSentence.includes('should');
  });
  
  // Extract sentences that describe effects
  const effectSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return (lowerSentence.includes('cause') || 
            lowerSentence.includes('result') || 
            lowerSentence.includes('lead to') || 
            lowerSentence.includes('effect') || 
            lowerSentence.includes('increas') ||
            lowerSentence.includes('risk') ||
            lowerSentence.includes('toxicity')) && 
            !lowerSentence.includes('should') &&
            !lowerSentence.includes('monitor') &&
            !lowerSentence.includes('avoid');
  });
  
  // Extract sentences that contain recommendations
  const recommendationSentences = extractRecommendations(description);
  
  // Create a simple explanation based on the most relevant sentence
  const mostRelevantSentence = relevantSentences.length > 0 ? relevantSentences[0] : '';
  
  let simplifiedExplanation = '';
  if (mostRelevantSentence) {
    simplifiedExplanation = mostRelevantSentence;
  } else {
    // Fallback only if no relevant sentences were found
    if (severity === 'major') {
      simplifiedExplanation = `The FDA drug information indicates a serious interaction between ${drug1} and ${drug2}.`;
    } else if (severity === 'moderate') {
      simplifiedExplanation = `The FDA drug information indicates that ${drug1} and ${drug2} may interact.`;
    } else {
      simplifiedExplanation = `The FDA drug information mentions potential minor interactions between ${drug1} and ${drug2}.`;
    }
  }
  
  // Extract possible effects
  const possibleEffects = effectSentences.length > 0 
    ? effectSentences.slice(0, 4) 
    : relevantSentences.slice(0, Math.min(4, relevantSentences.length));
  
  // Use extracted recommendations or generate based on severity
  const recommendations = recommendationSentences.length > 0 
    ? recommendationSentences 
    : getDefaultRecommendations(severity);
  
  return { 
    simplifiedExplanation, 
    possibleEffects: possibleEffects.length > 0 ? possibleEffects : [`See full FDA text for specific details about ${drug1} and ${drug2} interaction.`], 
    recommendations 
  };
};

// Helper to extract sentences from the description
const extractSentences = (text: string, maxSentences: number): string[] => {
  if (!text || text.trim() === '') return [];
  
  // Simple sentence splitter (not perfect but good enough for this purpose)
  const sentences = text.split(/[.!?][\s\n]+/).filter(s => {
    const trimmed = s.trim();
    return trimmed.length > 10 && trimmed.split(' ').length > 3;
  });
  
  // Return up to maxSentences number of sentences, slightly cleaned up
  return sentences
    .slice(0, maxSentences)
    .map(s => s.trim())
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .map(s => s.endsWith('.') ? s : s + '.');
};

// Helper to extract recommendation sentences
const extractRecommendations = (text: string): string[] => {
  const recommendationKeywords = ['recommend', 'should', 'must', 'advised', 'advised to', 'monitor', 'avoid'];
  
  // Simple sentence splitter
  const sentences = text.split(/[.!?][\s\n]+/).filter(s => s.trim().length > 0);
  
  // Find sentences that contain recommendation keywords
  return sentences
    .filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return recommendationKeywords.some(keyword => lowerSentence.includes(keyword));
    })
    .map(s => s.trim())
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .map(s => s.endsWith('.') ? s : s + '.')
    .slice(0, 4); // Limit to 4 recommendations
};

// Default recommendations based on severity - used only if no recommendations found in FDA text
const getDefaultRecommendations = (severity: 'minor' | 'moderate' | 'major'): string[] => {
  switch (severity) {
    case 'major':
      return [
        'Consult your healthcare provider immediately about this interaction.',
        'Do not start, stop, or change the dosage of any medicines without doctor approval.',
        'Report any unusual symptoms to your doctor right away.',
        'Make sure all healthcare providers know all medications you take.'
      ];
    case 'moderate':
      return [
        'Discuss this interaction with your healthcare provider.',
        'Your doctor may need to monitor you more closely if these medications are taken together.',
        'Do not change your medication regimen without consulting your doctor.',
        'Be aware of potential side effects that may indicate an interaction.'
      ];
    case 'minor':
      return [
        'Be aware of this potential interaction.',
        'Monitor for any unusual side effects when taking these medications together.',
        'Follow your prescribed medication schedule as directed by your doctor.',
        'Mention this combination to your healthcare provider at your next visit.'
      ];
  }
};