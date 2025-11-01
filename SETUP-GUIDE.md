# 🚀 Quick Setup Guide

## Get Started in 5 Minutes

### Step 1: Create Directory Structure

```bash
cd /Users/dt/undata/undata-mcf-analyzer

# Create inbox directories for each partner
mkdir -p inbox/unicef inbox/who inbox/ilo inbox/fao inbox/sdg

# Create processing workspace
mkdir -p processing

# Create MCF storage (source of truth)
mkdir -p mcf/unicef mcf/who mcf/ilo mcf/sdg mcf/fao

# Create output directories
mkdir -p output/stat output/datacommons output/cached
```

### Step 2: Test the Governance System

Create a test MCF file:

```bash
cat > test-data.mcf << 'EOF'
Node: dcid:test/health_indicator
typeOf: dcs:StatisticalVariable
name: "Child Mortality Rate"
description: "Deaths per 1,000 live births under age 5"
populationType: dcs:Person
measuredProperty: dcs:mortality

Node: dcid:test/obs_001
typeOf: dcs:StatVarObservation
variableMeasured: dcid:test/health_indicator
observationAbout: dcid:country/USA
observationDate: "2023"
value: 5.2
unit: "Per1000"
EOF
```

### Step 3: Start the App

```bash
npm start
```

Your browser should open to `http://localhost:3000`

### Step 4: Test Components

#### A. Test Governance Panel

Add to your `App.js`:

```jsx
import { GovernancePanel } from './components/GovernancePanel';
import { useState } from 'react';

function App() {
  const [mcf, setMCF] = useState(`
Node: dcid:who/AIR_11
typeOf: dcs:StatisticalVariable
name: "Air pollution exposure"
description: "Population exposed to air pollution"
populationType: dcs:Person
measuredProperty: dcs:airPollutionExposure
  `);

  return (
    <div className="app">
      <h1>MCF Analyzer</h1>
      
      <GovernancePanel 
        mcfContent={mcf}
        agency="who"
        onThemeUpdate={(dcid, theme) => console.log('Theme:', theme)}
        onSDGUpdate={(dcid, sdgs) => console.log('SDGs:', sdgs)}
      />
    </div>
  );
}
```

You should see:
- ✅ Coverage: 100%
- ✅ Theme: ENV-POL
- ✅ SDG: SDG03

#### B. Test Dual Chart Preview

```jsx
import { DualChartPreview } from './components/DualChartPreview';

function App() {
  const mcfWithData = `
Node: dcid:test/var
typeOf: dcs:StatisticalVariable
name: "Test Variable"

Node: dcid:test/obs1
typeOf: dcs:StatVarObservation
variableMeasured: dcid:test/var
observationAbout: dcid:country/USA
observationDate: "2023"
value: 42.5
  `;

  return (
    <DualChartPreview 
      mcfContent={mcfWithData}
      agency="test"
    />
  );
}
```

You should see:
- Side-by-side DataCommons and .STAT chart previews

#### C. Test DataPipeline

```jsx
import { DataPipeline } from './utils/data-pipeline';

const oldMCF = `
Node: dcid:test/var
typeOf: dcs:StatisticalVariable
name: "Old Variable"
`;

const newMCF = `
Node: dcid:test/var
typeOf: dcs:StatisticalVariable
name: "New Variable"

Node: dcid:test/obs1
typeOf: dcs:StatVarObservation
variableMeasured: dcid:test/var
observationDate: "2023"
value: 100
`;

const pipeline = new DataPipeline(newMCF, oldMCF);

console.log('Impact:', pipeline.impact);
// Shows: +1 observation, 1 variable modified
```

### Step 5: What's Working Now

✅ **Governance validation** - Drop an MCF file, see theme/SDG analysis  
✅ **Chart previews** - See DataCommons + .STAT charts side-by-side  
✅ **Data transformations** - MCF → .STAT, DataCommons, Cached  
✅ **Diff generation** - Compare two versions  
✅ **Partner management** - Registry with permissions  
✅ **Multi-environment** - Test/Staging/Production configs  

### Step 6: What's Coming Next

⏳ **File watcher** - Auto-detect new files in inbox/  
⏳ **Automated processor** - Convert & validate on file drop  
⏳ **Review Queue UI** - Central approval interface  
⏳ **Comprehensive diff UI** - 5-section impact view  
⏳ **Deployment automation** - One-click deploy  

---

## 🎯 Try It Out

### Example: Test UNICEF Data

```bash
# 1. Create sample UNICEF data
cat > inbox/unicef/test_child_health.csv << 'EOF'
REF_AREA,INDICATOR,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE
USA,CHLD_MORT,2023,5.2,Per1000
CAN,CHLD_MORT,2023,4.8,Per1000
MEX,CHLD_MORT,2023,12.1,Per1000
EOF

# 2. The file watcher (when implemented) will auto-process
# For now, you can manually test the converter:
node scripts/csv-to-mcf-converter.js inbox/unicef/test_child_health.csv

# 3. View in MCF Analyzer UI
npm start
```

---

## 📝 Configuration

### Partner Registry

Edit `config/partners.js` to add new partners:

```javascript
export const DATA_PARTNERS = {
  'your_agency': {
    id: 'your_agency',
    name: 'Your Agency Name',
    status: 'active',
    tier: 'partner',
    permissions: {
      canPublish: true,
      canShare: true,
      datasets: 'all'
    },
    branding: {
      primaryColor: '#0066CC',
      accentColor: '#0099FF'
    }
  }
};
```

### Theme Taxonomy

Edit `config/undata-taxonomy.js` to add themes:

```javascript
export const UNDATA_THEMES = {
  'YOUR_THEME': {
    id: 'YOUR_THEME',
    name: 'Your Theme Name',
    subthemes: [
      {
        id: 'YOUR_SUB',
        name: 'Subtheme',
        keywords: ['keyword1', 'keyword2']
      }
    ]
  }
};
```

---

## ✅ Verification Checklist

- [ ] Directory structure created
- [ ] npm start works
- [ ] GovernancePanel displays correctly
- [ ] DualChartPreview shows charts
- [ ] DataPipeline generates diffs
- [ ] No console errors

---

## 🆘 Troubleshooting

**Issue:** "Module not found" errors

**Fix:**
```bash
npm install
```

**Issue:** Charts not displaying

**Fix:** Make sure your MCF has `StatVarObservation` nodes with actual data values.

**Issue:** Governance shows 0% coverage

**Fix:** Your indicators need names/descriptions that match keywords in `undata-taxonomy.js`.

---

## 🚀 You're All Set!

The core components are ready to use. When you're ready to implement the automation layer and remaining UI components, just let me know!

**Happy analyzing! 📊**

