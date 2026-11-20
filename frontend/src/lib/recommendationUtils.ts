export const isRecommendationRequest = (message: string): boolean => {
  const keywords = [
    'recommandation',
    'suggestion',
    'tour',
    'voyage',
    'destination',
    'itinéraire',
    'expérience',
    'activité',
    'visite'
  ];

  // Convert message to lowercase and remove punctuation
  const processedMessage = message.toLowerCase().replace(/[.,!?]/g, '');

  // Check if any keyword is present
  return keywords.some(keyword => processedMessage.includes(keyword));
};

export const extractPreferencesFromMessage = (message: string): {
  languages?: string[];
  travelPurpose?: string[];
  travelCompanions?: string[];
  budget?: string[];
} => {
  const preferences = {};
  
  // Extract languages
  const languageKeywords = ['français', 'anglais', 'espagnol', 'italien', 'allemand'];
  preferences.languages = languageKeywords
    .filter(lang => message.toLowerCase().includes(lang))
    .map(lang => lang);

  // Extract travel purpose
  const purposeKeywords = {
    culture: ['culture', 'histoire', 'art', 'patrimoine'],
    aventure: ['aventure', 'sport', 'nature', 'randonnée'],
    gastronomie: ['gastronomie', 'cuisine', 'vin', 'gastronomique'],
    nature: ['nature', 'paysage', 'parc', 'forêt'],
    histoire: ['histoire', 'archéologie', 'monument']
  };
  
  preferences.travelPurpose = [];
  Object.entries(purposeKeywords).forEach(([key, words]) => {
    if (words.some(word => message.toLowerCase().includes(word))) {
      preferences.travelPurpose.push(key);
    }
  });

  // Extract travel companions
  const companionKeywords = {
    family: ['famille', 'enfants', 'parents'],
    couple: ['couple', 'amour', 'romantique'],
    friends: ['amis', 'groupe', 'compagnons'],
    solo: ['seul', 'solo', 'individuel']
  };
  
  preferences.travelCompanions = [];
  Object.entries(companionKeywords).forEach(([key, words]) => {
    if (words.some(word => message.toLowerCase().includes(word))) {
      preferences.travelCompanions.push(key);
    }
  });

  // Extract budget
  const budgetKeywords = {
    low: ['petit', 'budget', 'économique', 'bon marché'],
    medium: ['moyen', 'standard', 'raisonnable'],
    high: ['luxueux', 'haut de gamme', 'prestigieux']
  };
  
  preferences.budget = [];
  Object.entries(budgetKeywords).forEach(([key, words]) => {
    if (words.some(word => message.toLowerCase().includes(word))) {
      preferences.budget.push(key);
    }
  });

  return preferences;
};
