#!/usr/bin/env node

/**
 * MCF Quarter Comparison Tool
 * 
 * Compares MCF files between quarters to identify:
 * - New indicators added
 * - Removed indicators
 * - Modified indicators
 * - Data value changes
 * 
 * Usage:
 *   node mcf-diff.js 2024_q2 2024_q3
 *   node mcf-diff.js 2024_q2 2024_q3 --output=report.json
 *   node mcf-diff.js 2024_q2 2024_q3 --format=html
 */

const fs = require('fs');
const path = require('path');

class MCFComparator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.includeValues = options.includeValues || false;
  }

  /**
   * Parse MCF file into structured data
   */
  parseMCFFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const indicators = new Map();
    
    let currentNode = null;
    let currentIndicator = null;

    content.split('\n').forEach((line, lineNum) => {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) return;

      // New node definition
      if (line.startsWith('Node:')) {
        const nodeId = line.substring(5).trim();
        currentNode = nodeId;
        
        if (nodeId.startsWith('dc/')) {
          currentIndicator = {
            id: nodeId,
            properties: {},
            observations: [],
            line: lineNum + 1
          };
          indicators.set(nodeId, currentIndicator);
        }
      }
      // Property definition
      else if (line.includes(':') && currentIndicator) {
        const colonIndex = line.indexOf(':');
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        if (key === 'typeOf') {
          currentIndicator.type = value;
        } else if (key === 'name') {
          currentIndicator.name = value.replace(/^"(.*)"$/, '$1');
        } else if (key === 'observationAbout') {
          currentIndicator.properties.location = value;
        } else if (key === 'observationDate') {
          currentIndicator.properties.date = value;
        } else if (key === 'value') {
          currentIndicator.properties.value = value;
        } else {
          currentIndicator.properties[key] = value;
        }
      }
    });

    return indicators;
  }

  /**
   * Compare two quarters
   */
  compareQuarters(q1Path, q2Path) {
    console.log(`Comparing ${path.basename(q1Path)} → ${path.basename(q2Path)}\n`);

    const q1Indicators = this.parseQuarterFolder(q1Path);
    const q2Indicators = this.parseQuarterFolder(q2Path);

    const results = {
      summary: {
        q1: path.basename(q1Path),
        q2: path.basename(q2Path),
        q1Count: q1Indicators.size,
        q2Count: q2Indicators.size
      },
      added: [],
      removed: [],
      modified: [],
      unchanged: []
    };

    // Find added indicators
    for (const [id, indicator] of q2Indicators) {
      if (!q1Indicators.has(id)) {
        results.added.push({
          id,
          name: indicator.name,
          type: indicator.type,
          file: indicator.file
        });
      }
    }

    // Find removed indicators
    for (const [id, indicator] of q1Indicators) {
      if (!q2Indicators.has(id)) {
        results.removed.push({
          id,
          name: indicator.name,
          type: indicator.type,
          file: indicator.file
        });
      }
    }

    // Find modified indicators
    for (const [id, q2Indicator] of q2Indicators) {
      if (q1Indicators.has(id)) {
        const q1Indicator = q1Indicators.get(id);
        const changes = this.compareIndicators(q1Indicator, q2Indicator);
        
        if (changes.length > 0) {
          results.modified.push({
            id,
            name: q2Indicator.name,
            changes
          });
        } else {
          results.unchanged.push(id);
        }
      }
    }

    return results;
  }

  /**
   * Parse all MCF files in a quarter folder
   */
  parseQuarterFolder(folderPath) {
    const indicators = new Map();
    
    const mcfFiles = this.findMCFFiles(folderPath);
    
    mcfFiles.forEach(filePath => {
      const fileIndicators = this.parseMCFFile(filePath);
      const fileName = path.relative(folderPath, filePath);
      
      fileIndicators.forEach((indicator, id) => {
        indicator.file = fileName;
        indicators.set(id, indicator);
      });
    });

    return indicators;
  }

  /**
   * Find all MCF files in folder
   */
  findMCFFiles(folderPath) {
    const mcfFiles = [];
    
    const walk = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else if (file.endsWith('.mcf')) {
          mcfFiles.push(filePath);
        }
      });
    };

    walk(folderPath);
    return mcfFiles;
  }

  /**
   * Compare two indicator definitions
   */
  compareIndicators(ind1, ind2) {
    const changes = [];

    // Compare name
    if (ind1.name !== ind2.name) {
      changes.push({
        property: 'name',
        oldValue: ind1.name,
        newValue: ind2.name
      });
    }

    // Compare type
    if (ind1.type !== ind2.type) {
      changes.push({
        property: 'type',
        oldValue: ind1.type,
        newValue: ind2.type
      });
    }

    // Compare properties
    const allProps = new Set([
      ...Object.keys(ind1.properties),
      ...Object.keys(ind2.properties)
    ]);

    allProps.forEach(prop => {
      const val1 = ind1.properties[prop];
      const val2 = ind2.properties[prop];

      if (val1 !== val2) {
        changes.push({
          property: prop,
          oldValue: val1,
          newValue: val2
        });
      }
    });

    // Compare file location
    if (ind1.file !== ind2.file) {
      changes.push({
        property: 'file',
        oldValue: ind1.file,
        newValue: ind2.file
      });
    }

    return changes;
  }

  /**
   * Generate comparison report
   */
  generateReport(results, format = 'text') {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    }

    if (format === 'html') {
      return this.generateHTMLReport(results);
    }

    // Text format (default)
    return this.generateTextReport(results);
  }

  generateTextReport(results) {
    const { summary, added, removed, modified, unchanged } = results;
    
    let report = '';
    
    report += '═══════════════════════════════════════════════════════\n';
    report += `  MCF Quarter Comparison Report\n`;
    report += '═══════════════════════════════════════════════════════\n\n';
    
    report += `${summary.q1} → ${summary.q2}\n\n`;
    
    report += `Total Indicators:\n`;
    report += `  ${summary.q1}: ${summary.q1Count}\n`;
    report += `  ${summary.q2}: ${summary.q2Count}\n`;
    report += `  Change: ${summary.q2Count - summary.q1Count >= 0 ? '+' : ''}${summary.q2Count - summary.q1Count}\n\n`;
    
    // Added indicators
    report += `───────────────────────────────────────────────────────\n`;
    report += `ADDED INDICATORS (${added.length})\n`;
    report += `───────────────────────────────────────────────────────\n`;
    if (added.length > 0) {
      added.forEach(ind => {
        report += `\n✓ ${ind.id}\n`;
        report += `  Name: ${ind.name}\n`;
        report += `  Type: ${ind.type}\n`;
        report += `  File: ${ind.file}\n`;
      });
    } else {
      report += `  (none)\n`;
    }
    report += '\n';

    // Removed indicators
    report += `───────────────────────────────────────────────────────\n`;
    report += `REMOVED INDICATORS (${removed.length})\n`;
    report += `───────────────────────────────────────────────────────\n`;
    if (removed.length > 0) {
      removed.forEach(ind => {
        report += `\n✗ ${ind.id}\n`;
        report += `  Name: ${ind.name}\n`;
        report += `  Type: ${ind.type}\n`;
        report += `  File: ${ind.file}\n`;
      });
    } else {
      report += `  (none)\n`;
    }
    report += '\n';

    // Modified indicators
    report += `───────────────────────────────────────────────────────\n`;
    report += `MODIFIED INDICATORS (${modified.length})\n`;
    report += `───────────────────────────────────────────────────────\n`;
    if (modified.length > 0) {
      modified.forEach(ind => {
        report += `\n⚠ ${ind.id}\n`;
        report += `  Name: ${ind.name}\n`;
        ind.changes.forEach(change => {
          report += `  • ${change.property}:\n`;
          report += `    Old: ${change.oldValue}\n`;
          report += `    New: ${change.newValue}\n`;
        });
      });
    } else {
      report += `  (none)\n`;
    }
    report += '\n';

    // Summary
    report += `───────────────────────────────────────────────────────\n`;
    report += `SUMMARY\n`;
    report += `───────────────────────────────────────────────────────\n`;
    report += `  Added:      ${added.length}\n`;
    report += `  Removed:    ${removed.length}\n`;
    report += `  Modified:   ${modified.length}\n`;
    report += `  Unchanged:  ${unchanged.length}\n`;
    report += `  Total:      ${summary.q2Count}\n`;
    report += `═══════════════════════════════════════════════════════\n`;

    return report;
  }

  generateHTMLReport(results) {
    const { summary, added, removed, modified, unchanged } = results;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>MCF Comparison: ${summary.q1} → ${summary.q2}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: #1976d2;
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
    }
    .header p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .stat-card .number {
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    .stat-card.added .number { color: #4caf50; }
    .stat-card.removed .number { color: #f44336; }
    .stat-card.modified .number { color: #ff9800; }
    .section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      margin: 0 0 20px 0;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }
    .indicator {
      border-left: 4px solid #ddd;
      padding: 15px;
      margin-bottom: 15px;
      background: #f9f9f9;
    }
    .indicator.added { border-left-color: #4caf50; }
    .indicator.removed { border-left-color: #f44336; }
    .indicator.modified { border-left-color: #ff9800; }
    .indicator-id {
      font-family: monospace;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 5px;
    }
    .indicator-name {
      color: #333;
      margin-bottom: 10px;
    }
    .indicator-meta {
      font-size: 14px;
      color: #666;
    }
    .change {
      background: #fff;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      font-size: 14px;
    }
    .change strong {
      color: #1976d2;
    }
    .old-value {
      color: #f44336;
      text-decoration: line-through;
    }
    .new-value {
      color: #4caf50;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MCF Quarter Comparison Report</h1>
    <p><strong>${summary.q1}</strong> → <strong>${summary.q2}</strong></p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="stats">
    <div class="stat-card added">
      <h3>Added</h3>
      <div class="number">${added.length}</div>
    </div>
    <div class="stat-card removed">
      <h3>Removed</h3>
      <div class="number">${removed.length}</div>
    </div>
    <div class="stat-card modified">
      <h3>Modified</h3>
      <div class="number">${modified.length}</div>
    </div>
    <div class="stat-card">
      <h3>Unchanged</h3>
      <div class="number">${unchanged.length}</div>
    </div>
  </div>

  ${added.length > 0 ? `
  <div class="section">
    <h2>Added Indicators (${added.length})</h2>
    ${added.map(ind => `
      <div class="indicator added">
        <div class="indicator-id">${ind.id}</div>
        <div class="indicator-name">${ind.name}</div>
        <div class="indicator-meta">
          Type: ${ind.type} | File: ${ind.file}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${removed.length > 0 ? `
  <div class="section">
    <h2>Removed Indicators (${removed.length})</h2>
    ${removed.map(ind => `
      <div class="indicator removed">
        <div class="indicator-id">${ind.id}</div>
        <div class="indicator-name">${ind.name}</div>
        <div class="indicator-meta">
          Type: ${ind.type} | File: ${ind.file}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${modified.length > 0 ? `
  <div class="section">
    <h2>Modified Indicators (${modified.length})</h2>
    ${modified.map(ind => `
      <div class="indicator modified">
        <div class="indicator-id">${ind.id}</div>
        <div class="indicator-name">${ind.name}</div>
        ${ind.changes.map(change => `
          <div class="change">
            <strong>${change.property}:</strong>
            <div><span class="old-value">${change.oldValue || '(none)'}</span></div>
            <div><span class="new-value">${change.newValue || '(none)'}</span></div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>
  ` : ''}

</body>
</html>
    `.trim();
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node mcf-diff.js <quarter1_folder> <quarter2_folder> [options]');
    console.log('\nOptions:');
    console.log('  --output=<file>    Save report to file');
    console.log('  --format=<format>  Output format: text, json, html (default: text)');
    console.log('  --verbose          Show detailed output');
    console.log('\nExample:');
    console.log('  node mcf-diff.js ./2024_q2 ./2024_q3');
    console.log('  node mcf-diff.js ./2024_q2 ./2024_q3 --format=html --output=report.html');
    process.exit(1);
  }

  const q1Path = args[0];
  const q2Path = args[1];
  
  let outputFile = null;
  let format = 'text';
  let verbose = false;

  args.slice(2).forEach(arg => {
    if (arg.startsWith('--output=')) {
      outputFile = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      format = arg.split('=')[1];
    } else if (arg === '--verbose') {
      verbose = true;
    }
  });

  const comparator = new MCFComparator({ verbose });
  const results = comparator.compareQuarters(q1Path, q2Path);
  const report = comparator.generateReport(results, format);

  if (outputFile) {
    fs.writeFileSync(outputFile, report);
    console.log(`Report saved to: ${outputFile}`);
  } else {
    console.log(report);
  }
}

module.exports = MCFComparator;
