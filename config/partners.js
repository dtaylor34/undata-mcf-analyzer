/**
 * Data Partners Registry
 * Core, partner, and community data providers
 */

export const DATA_PARTNERS = {
  'who': {
    id: 'who',
    name: 'World Health Organization',
    logo: '/logos/who.png',
    status: 'active',
    tier: 'core',
    onboardedDate: '2023-01-15',
    contact: {
      name: 'WHO Data Team',
      email: 'data@who.int',
      website: 'https://www.who.int/data'
    },
    permissions: {
      canPublish: true,
      canShare: true,
      datasets: 'all'
    },
    branding: {
      primaryColor: '#0093D5',
      accentColor: '#00B4D8'
    },
    datasetCount: 522
  },
  'unicef': {
    id: 'unicef',
    name: 'UNICEF',
    logo: '/logos/unicef.png',
    status: 'active',
    tier: 'core',
    onboardedDate: '2023-02-01',
    contact: {
      name: 'UNICEF Data & Analytics',
      email: 'data@unicef.org',
      website: 'https://data.unicef.org'
    },
    permissions: {
      canPublish: true,
      canShare: true,
      datasets: 'all'
    },
    branding: {
      primaryColor: '#1CABE2',
      accentColor: '#00A3DD'
    },
    datasetCount: 189
  },
  'ilo': {
    id: 'ilo',
    name: 'International Labour Organization',
    logo: '/logos/ilo.png',
    status: 'active',
    tier: 'core',
    onboardedDate: '2023-03-01',
    contact: {
      name: 'ILO Statistics',
      email: 'statistics@ilo.org',
      website: 'https://ilostat.ilo.org'
    },
    permissions: {
      canPublish: true,
      canShare: true,
      datasets: 'all'
    },
    branding: {
      primaryColor: '#003DA5',
      accentColor: '#0066CC'
    },
    datasetCount: 312
  },
  'fao': {
    id: 'fao',
    name: 'Food and Agriculture Organization',
    logo: '/logos/fao.png',
    status: 'onboarding',
    tier: 'partner',
    onboardedDate: '2025-01-15',
    contact: {
      name: 'FAO Statistics Division',
      email: 'statistics@fao.org',
      website: 'https://www.fao.org/faostat'
    },
    permissions: {
      canPublish: false, // Disabled until onboarding complete
      canShare: false,
      datasets: ['fao_food_security', 'fao_agriculture_prod']
    },
    branding: {
      primaryColor: '#0A72A5',
      accentColor: '#1E88A8'
    },
    onboarding: {
      status: 'in_progress',
      startedDate: '2025-01-15',
      checklist: {
        'data_review': { completed: true, completedDate: '2025-01-20' },
        'theme_mapping': { completed: false, completedDate: null },
        'technical_setup': { completed: true, completedDate: '2025-01-22' },
        'branding_setup': { completed: true, completedDate: '2025-01-18' },
        'legal_agreement': { completed: false, completedDate: null },
        'user_training': { completed: false, completedDate: null }
      }
    },
    datasetCount: 45
  }
};

export const ONBOARDING_CHECKLIST = {
  'data_review': {
    name: 'Initial Data Review',
    description: 'Review sample data for quality and completeness',
    required: true,
    estimatedTime: '2-3 days'
  },
  'theme_mapping': {
    name: 'Theme & SDG Mapping',
    description: 'Verify all indicators are mapped to themes and SDGs',
    required: true,
    estimatedTime: '3-5 days'
  },
  'technical_setup': {
    name: 'Technical Integration',
    description: 'API credentials, data format validation, ETL configuration',
    required: true,
    estimatedTime: '1-2 weeks'
  },
  'branding_setup': {
    name: 'Partner Branding',
    description: 'Logo, colors, attribution guidelines',
    required: false,
    estimatedTime: '1-2 days'
  },
  'legal_agreement': {
    name: 'Data Sharing Agreement',
    description: 'Signed MOU or data sharing agreement',
    required: true,
    estimatedTime: '1-2 weeks'
  },
  'user_training': {
    name: 'Partner Training',
    description: 'Training on MCF Analyzer and data submission process',
    required: true,
    estimatedTime: '1 day'
  }
};

export function getPartner(partnerId) {
  return DATA_PARTNERS[partnerId] || null;
}

export function getAllPartners() {
  return Object.values(DATA_PARTNERS);
}

export function getActivePartners() {
  return Object.values(DATA_PARTNERS).filter(p => p.status === 'active');
}

export function getOnboardingPartners() {
  return Object.values(DATA_PARTNERS).filter(p => p.status === 'onboarding');
}

