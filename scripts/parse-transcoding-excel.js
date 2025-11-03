#!/usr/bin/env node
/**
 * Parse SDG Transcoding Excel File to JSON
 * 
 * Reads docs/sdg_TRANSCODING_review.xlsx
 * Converts 10,305 rows to JSON format
 * Saves to public/transcoding/sdg-q2-2025.json
 */

const fs = require('fs');
const path = require('path');

// Check if openpyxl is available in Python
const { execSync } = require('child_process');

const EXCEL_PATH = path.join(__dirname, '../docs/sdg_TRANSCODING_review.xlsx');
const OUTPUT_PATH = path.join(__dirname, '../public/transcoding/sdg-q2-2025.json');

console.log('📊 Parsing SDG Transcoding Excel File...\n');
console.log(`Input:  ${EXCEL_PATH}`);
console.log(`Output: ${OUTPUT_PATH}\n`);

// Create output directory if it doesn't exist
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created directory: ${outputDir}\n`);
}

// Python script to parse Excel
const pythonScript = `
import json
import sys

try:
    from openpyxl import load_workbook
except ImportError:
    print("ERROR: openpyxl not installed")
    print("Install with: pip3 install openpyxl")
    sys.exit(1)

# Load workbook
print("Loading Excel file...")
wb = load_workbook('${EXCEL_PATH.replace(/\\/g, '\\\\')}')
ws = wb.active

print(f"Found {ws.max_row - 1} data rows\\n")

# Parse data
data = []
headers = None

for i, row in enumerate(ws.iter_rows(values_only=True), 1):
    if i == 1:
        # Header row
        headers = [str(h).strip() if h else f"Column{j}" for j, h in enumerate(row)]
        print(f"Headers: {headers}\\n")
    else:
        # Data rows
        row_data = {}
        for j, value in enumerate(row):
            if j < len(headers):
                row_data[headers[j]] = str(value).strip() if value is not None else None
        data.append(row_data)
        
        # Progress indicator
        if i % 1000 == 0:
            print(f"Processed {i - 1} rows...")

print(f"\\n✅ Parsed {len(data)} mappings")

# Save to JSON
output = {
    "metadata": {
        "source": "docs/sdg_TRANSCODING_review.xlsx",
        "agency": "sdg",
        "data_version": "q2-2025",
        "total_mappings": len(data),
        "generated_at": "2025-11-01T12:00:00Z"
    },
    "mappings": data
}

output_path = '${OUTPUT_PATH.replace(/\\/g, '\\\\')}'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\\n✅ Saved to: {output_path}")
print(f"\\nFile size: {len(json.dumps(output)) / 1024 / 1024:.2f} MB")
`;

try {
  // Run Python script
  console.log('Running Python parser...\n');
  execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\n✅ COMPLETE!\n');
  console.log('Next steps:');
  console.log('1. Check output: public/transcoding/sdg-q2-2025.json');
  console.log('2. Update TranscodingViewer to load this file');
  console.log('3. Test confidence scoring with real data\n');
  
} catch (error) {
  console.error('\n❌ Error parsing Excel file:');
  console.error(error.message);
  console.error('\nMake sure openpyxl is installed: pip3 install openpyxl\n');
  process.exit(1);
}

