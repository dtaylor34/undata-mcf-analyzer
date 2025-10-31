# Integrating Your Real UN Data Commons MCF Files

This guide shows how to connect the fixed MCF Pipeline Viewer to your actual datacommons folder.

## 🗂️ Your Project Structure (from GitHub)

Based on typical UN Data Commons projects, your structure likely looks like:

```
undata-mcf-analyzer/
├── src/
│   └── datacommons/
│       ├── sdg/
│       │   ├── q1-2025/
│       │   │   └── schema/
│       │   │       └── sv.mcf
│       │   ├── q2-2025/
│       │   └── q4-2024/
│       ├── ilo/
│       ├── unicef/
│       └── who/
├── public/
├── package.json
└── README.md
```

## 🔄 Two Integration Options

### Option 1: Dynamic Loading from Filesystem (Recommended)

Create a data loader that scans your datacommons folder:

```javascript
// src/utils/dataLoader.js

export async function loadDataCommonsFiles() {
  const datacommons = {};
  
  // Organizations and their quarters
  const orgs = ['sdg', 'ilo', 'unicef', 'who'];
  const quarters = ['q1-2025', 'q2-2025', 'q4-2024'];
  
  for (const org of orgs) {
    for (const quarter of quarters) {
      const path = `/datacommons/${org}/${quarter}/schema/sv.mcf`;
      
      try {
        const response = await fetch(path);
        if (response.ok) {
          const mcfContent = await response.text();
          
          if (!datacommons[org]) {
            datacommons[org] = {};
          }
          
          datacommons[org][quarter] = mcfContent;
        }
      } catch (error) {
        console.warn(`Could not load ${path}:`, error);
      }
    }
  }
  
  return datacommons;
}

// Transform to match the app's expected format
export function transformToAppFormat(datacommons) {
  const transformed = {};
  
  Object.keys(datacommons).forEach(org => {
    Object.keys(datacommons[org]).forEach(quarter => {
      const key = `${org}_${quarter}.mcf`;
      transformed[key] = {
        [quarter]: datacommons[org][quarter]
      };
    });
  });
  
  return transformed;
}
```

Then update `App.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { loadDataCommonsFiles, transformToAppFormat } from './utils/dataLoader';
// ... other imports

export default function App() {
  const [mcfData, setMcfData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  // ... other state

  useEffect(() => {
    async function loadData() {
      try {
        const datacommons = await loadDataCommonsFiles();
        const transformed = transformToAppFormat(datacommons);
        setMcfData(transformed);
        
        // Set first available file as default
        const firstFile = Object.keys(transformed)[0];
        const firstVersion = Object.keys(transformed[firstFile])[0];
        
        setSelectedFile(firstFile);
        setSelectedVersion(firstVersion);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return <div>Loading MCF data...</div>;
  }

  // Rest of your App component...
}
```

**Setup Steps:**

1. Copy your `src/datacommons` folder to `public/datacommons`
2. Update your build configuration to include these files
3. Run the app!

---

### Option 2: Static Import (Simpler, but rebuild needed for changes)

Create a data configuration file:

```javascript
// src/data/mcfFiles.js

// Import your MCF files as strings
import sdgQ1 from '../datacommons/sdg/q1-2025/schema/sv.mcf?raw';
import sdgQ2 from '../datacommons/sdg/q2-2025/schema/sv.mcf?raw';
import sdgQ4 from '../datacommons/sdg/q4-2024/schema/sv.mcf?raw';
import iloQ1 from '../datacommons/ilo/q1-2025/schema/sv.mcf?raw';
// ... import all others

export const mcfData = {
  'sdg_q1-2025.mcf': {
    'q1-2025': sdgQ1,
    'q2-2025': sdgQ2, // for comparison
    'q4-2024': sdgQ4,
  },
  'sdg_q2-2025.mcf': {
    'q2-2025': sdgQ2,
    'q1-2025': sdgQ1,
  },
  'ilo_q1-2025.mcf': {
    'q1-2025': iloQ1,
  },
  // ... etc
};
```

**Vite Configuration** (add to `vite.config.js`):

```javascript
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.mcf'], // Treat .mcf as assets
});
```

Then in `App.jsx`:

```javascript
import { mcfData } from './data/mcfFiles';

export default function App() {
  const [selectedFile, setSelectedFile] = useState('sdg_q1-2025.mcf');
  const [selectedVersion, setSelectedVersion] = useState('q1-2025');
  
  const currentMCF = mcfData[selectedFile]?.[selectedVersion] || '';
  
  // ... rest of component
}
```

---

## 🎯 Recommended: Option 1 + Build Script

The best approach combines both:

**Build Script** (`scripts/prepare-data.js`):

```javascript
import fs from 'fs';
import path from 'path';

const sourceDir = './src/datacommons';
const destDir = './public/datacommons';

// Copy datacommons folder to public
fs.cpSync(sourceDir, destDir, { recursive: true });

console.log('✅ Datacommons files copied to public/');
```

**Add to `package.json`**:

```json
{
  "scripts": {
    "prepare-data": "node scripts/prepare-data.js",
    "dev": "npm run prepare-data && vite",
    "build": "npm run prepare-data && vite build"
  }
}
```

---

## 📊 Dynamic Dropdowns

Update `FileSelector.jsx` to show available files:

```javascript
export function FileSelector({
  selectedFile,
  selectedVersion,
  availableFiles, // New prop
  availableVersions, // New prop
  onFileChange,
  onVersionChange,
  // ... other props
}) {
  return (
    <div className="bg-[#34495e] border-b border-[#2c3e50]">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#95a5a6]" />
            <span className="text-sm text-[#95a5a6]">Source MCF:</span>
          </div>

          <Select value={selectedFile} onValueChange={onFileChange}>
            <SelectTrigger className="w-[220px] bg-[#2c3e50] border-[#1a252f] text-white">
              <SelectValue placeholder="Select MCF file" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c3e50] border-[#1a252f]">
              {availableFiles.map((file) => (
                <SelectItem key={file} value={file} className="text-white">
                  {file}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedVersion} onValueChange={onVersionChange}>
            <SelectTrigger className="w-[140px] bg-[#2c3e50] border-[#1a252f] text-white">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c3e50] border-[#1a252f]">
              {availableVersions.map((version) => (
                <SelectItem key={version} value={version} className="text-white">
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* ... rest of component */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Quick Integration Steps

1. **Copy this fixed version to your GitHub repo**
   ```bash
   cd undata-mcf-analyzer
   # Backup your current src
   mv src src-backup
   # Copy fixed version
   cp -r /path/to/fixed/version/src .
   ```

2. **Keep your datacommons folder**
   ```bash
   # Your datacommons folder stays in src/
   # Just make sure it's accessible
   ```

3. **Add the data loader utility**
   ```bash
   mkdir -p src/utils
   # Create dataLoader.js as shown above
   ```

4. **Update App.jsx**
   - Replace mock data with dynamic loading
   - Use the data loader utility

5. **Test it**
   ```bash
   npm install
   npm run dev
   ```

---

## 🔍 Debugging Tips

**If files don't load:**

```javascript
// Add to App.jsx
useEffect(() => {
  console.log('MCF Data loaded:', Object.keys(mcfData));
  console.log('Selected file:', selectedFile);
  console.log('Available versions:', Object.keys(mcfData[selectedFile] || {}));
}, [mcfData, selectedFile]);
```

**Check browser console:**
- Open DevTools (F12)
- Look for fetch errors
- Verify file paths are correct

**Check network tab:**
- See which files are being requested
- Verify response status (should be 200)

---

## 📁 Example File Structure After Integration

```
undata-mcf-analyzer/
├── public/
│   └── datacommons/        ← Copied here by build script
│       ├── sdg/
│       ├── ilo/
│       ├── unicef/
│       └── who/
├── src/
│   ├── App.jsx             ← Updated with dynamic loading
│   ├── components/
│   │   ├── FileSelector.jsx ← Updated for dynamic dropdowns
│   │   ├── DiffViewer.jsx
│   │   ├── CodeDisplay.jsx
│   │   └── ChartPreview.jsx
│   ├── utils/
│   │   └── dataLoader.js   ← New data loading utility
│   └── datacommons/        ← Original source files
│       ├── sdg/
│       ├── ilo/
│       ├── unicef/
│       └── who/
├── scripts/
│   └── prepare-data.js     ← Build script
└── package.json
```

---

## ✅ Verification Checklist

- [ ] Datacommons files accessible in public/
- [ ] Data loader utility created
- [ ] App.jsx updated with dynamic loading
- [ ] FileSelector accepts dynamic file list
- [ ] Build script runs before dev/build
- [ ] All 4 organizations (SDG, ILO, UNICEF, WHO) appear
- [ ] All quarters appear in version dropdown
- [ ] Diff viewer works between quarters
- [ ] All 6 tabs display correct transformations

---

Need help with a specific integration step? Share your:
1. Current `package.json` scripts
2. Current folder structure
3. Any error messages you're seeing
