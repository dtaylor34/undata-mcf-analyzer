/**
 * UN Data Commons Integration - Example Usage
 * 
 * This file demonstrates how to use the data layer and components
 * in various scenarios
 */

const DataLayer = require('./data-layer');
const config = require('./config.dev'); // or config.prod

// ============================================================================
// EXAMPLE 1: Basic Setup
// ============================================================================

console.log('Example 1: Basic Setup\n');

const dataLayer = new DataLayer(config);

// Initialize the data layer
await dataLayer.initialize();

console.log('Data layer initialized!\n');


// ============================================================================
// EXAMPLE 2: Simple Metadata Query
// ============================================================================

console.log('Example 2: Get Indicator Metadata\n');

const metadata = await dataLayer.getIndicatorMetadata('dc/sdg_1_1_1');

console.log('Indicator:', metadata.name);
console.log('Description:', metadata.description);
console.log('Unit:', metadata.unit);
console.log('SDG Goal:', metadata.sdgGoal);
console.log('\n');


// ============================================================================
// EXAMPLE 3: Query Time Series Data
// ============================================================================

console.log('Example 3: Query Time Series Data\n');

const timeSeriesQuery = {
  indicators: ['dc/sdg_1_1_1'],
  locations: ['country/USA'],
  startYear: 2015,
  endYear: 2023
};

const timeSeriesResult = await dataLayer.query(timeSeriesQuery);

console.log('Found', timeSeriesResult.data.length, 'data points');
console.log('Sample data point:', timeSeriesResult.data[0]);
console.log('Query stats:', timeSeriesResult.stats);
console.log('\n');


// ============================================================================
// EXAMPLE 4: Multi-Indicator Query
// ============================================================================

console.log('Example 4: Multi-Indicator Query\n');

const multiQuery = {
  indicators: [
    'dc/sdg_1_1_1',  // Poverty rate
    'dc/sdg_1_2_1',  // National poverty line
    'dc/sdg_1_3_1'   // Social protection coverage
  ],
  locations: ['country/USA', 'country/GBR', 'country/JPN'],
  startYear: 2020,
  endYear: 2023
};

const multiResult = await dataLayer.query(multiQuery);

console.log('Total data points:', multiResult.data.length);
console.log('By indicator:');
const byIndicator = {};
multiResult.data.forEach(point => {
  if (!byIndicator[point.indicator]) byIndicator[point.indicator] = 0;
  byIndicator[point.indicator]++;
});
console.log(byIndicator);
console.log('\n');


// ============================================================================
// EXAMPLE 5: Query with Disaggregations
// ============================================================================

console.log('Example 5: Query with Disaggregations\n');

const disaggregatedQuery = {
  indicators: ['dc/sdg_5_5_1'],
  locations: ['country/USA'],
  startYear: 2015,
  endYear: 2023,
  disaggregations: ['sex', 'age']
};

const disaggregatedResult = await dataLayer.query(disaggregatedQuery);

console.log('Data points with disaggregations:', disaggregatedResult.data.length);
console.log('Sample disaggregated point:');
const samplePoint = disaggregatedResult.data.find(p => p.disaggregations);
console.log(samplePoint);
console.log('\n');


// ============================================================================
// EXAMPLE 6: Search Indicators
// ============================================================================

console.log('Example 6: Search Indicators\n');

const searchResults = await dataLayer.searchIndicators('poverty');

console.log(`Found ${searchResults.length} indicators matching "poverty":`);
searchResults.slice(0, 5).forEach(indicator => {
  console.log(`  - ${indicator.id}: ${indicator.name}`);
});
console.log('\n');


// ============================================================================
// EXAMPLE 7: Get SDG Goals and Targets
// ============================================================================

console.log('Example 7: Get SDG Goals and Targets\n');

const sdg1Targets = await dataLayer.getSDGTargets(1);

console.log('SDG Goal 1 Targets:');
sdg1Targets.forEach(target => {
  console.log(`  ${target.id}: ${target.name}`);
});
console.log('\n');


// ============================================================================
// EXAMPLE 8: Batch Queries with Promise.all
// ============================================================================

console.log('Example 8: Batch Queries\n');

const batchQueries = [
  { indicators: ['dc/sdg_1_1_1'], locations: ['country/USA'], startYear: 2020, endYear: 2023 },
  { indicators: ['dc/sdg_2_1_1'], locations: ['country/USA'], startYear: 2020, endYear: 2023 },
  { indicators: ['dc/sdg_3_1_1'], locations: ['country/USA'], startYear: 2020, endYear: 2023 }
];

const batchResults = await Promise.all(
  batchQueries.map(query => dataLayer.query(query))
);

console.log('Batch results:');
batchResults.forEach((result, i) => {
  console.log(`  Query ${i + 1}: ${result.data.length} data points`);
});
console.log('\n');


// ============================================================================
// EXAMPLE 9: Error Handling
// ============================================================================

console.log('Example 9: Error Handling\n');

try {
  const invalidQuery = {
    indicators: ['invalid_indicator_id'],
    locations: ['country/USA'],
    startYear: 2020,
    endYear: 2023
  };
  
  const result = await dataLayer.query(invalidQuery);
  
  if (result.errors.length > 0) {
    console.log('Query completed with errors:');
    result.errors.forEach(error => {
      console.log(`  - ${error.indicator}: ${error.message}`);
    });
  }
} catch (error) {
  console.error('Query failed:', error.message);
}
console.log('\n');


// ============================================================================
// EXAMPLE 10: Cache Management
// ============================================================================

console.log('Example 10: Cache Management\n');

// Get cache statistics
const cacheStats = dataLayer.getCacheStats();
console.log('Cache stats:', cacheStats);

// Clear cache for specific indicators
dataLayer.clearCache(['dc/sdg_1_1_1']);
console.log('Cleared cache for dc/sdg_1_1_1');

// Rebuild entire cache
console.log('Rebuilding cache...');
await dataLayer.rebuildCache();
console.log('Cache rebuilt!');
console.log('\n');


// ============================================================================
// EXAMPLE 11: Performance Monitoring
// ============================================================================

console.log('Example 11: Performance Monitoring\n');

const perfStats = dataLayer.getStats();

console.log('Performance Statistics:');
console.log(`  Total Queries: ${perfStats.totalQueries}`);
console.log(`  Cache Hit Rate: ${perfStats.cacheHitRate}%`);
console.log(`  Avg Response Time: ${perfStats.avgResponseTime}ms`);
console.log(`  .STAT Success Rate: ${perfStats.statSuccessRate}%`);
console.log(`  Data Commons Success Rate: ${perfStats.dcSuccessRate}%`);
console.log('\n');


// ============================================================================
// EXAMPLE 12: React Component Integration
// ============================================================================

console.log('Example 12: React Component Integration\n');

// In your React app:
/*
import React from 'react';
import IndicatorPreview from './IndicatorPreview';
import DataLayer from './data-layer';
import config from './config.prod';

const dataLayer = new DataLayer(config);

function App() {
  return (
    <div className="App">
      <h1>UN Data Commons Dashboard</h1>
      
      <IndicatorPreview 
        indicatorId="dc/sdg_1_1_1"
        dataLayer={dataLayer}
        defaultLocation="country/USA"
        defaultStartYear={2015}
        defaultEndYear={2023}
      />
      
      <IndicatorPreview 
        indicatorId="dc/sdg_2_1_1"
        dataLayer={dataLayer}
        defaultLocation="country/USA"
        defaultStartYear={2015}
        defaultEndYear={2023}
      />
    </div>
  );
}

export default App;
*/

console.log('See commented code for React integration example\n');


// ============================================================================
// EXAMPLE 13: Custom Aggregations
// ============================================================================

console.log('Example 13: Custom Aggregations\n');

const aggregatedQuery = {
  indicators: ['dc/sdg_1_1_1'],
  locations: ['country/USA'],
  startYear: 2015,
  endYear: 2023,
  aggregation: 'year' // Group by year
};

const aggregatedResult = await dataLayer.query(aggregatedQuery);

// Calculate year-over-year change
const changes = [];
for (let i = 1; i < aggregatedResult.data.length; i++) {
  const current = aggregatedResult.data[i];
  const previous = aggregatedResult.data[i - 1];
  const change = ((current.value - previous.value) / previous.value) * 100;
  
  changes.push({
    year: current.date.split('-')[0],
    change: change.toFixed(2) + '%'
  });
}

console.log('Year-over-year changes:');
changes.forEach(c => {
  console.log(`  ${c.year}: ${c.change}`);
});
console.log('\n');


// ============================================================================
// EXAMPLE 14: Export Data
// ============================================================================

console.log('Example 14: Export Data\n');

const exportQuery = {
  indicators: ['dc/sdg_1_1_1', 'dc/sdg_1_2_1'],
  locations: ['country/USA'],
  startYear: 2020,
  endYear: 2023
};

const exportResult = await dataLayer.query(exportQuery);

// Export to CSV
const csv = dataLayer.exportToCSV(exportResult.data);
console.log('CSV Preview:');
console.log(csv.substring(0, 200) + '...');
console.log('\n');


// ============================================================================
// EXAMPLE 15: Cleanup
// ============================================================================

console.log('Example 15: Cleanup\n');

// Save cache before exit
await dataLayer.saveCache();
console.log('Cache saved');

// Close connections
await dataLayer.close();
console.log('Data layer closed');
console.log('\n');


// ============================================================================
// EXAMPLE 16: MCF Diff Tool Usage
// ============================================================================

console.log('Example 16: MCF Diff Tool\n');

/*
// Command line usage:
$ node mcf-diff.js ./datacommons/2024_q2 ./datacommons/2024_q3

// Generate HTML report:
$ node mcf-diff.js ./datacommons/2024_q2 ./datacommons/2024_q3 --format=html --output=report.html

// Generate JSON report:
$ node mcf-diff.js ./datacommons/2024_q2 ./datacommons/2024_q3 --format=json --output=report.json

// Programmatic usage:
const MCFComparator = require('./mcf-diff');
const comparator = new MCFComparator();

const results = comparator.compareQuarters(
  './datacommons/2024_q2',
  './datacommons/2024_q3'
);

console.log('Added indicators:', results.added.length);
console.log('Removed indicators:', results.removed.length);
console.log('Modified indicators:', results.modified.length);

// Generate report
const report = comparator.generateReport(results, 'html');
fs.writeFileSync('report.html', report);
*/

console.log('See commented code for MCF diff tool examples\n');


// ============================================================================
// SUMMARY
// ============================================================================

console.log('═══════════════════════════════════════════════════════');
console.log('Examples Complete!');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('This file demonstrated:');
console.log('  ✓ Basic setup and initialization');
console.log('  ✓ Metadata queries');
console.log('  ✓ Time series data retrieval');
console.log('  ✓ Multi-indicator queries');
console.log('  ✓ Disaggregated data');
console.log('  ✓ Search functionality');
console.log('  ✓ SDG targets');
console.log('  ✓ Batch queries');
console.log('  ✓ Error handling');
console.log('  ✓ Cache management');
console.log('  ✓ Performance monitoring');
console.log('  ✓ React integration');
console.log('  ✓ Custom aggregations');
console.log('  ✓ Data export');
console.log('  ✓ MCF diff tool');
console.log('');
console.log('Next steps:');
console.log('  1. Review the configuration files (config.dev.js, config.prod.js)');
console.log('  2. Customize the data layer for your needs');
console.log('  3. Integrate React components into your UI');
console.log('  4. Set up monitoring and logging');
console.log('  5. Deploy to production');
console.log('');
console.log('Documentation: See README.md and INTEGRATION_GUIDE.md');
console.log('═══════════════════════════════════════════════════════');
