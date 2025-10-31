/**
 * MCF Parser - Extracts indicators from UN Data Commons MCF files
 * Parses: SDG (quarterly), ILO, UNICEF, WHO
 */

const fs = require('fs');
const path = require('path');

class MCFParser {
  constructor(datacommonsPath) {
    this.datacommonsPath = datacommonsPath;
    this.catalog = {
      metadata: {
        generated: new Date().toISOString(),
        source: 'Local MCF Files',
        totalIndicators: 0
      },
      organizations: {}
    };
  }

  /**
   * Main parse function - processes all organizations
   */
  async parse() {
    console.log('🔍 Starting MCF parsing...\n');
    
    // Parse each organization
    await this.parseSDG();
    await this.parseILO();
    await this.parseUNICEF();
    await this.parseWHO();
    
    // Calculate totals
    this.calculateTotals();
    
    console.log('\n✅ Parsing complete!');
    return this.catalog;
  }

  /**
   * Parse SDG quarterly data (Q4-2024, Q1-2025, Q2-2025)
   */
  async parseSDG() {
    console.log('📊 Parsing SDG data...');
    
    const sdgPath = path.join(this.datacommonsPath, 'sdg');
    const quarters = ['q4-2024', 'q1-2025', 'q2-2025'];
    
    this.catalog.organizations.sdg = {
      name: 'SDG (UNSD)',
      emoji: '🎯',
      quarters: {},
      indicators: []
    };
    
    for (const quarter of quarters) {
      const quarterPath = path.join(sdgPath, quarter);
      
      if (!fs.existsSync(quarterPath)) {
        console.log(`  ⚠️  Quarter ${quarter} not found, skipping...`);
        continue;
      }
      
      // Find schema directory (might be nested)
      const schemaPath = this.findSchemaDir(quarterPath);
      
      if (schemaPath) {
        const svFile = path.join(schemaPath, 'sv.mcf');
        if (fs.existsSync(svFile)) {
          const indicators = this.parseMCFFile(svFile, 'sdg');
          this.catalog.organizations.sdg.quarters[quarter] = {
            indicators: indicators.length,
            filePath: svFile,
            fileSize: this.getFileSize(svFile)
          };
          
          // Add to main indicator list (deduplicated)
          indicators.forEach(ind => {
            if (!this.catalog.organizations.sdg.indicators.find(i => i.dcid === ind.dcid)) {
              this.catalog.organizations.sdg.indicators.push(ind);
            }
          });
          
          console.log(`  ✓ ${quarter}: ${indicators.length} indicators`);
        }
      }
    }
  }

  /**
   * Parse ILO data
   */
  async parseILO() {
    console.log('📊 Parsing ILO data...');
    
    const iloPath = path.join(this.datacommonsPath, 'ilo', 'schema', 'sv.mcf');
    
    if (fs.existsSync(iloPath)) {
      const indicators = this.parseMCFFile(iloPath, 'ilo');
      
      this.catalog.organizations.ilo = {
        name: 'ILO',
        emoji: '🏆',
        indicators: indicators,
        filePath: iloPath,
        fileSize: this.getFileSize(iloPath)
      };
      
      console.log(`  ✓ ILO: ${indicators.length} indicators`);
    } else {
      console.log('  ⚠️  ILO sv.mcf not found');
    }
  }

  /**
   * Parse UNICEF data
   */
  async parseUNICEF() {
    console.log('📊 Parsing UNICEF data...');
    
    const unicefPath = path.join(this.datacommonsPath, 'unicef', 'schema', 'sv.mcf');
    
    if (fs.existsSync(unicefPath)) {
      const indicators = this.parseMCFFile(unicefPath, 'unicef');
      
      this.catalog.organizations.unicef = {
        name: 'UNICEF',
        emoji: '👶',
        indicators: indicators,
        filePath: unicefPath,
        fileSize: this.getFileSize(unicefPath)
      };
      
      console.log(`  ✓ UNICEF: ${indicators.length} indicators`);
    } else {
      console.log('  ⚠️  UNICEF sv.mcf not found');
    }
  }

  /**
   * Parse WHO data
   */
  async parseWHO() {
    console.log('📊 Parsing WHO data...');
    
    const whoPath = path.join(this.datacommonsPath, 'who', 'schema', 'sv.mcf');
    
    if (fs.existsSync(whoPath)) {
      const indicators = this.parseMCFFile(whoPath, 'who');
      
      this.catalog.organizations.who = {
        name: 'WHO',
        emoji: '🏥',
        indicators: indicators,
        filePath: whoPath,
        fileSize: this.getFileSize(whoPath)
      };
      
      console.log(`  ✓ WHO: ${indicators.length} indicators`);
    } else {
      console.log('  ⚠️  WHO sv.mcf not found');
    }
  }

  /**
   * Parse MCF file and extract indicators
   */
  parseMCFFile(filePath, org) {
    const content = fs.readFileSync(filePath, 'utf8');
    const indicators = [];
    
    // Split by nodes (each node starts with "Node: dcid:")
    const nodes = content.split(/\n(?=Node: dcid:)/);
    
    for (const node of nodes) {
      if (!node.trim() || !node.includes('typeOf: dcs:StatisticalVariable')) {
        continue;
      }
      
      const indicator = this.parseNode(node, org);
      if (indicator) {
        indicators.push(indicator);
      }
    }
    
    return indicators;
  }

  /**
   * Parse individual MCF node
   */
  parseNode(nodeText, org) {
    const lines = nodeText.split('\n');
    const indicator = {
      org: org,
      dcid: '',
      name: '',
      properties: {}
    };
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Node: dcid:')) {
        indicator.dcid = trimmed.replace('Node: dcid:', '').trim();
      } else if (trimmed.startsWith('name:')) {
        indicator.name = trimmed.replace('name:', '').replace(/"/g, '').trim();
      } else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        indicator.properties[key] = value;
      }
    }
    
    return indicator.dcid ? indicator : null;
  }

  /**
   * Find schema directory (handles nested timestamp folders)
   */
  findSchemaDir(quarterPath) {
    // Direct schema folder
    const directSchema = path.join(quarterPath, 'schema');
    if (fs.existsSync(directSchema)) {
      return directSchema;
    }
    
    // Look for nested timestamp folders
    const items = fs.readdirSync(quarterPath);
    for (const item of items) {
      const itemPath = path.join(quarterPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const nestedSchema = path.join(itemPath, 'schema');
        if (fs.existsSync(nestedSchema)) {
          return nestedSchema;
        }
      }
    }
    
    return null;
  }

  /**
   * Get file size in human-readable format
   */
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const mb = stats.size / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  /**
   * Calculate totals across all organizations
   */
  calculateTotals() {
    let total = 0;
    
    for (const org in this.catalog.organizations) {
      const orgData = this.catalog.organizations[org];
      
      if (orgData.indicators) {
        total += orgData.indicators.length;
      }
    }
    
    this.catalog.metadata.totalIndicators = total;
  }

  /**
   * Save catalog to JSON file
   */
  saveCatalog(outputPath) {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(this.catalog, null, 2),
      'utf8'
    );
    console.log(`\n💾 Catalog saved to: ${outputPath}`);
  }

  /**
   * Generate summary report
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MCF PARSING SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\nTotal Indicators: ${this.catalog.metadata.totalIndicators}`);
    console.log('\nBy Organization:');
    
    for (const org in this.catalog.organizations) {
      const orgData = this.catalog.organizations[org];
      const count = orgData.indicators ? orgData.indicators.length : 0;
      console.log(`  ${orgData.emoji} ${orgData.name}: ${count} indicators`);
      
      if (orgData.quarters) {
        console.log('    Quarters:');
        for (const quarter in orgData.quarters) {
          console.log(`      - ${quarter}: ${orgData.quarters[quarter].indicators} indicators`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Main execution
async function main() {
  const datacommonsPath = process.argv[2] || '/home/claude/datacommons';
  const outputPath = process.argv[3] || '/home/claude/real-catalog.json';
  
  console.log('🚀 UN Data Commons MCF Parser');
  console.log(`📁 Source: ${datacommonsPath}`);
  console.log(`💾 Output: ${outputPath}\n`);
  
  const parser = new MCFParser(datacommonsPath);
  await parser.parse();
  parser.printSummary();
  parser.saveCatalog(outputPath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCFParser;
