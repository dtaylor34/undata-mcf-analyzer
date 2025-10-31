/**
 * UN Data Commons Integration - Test Suite
 * 
 * Run with: npm test
 * Watch mode: npm run test:watch
 * Coverage: npm test -- --coverage
 */

const DataLayer = require('./data-layer');
const MCFComparator = require('./mcf-diff');
const fs = require('fs');
const path = require('path');

// Mock configuration for testing
const testConfig = {
  cache: {
    enabled: true,
    path: './test-cache.json',
    maxAge: 60000
  },
  stat: {
    baseURL: 'https://data.un.org/api/v1',
    timeout: 5000
  },
  dataCommons: {
    baseURL: 'http://localhost:8080/api',
    apiKey: null
  }
};

describe('DataLayer', () => {
  let dataLayer;

  beforeEach(() => {
    dataLayer = new DataLayer(testConfig);
  });

  afterEach(() => {
    // Clean up test cache
    if (fs.existsSync('./test-cache.json')) {
      fs.unlinkSync('./test-cache.json');
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(dataLayer.initialize()).resolves.not.toThrow();
    });

    test('should load cache if exists', async () => {
      // Create mock cache
      fs.writeFileSync('./test-cache.json', JSON.stringify({
        version: '1.0',
        indicators: {
          'dc/sdg_1_1_1': {
            id: 'dc/sdg_1_1_1',
            name: 'Test Indicator'
          }
        }
      }));

      await dataLayer.initialize();
      const metadata = await dataLayer.getIndicatorMetadata('dc/sdg_1_1_1');
      
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe('Test Indicator');
    });
  });

  describe('Cache Management', () => {
    test('should save cache to disk', async () => {
      await dataLayer.initialize();
      await dataLayer.saveCache();
      
      expect(fs.existsSync('./test-cache.json')).toBe(true);
    });

    test('should clear cache', async () => {
      await dataLayer.initialize();
      dataLayer.clearCache();
      
      const stats = dataLayer.getCacheStats();
      expect(stats.size).toBe(0);
    });

    test('should return cache statistics', () => {
      const stats = dataLayer.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });

  describe('Metadata Queries', () => {
    test('should retrieve indicator metadata', async () => {
      // Mock the cache with test data
      dataLayer.cache.indicators = new Map([
        ['dc/sdg_1_1_1', {
          id: 'dc/sdg_1_1_1',
          name: 'Poverty Rate',
          description: 'Test description',
          unit: '%'
        }]
      ]);

      const metadata = await dataLayer.getIndicatorMetadata('dc/sdg_1_1_1');
      
      expect(metadata).toBeDefined();
      expect(metadata.id).toBe('dc/sdg_1_1_1');
      expect(metadata.name).toBe('Poverty Rate');
    });

    test('should handle non-existent indicator', async () => {
      await expect(
        dataLayer.getIndicatorMetadata('invalid_id')
      ).rejects.toThrow();
    });
  });

  describe('Data Queries', () => {
    test('should query time series data', async () => {
      const query = {
        indicators: ['dc/sdg_1_1_1'],
        locations: ['country/USA'],
        startYear: 2020,
        endYear: 2023
      };

      const result = await dataLayer.query(query);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('stats');
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('should handle multi-indicator queries', async () => {
      const query = {
        indicators: ['dc/sdg_1_1_1', 'dc/sdg_2_1_1'],
        locations: ['country/USA'],
        startYear: 2020,
        endYear: 2023
      };

      const result = await dataLayer.query(query);
      
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should validate query parameters', async () => {
      const invalidQuery = {
        indicators: [], // Empty indicators
        locations: ['country/USA'],
        startYear: 2020,
        endYear: 2023
      };

      await expect(dataLayer.query(invalidQuery)).rejects.toThrow();
    });

    test('should handle date range validation', async () => {
      const invalidQuery = {
        indicators: ['dc/sdg_1_1_1'],
        locations: ['country/USA'],
        startYear: 2023,
        endYear: 2020  // End before start
      };

      await expect(dataLayer.query(invalidQuery)).rejects.toThrow();
    });
  });

  describe('Search Functionality', () => {
    test('should search indicators by keyword', async () => {
      // Mock indicators in cache
      dataLayer.cache.indicators = new Map([
        ['dc/sdg_1_1_1', { id: 'dc/sdg_1_1_1', name: 'Poverty Rate' }],
        ['dc/sdg_2_1_1', { id: 'dc/sdg_2_1_1', name: 'Malnutrition Rate' }]
      ]);

      const results = await dataLayer.searchIndicators('poverty');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Poverty');
    });

    test('should return empty array for no matches', async () => {
      dataLayer.cache.indicators = new Map();
      
      const results = await dataLayer.searchIndicators('nonexistent');
      
      expect(results).toEqual([]);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track query performance', async () => {
      const query = {
        indicators: ['dc/sdg_1_1_1'],
        locations: ['country/USA'],
        startYear: 2020,
        endYear: 2023
      };

      await dataLayer.query(query);
      
      const stats = dataLayer.getStats();
      
      expect(stats.totalQueries).toBeGreaterThan(0);
      expect(stats.avgResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Export Functionality', () => {
    test('should export data to CSV', () => {
      const mockData = [
        {
          indicator: 'dc/sdg_1_1_1',
          location: 'country/USA',
          date: '2020',
          value: 10.5
        },
        {
          indicator: 'dc/sdg_1_1_1',
          location: 'country/USA',
          date: '2021',
          value: 10.2
        }
      ];

      const csv = dataLayer.exportToCSV(mockData);
      
      expect(csv).toContain('indicator,location,date,value');
      expect(csv).toContain('dc/sdg_1_1_1');
      expect(csv).toContain('country/USA');
    });
  });
});

describe('MCFComparator', () => {
  let comparator;
  let testDir;

  beforeEach(() => {
    comparator = new MCFComparator();
    testDir = './test-mcf-data';
    
    // Create test directories
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('MCF Parsing', () => {
    test('should parse MCF file correctly', () => {
      const mcfContent = `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "Poverty Rate"
measuredProperty: povertyRate
statType: measurementResult
`;

      const testFile = path.join(testDir, 'test.mcf');
      fs.writeFileSync(testFile, mcfContent);

      const indicators = comparator.parseMCFFile(testFile);
      
      expect(indicators.size).toBe(1);
      expect(indicators.has('dc/sdg_1_1_1')).toBe(true);
      expect(indicators.get('dc/sdg_1_1_1').name).toBe('Poverty Rate');
    });

    test('should handle empty MCF file', () => {
      const testFile = path.join(testDir, 'empty.mcf');
      fs.writeFileSync(testFile, '');

      const indicators = comparator.parseMCFFile(testFile);
      
      expect(indicators.size).toBe(0);
    });
  });

  describe('Quarter Comparison', () => {
    test('should detect added indicators', () => {
      // Create Q1 with one indicator
      const q1Dir = path.join(testDir, 'q1');
      fs.mkdirSync(q1Dir, { recursive: true });
      fs.writeFileSync(path.join(q1Dir, 'indicators.mcf'), `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "Indicator 1"
`);

      // Create Q2 with two indicators
      const q2Dir = path.join(testDir, 'q2');
      fs.mkdirSync(q2Dir, { recursive: true });
      fs.writeFileSync(path.join(q2Dir, 'indicators.mcf'), `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "Indicator 1"

Node: dc/sdg_2_1_1
typeOf: StatisticalVariable
name: "Indicator 2"
`);

      const results = comparator.compareQuarters(q1Dir, q2Dir);
      
      expect(results.added.length).toBe(1);
      expect(results.added[0].id).toBe('dc/sdg_2_1_1');
    });

    test('should detect removed indicators', () => {
      // Create Q1 with two indicators
      const q1Dir = path.join(testDir, 'q1');
      fs.mkdirSync(q1Dir, { recursive: true });
      fs.writeFileSync(path.join(q1Dir, 'indicators.mcf'), `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "Indicator 1"

Node: dc/sdg_2_1_1
typeOf: StatisticalVariable
name: "Indicator 2"
`);

      // Create Q2 with one indicator
      const q2Dir = path.join(testDir, 'q2');
      fs.mkdirSync(q2Dir, { recursive: true });
      fs.writeFileSync(path.join(q2Dir, 'indicators.mcf'), `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "Indicator 1"
`);

      const results = comparator.compareQuarters(q1Dir, q2Dir);
      
      expect(results.removed.length).toBe(1);
      expect(results.removed[0].id).toBe('dc/sdg_2_1_1');
    });

    test('should detect modified indicators', () => {
      // Create Q1
      const q1Dir = path.join(testDir, 'q1');
      fs.mkdirSync(q1Dir, { recursive: true });
      fs.writeFileSync(path.join(q1Dir, 'indicators.mcf'), `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "Old Name"
`);

      // Create Q2 with modified name
      const q2Dir = path.join(testDir, 'q2');
      fs.mkdirSync(q2Dir, { recursive: true });
      fs.writeFileSync(path.join(q2Dir, 'indicators.mcf'), `
Node: dc/sdg_1_1_1
typeOf: StatisticalVariable
name: "New Name"
`);

      const results = comparator.compareQuarters(q1Dir, q2Dir);
      
      expect(results.modified.length).toBe(1);
      expect(results.modified[0].changes.length).toBeGreaterThan(0);
    });
  });

  describe('Report Generation', () => {
    test('should generate text report', () => {
      const mockResults = {
        summary: { q1: 'Q1', q2: 'Q2', q1Count: 10, q2Count: 12 },
        added: [{ id: 'dc/new', name: 'New Indicator', type: 'Variable', file: 'new.mcf' }],
        removed: [],
        modified: [],
        unchanged: ['dc/old1', 'dc/old2']
      };

      const report = comparator.generateReport(mockResults, 'text');
      
      expect(report).toContain('Q1 → Q2');
      expect(report).toContain('ADDED INDICATORS');
      expect(report).toContain('dc/new');
    });

    test('should generate JSON report', () => {
      const mockResults = {
        summary: { q1: 'Q1', q2: 'Q2', q1Count: 10, q2Count: 12 },
        added: [],
        removed: [],
        modified: [],
        unchanged: []
      };

      const report = comparator.generateReport(mockResults, 'json');
      const parsed = JSON.parse(report);
      
      expect(parsed).toHaveProperty('summary');
      expect(parsed).toHaveProperty('added');
    });

    test('should generate HTML report', () => {
      const mockResults = {
        summary: { q1: 'Q1', q2: 'Q2', q1Count: 10, q2Count: 12 },
        added: [{ id: 'dc/new', name: 'New Indicator', type: 'Variable', file: 'new.mcf' }],
        removed: [],
        modified: [],
        unchanged: []
      };

      const report = comparator.generateReport(mockResults, 'html');
      
      expect(report).toContain('<!DOCTYPE html>');
      expect(report).toContain('MCF Comparison');
      expect(report).toContain('dc/new');
    });
  });
});

describe('Integration Tests', () => {
  test('should complete full workflow', async () => {
    const dataLayer = new DataLayer(testConfig);
    
    // Initialize
    await dataLayer.initialize();
    
    // Query data
    const result = await dataLayer.query({
      indicators: ['dc/sdg_1_1_1'],
      locations: ['country/USA'],
      startYear: 2020,
      endYear: 2023
    });
    
    // Export
    const csv = dataLayer.exportToCSV(result.data);
    
    // Verify
    expect(csv).toBeTruthy();
    expect(result.data).toBeTruthy();
    
    // Cleanup
    await dataLayer.close();
  });
});

// Run tests
if (require.main === module) {
  console.log('Running tests...\n');
  
  // You would normally use Jest to run these tests
  // This is just a demonstration
  console.log('Use "npm test" to run the full test suite');
}
