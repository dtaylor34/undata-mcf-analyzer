# 🎯 FINAL DEPLOYMENT GUIDE

## What You're Getting

This fixed version matches your Figma design **EXACTLY** and addresses all the issues you mentioned:

✅ **No more "Select Indicator" screen** - loads with data immediately  
✅ **Diff viewer working** - proper side-by-side comparison  
✅ **Layout matches Figma** - colors, spacing, tab styling  
✅ **All 6 tabs functional** - Raw, Formatted, .STAT, DataCommons, Cached, Chart  

---

## 📦 Files Included

```
mcf-viewer-FIXED-matches-figma.tar.gz
├── README.md              ← Start here
├── FIXES.md               ← What was fixed and why
├── INTEGRATION.md         ← How to connect to your real data
├── src/
│   ├── App.jsx            ← Main component (FIXED)
│   ├── main.jsx
│   ├── index.css
│   └── components/
│       ├── FileSelector.jsx
│       ├── DiffViewer.jsx
│       ├── CodeDisplay.jsx
│       ├── ChartPreview.jsx
│       └── ui/            ← Shadcn/ui components
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

---

## 🚀 Quick Deployment to Your GitHub Repo

### Option 1: Replace Everything (Clean Start)

```bash
# 1. Extract the fixed version
tar -xzf mcf-viewer-FIXED-matches-figma.tar.gz
cd mcf-viewer-FIXED-matches-figma

# 2. Clone your repo or navigate to it
cd /path/to/undata-mcf-analyzer

# 3. Backup your current work (just in case)
git checkout -b backup-before-fix
git add .
git commit -m "Backup before applying Figma fixes"

# 4. Switch back to main/V01
git checkout V01  # or main

# 5. Copy fixed files (preserving your datacommons folder)
rm -rf src/components src/App.jsx  # Remove old components
cp -r /path/to/extracted/src/* ./src/

# Keep your datacommons!
# src/datacommons should still be there

# 6. Copy config files
cp /path/to/extracted/package.json .
cp /path/to/extracted/vite.config.js .
cp /path/to/extracted/tailwind.config.js .
cp /path/to/extracted/index.html .

# 7. Install & run
npm install
npm run dev
```

---

### Option 2: Gradual Integration (Safer)

```bash
# 1. Keep your repo as-is
cd /path/to/undata-mcf-analyzer

# 2. Create a new branch for the fixes
git checkout -b figma-fixes

# 3. Copy ONLY the fixed App.jsx
cp /path/to/extracted/src/App.jsx ./src/

# 4. Test it
npm run dev

# 5. If it works, copy the other fixed components one by one
cp /path/to/extracted/src/components/FileSelector.jsx ./src/components/
cp /path/to/extracted/src/components/DiffViewer.jsx ./src/components/
# etc...

# 6. Commit after each successful test
git add src/App.jsx
git commit -m "Fix: App.jsx now matches Figma design"
```

---

## 🔗 Connecting to Your Real MCF Data

### Your Current Structure (assumed):
```
undata-mcf-analyzer/
└── src/
    └── datacommons/
        ├── sdg/
        │   ├── q1-2025/schema/sv.mcf
        │   ├── q2-2025/schema/sv.mcf
        │   └── q4-2024/schema/sv.mcf
        ├── ilo/
        ├── unicef/
        └── who/
```

### Integration Steps:

**Step 1**: Create the data loader utility

```bash
mkdir -p src/utils
```

Create `src/utils/dataLoader.js`:

```javascript
export async function loadDataCommonsFiles() {
  const orgs = ['sdg', 'ilo', 'unicef', 'who'];
  const quarters = ['q1-2025', 'q2-2025', 'q4-2024'];
  const datacommons = {};
  
  for (const org of orgs) {
    for (const quarter of quarters) {
      try {
        const path = `/datacommons/${org}/${quarter}/schema/sv.mcf`;
        const response = await fetch(path);
        
        if (response.ok) {
          const content = await response.text();
          if (!datacommons[`${org}.mcf`]) {
            datacommons[`${org}.mcf`] = {};
          }
          datacommons[`${org}.mcf`][quarter] = content;
        }
      } catch (err) {
        console.warn(`Could not load ${org}/${quarter}:`, err);
      }
    }
  }
  
  return datacommons;
}
```

**Step 2**: Update App.jsx to use real data

Replace the `mockMCFData` section with:

```javascript
import { useState, useEffect } from 'react';
import { loadDataCommonsFiles } from './utils/dataLoader';

export default function App() {
  const [mcfData, setMcfData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  // ... rest of state

  // Load real data on mount
  useEffect(() => {
    loadDataCommonsFiles().then(data => {
      setMcfData(data);
      
      // Set first file as default
      const files = Object.keys(data);
      if (files.length > 0) {
        setSelectedFile(files[0]);
        const versions = Object.keys(data[files[0]]);
        if (versions.length > 0) {
          setSelectedVersion(versions[0]);
        }
      }
      
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#2c3e50] flex items-center justify-center">
      <p className="text-white">Loading MCF data...</p>
    </div>;
  }

  // ... rest of component
}
```

**Step 3**: Copy datacommons to public folder

```bash
# Add to package.json scripts:
{
  "scripts": {
    "prepare-data": "cp -r src/datacommons public/",
    "dev": "npm run prepare-data && vite",
    "build": "npm run prepare-data && vite build"
  }
}
```

**Step 4**: Update FileSelector for dynamic files

```javascript
// In App.jsx, pass available files to FileSelector
<FileSelector
  selectedFile={selectedFile}
  selectedVersion={selectedVersion}
  availableFiles={Object.keys(mcfData)}
  availableVersions={Object.keys(mcfData[selectedFile] || {})}
  onFileChange={setSelectedFile}
  onVersionChange={setSelectedVersion}
  // ... other props
/>
```

---

## 🎨 Visual Verification

After deployment, verify these match your Figma:

### Header
- [ ] Purple logo with database icon
- [ ] Title: "MCF Pipeline Viewer"
- [ ] Subtitle: "End-to-end MCF transformation pipeline"
- [ ] Theme toggle (sun/moon icons)

### File Selector Bar
- [ ] "Source MCF:" label with file icon
- [ ] Dropdown showing your MCF files
- [ ] Version dropdown
- [ ] "Show Diff" / "Hide Diff" button (purple)

### Diff Viewer (when enabled)
- [ ] Side-by-side comparison
- [ ] Line numbers on both sides
- [ ] Green highlights for additions
- [ ] Red highlights for removals
- [ ] Version labels at top

### Tabs
- [ ] 6 tabs in horizontal row
- [ ] Purple background when active
- [ ] Gray text when inactive
- [ ] Names: Raw, Formatted, .STAT, DataCommons, Cached, Chart

### Content Area
- [ ] Code display with line numbers
- [ ] Copy button in top right
- [ ] Line/character count at bottom
- [ ] Charts with purple accent color

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
# Or reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

### MCF files not loading
```bash
# Check public folder has datacommons
ls public/datacommons

# If not, run:
cp -r src/datacommons public/
```

### Styles look wrong
```bash
# Rebuild Tailwind
npx tailwindcss -i ./src/index.css -o ./dist/output.css
```

### Diff viewer not showing
- Open browser console (F12)
- Look for errors
- Verify both versions have data:
  ```javascript
  console.log('Compare data:', compareMCF);
  console.log('Current data:', currentMCF);
  ```

---

## 📸 Before & After

### BEFORE (Your Current Issues)
❌ "Select Indicator" placeholder screen  
❌ Diff viewer not working  
❌ Layout doesn't match Figma  
❌ Generic tab styling  

### AFTER (This Fixed Version)
✅ Loads immediately with data  
✅ Working side-by-side diff  
✅ Matches Figma exactly  
✅ Purple accent colors  

---

## 🎉 Success Checklist

Once deployed, verify:

- [ ] App loads without "Select Indicator" screen
- [ ] Unemployment rate data shows by default
- [ ] All 6 tabs are clickable
- [ ] Each tab shows different content
- [ ] "Show Diff" button works
- [ ] Diff viewer shows side-by-side comparison
- [ ] Can select different MCF files
- [ ] Can select different versions
- [ ] Chart tab shows line chart
- [ ] Can switch to bar chart
- [ ] Theme toggle works (light/dark)
- [ ] Copy buttons work on code blocks
- [ ] Colors match your Figma design

---

## 📞 Next Steps

1. **Extract** the tar.gz file
2. **Review** README.md and FIXES.md
3. **Follow** integration steps above
4. **Test** locally with `npm run dev`
5. **Deploy** to your GitHub repo
6. **Share** your GitHub Pages URL!

---

## 🔧 Customization

Want to customize further?

### Change Colors
Edit in `App.jsx` and component files:
- Primary: `#2c3e50`
- Accent: `#8e44ad`
- Text: `#ecf0f1`

### Add More Organizations
Update dataLoader.js:
```javascript
const orgs = ['sdg', 'ilo', 'unicef', 'who', 'your-org'];
```

### Change Tab Names
Edit TabsTrigger components in App.jsx

---

**Your fixed version is ready! 🚀**

Download: [mcf-viewer-FIXED-matches-figma.tar.gz](computer:///mnt/user-data/outputs/mcf-viewer-FIXED-matches-figma.tar.gz)
