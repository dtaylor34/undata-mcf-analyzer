/**
 * UN Data Themes & SDG Taxonomy Registry
 * Master reference for content governance and alignment
 */

export const UNDATA_THEMES = {
  'DSS': {
    id: 'DSS',
    name: 'Demography and Social Statistics',
    description: 'Population, health, education, gender',
    color: '#1976d2',
    subthemes: [
      {
        id: 'DSS-POP',
        name: 'Population & Migration',
        keywords: ['population', 'migration', 'demographics', 'census', 'fertility', 'birth', 'death']
      },
      {
        id: 'DSS-HEA',
        name: 'Health',
        keywords: ['health', 'mortality', 'disease', 'healthcare', 'nutrition', 'vaccination', 'hospital', 'medical']
      },
      {
        id: 'DSS-EDU',
        name: 'Education',
        keywords: ['education', 'literacy', 'school', 'enrollment', 'teacher', 'student', 'learning']
      },
      {
        id: 'DSS-GEN',
        name: 'Gender',
        keywords: ['gender', 'women', 'equality', 'empowerment', 'female', 'male', 'sex']
      }
    ]
  },
  'ECS': {
    id: 'ECS',
    name: 'Economic Statistics',
    description: 'Trade, finance, employment, GDP',
    color: '#388e3c',
    subthemes: [
      {
        id: 'ECS-GDP',
        name: 'National Accounts',
        keywords: ['gdp', 'national accounts', 'income', 'expenditure', 'gni', 'economic growth']
      },
      {
        id: 'ECS-EMP',
        name: 'Employment & Labour',
        keywords: ['employment', 'unemployment', 'labour', 'wages', 'work', 'job', 'worker']
      },
      {
        id: 'ECS-TRD',
        name: 'Trade & Commerce',
        keywords: ['trade', 'export', 'import', 'commerce', 'goods', 'services']
      },
      {
        id: 'ECS-AGR',
        name: 'Agriculture',
        keywords: ['agriculture', 'farming', 'crop', 'livestock', 'food production', 'agricultural']
      }
    ]
  },
  'ENV': {
    id: 'ENV',
    name: 'Environment & Climate',
    description: 'Climate change, pollution, biodiversity',
    color: '#4caf50',
    subthemes: [
      {
        id: 'ENV-CLI',
        name: 'Climate',
        keywords: ['climate', 'temperature', 'emissions', 'carbon', 'greenhouse', 'warming']
      },
      {
        id: 'ENV-POL',
        name: 'Pollution',
        keywords: ['pollution', 'air quality', 'water quality', 'waste', 'contamination']
      },
      {
        id: 'ENV-BIO',
        name: 'Biodiversity',
        keywords: ['biodiversity', 'species', 'ecosystem', 'forest', 'wildlife', 'conservation']
      }
    ]
  }
};

export const SDG_GOALS = {
  'SDG01': {
    id: 'SDG01',
    number: 1,
    name: 'No Poverty',
    description: 'End poverty in all its forms everywhere',
    color: '#e5243b',
    targets: [
      { id: 'SDG01.1', name: 'Eradicate extreme poverty' },
      { id: 'SDG01.2', name: 'Reduce poverty by half' },
      { id: 'SDG01.3', name: 'Social protection systems' }
    ],
    keywords: ['poverty', 'income', 'poor', 'multidimensional poverty', 'poverty line']
  },
  'SDG02': {
    id: 'SDG02',
    number: 2,
    name: 'Zero Hunger',
    description: 'End hunger, achieve food security',
    color: '#dda63a',
    targets: [
      { id: 'SDG02.1', name: 'End hunger' },
      { id: 'SDG02.2', name: 'End malnutrition' }
    ],
    keywords: ['hunger', 'food', 'nutrition', 'malnutrition', 'stunting', 'food security']
  },
  'SDG03': {
    id: 'SDG03',
    number: 3,
    name: 'Good Health and Well-being',
    description: 'Ensure healthy lives and promote well-being',
    color: '#4c9f38',
    targets: [
      { id: 'SDG03.1', name: 'Reduce maternal mortality' },
      { id: 'SDG03.2', name: 'End preventable deaths of children' },
      { id: 'SDG03.3', name: 'End epidemics' }
    ],
    keywords: ['health', 'mortality', 'disease', 'healthcare', 'vaccination', 'medical', 'maternal', 'child health']
  },
  'SDG04': {
    id: 'SDG04',
    number: 4,
    name: 'Quality Education',
    description: 'Ensure inclusive and equitable quality education',
    color: '#c5192d',
    keywords: ['education', 'learning', 'school', 'literacy', 'enrollment', 'teacher']
  },
  'SDG05': {
    id: 'SDG05',
    number: 5,
    name: 'Gender Equality',
    description: 'Achieve gender equality and empower all women and girls',
    color: '#ff3a21',
    keywords: ['gender', 'women', 'girls', 'equality', 'empowerment', 'discrimination']
  },
  'SDG08': {
    id: 'SDG08',
    number: 8,
    name: 'Decent Work and Economic Growth',
    description: 'Promote sustained, inclusive economic growth, employment',
    color: '#a21942',
    keywords: ['employment', 'work', 'labour', 'economic growth', 'job', 'decent work']
  },
  'SDG13': {
    id: 'SDG13',
    number: 13,
    name: 'Climate Action',
    description: 'Take urgent action to combat climate change',
    color: '#3f7e44',
    keywords: ['climate', 'climate change', 'emissions', 'global warming', 'carbon']
  }
};

export const AGENCY_THEME_MAPPING = {
  'who': {
    primaryTheme: 'DSS',
    primarySubtheme: 'DSS-HEA',
    secondaryThemes: ['ENV-POL'],
    primarySDGs: ['SDG03']
  },
  'unicef': {
    primaryTheme: 'DSS',
    primarySubtheme: 'DSS-HEA',
    secondaryThemes: ['DSS-EDU', 'DSS-GEN'],
    primarySDGs: ['SDG02', 'SDG03', 'SDG04', 'SDG05']
  },
  'ilo': {
    primaryTheme: 'ECS',
    primarySubtheme: 'ECS-EMP',
    secondaryThemes: ['DSS-GEN'],
    primarySDGs: ['SDG08']
  },
  'sdg': {
    primaryTheme: 'DSS',
    primarySubtheme: null,
    secondaryThemes: ['ECS', 'ENV'],
    primarySDGs: ['SDG01', 'SDG02', 'SDG03', 'SDG04', 'SDG05', 'SDG08', 'SDG13']
  },
  'fao': {
    primaryTheme: 'ECS',
    primarySubtheme: 'ECS-AGR',
    secondaryThemes: ['ENV', 'DSS-HEA'],
    primarySDGs: ['SDG02']
  }
};

