# 🧪 Test Data Guide - End-to-End Testing

**Created**: November 3, 2025  
**Status**: ✅ Ready for Testing

---

## 📋 Overview

This guide will walk you through testing the complete end-to-end workflow using test ILO data.

**Test Data**: Pre-created ILO employment data for 4 countries (Afghanistan, Pakistan, India, Bangladesh) with 24 data points across 3 years.

---

## 🎯 **End-to-End Test Workflow**

### **Step 1: Open Data Ingestion Dashboard**

1. Start the application (`npm start` if not already running)
2. Navigate to your app in the browser
3. Click **"Data Ingestion"** button in the top navigation
4. You should see the Data Ingestion Pipeline dashboard

---

### **Step 2: View TEST Data**

You'll see a test version already available:

- **Name**: `ILO: TEST Q4 2024`
- **Status**: CSV (40% progress)
- **Files**: 
  - Raw: `TEST-ilo-employment-q4-2024.csv` (2.5 KB, 24 rows)
  - CSV: `TEST-employment-indicators-v1.csv`
- **Timeline**:
  - ✅ Uploaded (completed)
  - ✅ CSV Exported (completed)
  - ⏳ MCF Generation (pending)
  - ⬜ Deployment (not started)

---

### **Step 3: Generate MCF**

1. Find the **"ILO: TEST Q4 2024"** item (should have CSV status)
2. Click the **"Generate MCF"** button (purple button)
3. System simulates MCF generation
4. Confirmation appears: "✅ MCF Generated! Version 'TEST Q4 2024' is now ready for deployment."
5. Status changes to "MCF"
6. Progress bar updates to ~85%
7. Timeline shows MCF generation completed

**What MCF Contains**:
- 2 Statistical Variables (Employment Rate, Unemployment Rate)
- 10 Observations (AFG, PAK, IND, BGD for 2024)
- Proper MCF format with dcid references

**MCF Content Preview**:
```mcf
Node: dcid:Count_Person_Employed
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
name: "Employment Rate"

Node: dcid:o/AFG_2024_EMP
typeOf: dcs:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent
```

---

### **Step 4: Deploy to UN Data (Generate Cache)**

1. Scroll to the **"ILO: TEST Q4 2024"** item
2. Click **"Approve & Deploy"** button (green button with dropdown)
3. A dropdown menu appears with 3 options:
   - ☐ Deploy to .STAT (SDMX format)
   - ☐ Deploy to DataCommons (MCF format)
   - ☐ Deploy to UN Data (Cached JSON)
4. Click **"☐ Deploy to UN Data"**

**What Happens**:
- Progress indicator appears at top:
  - "Generating JSON cache files..."
  - "Parsing MCF content..."
  - "Saving X cache files..."
- MCF is auto-generated from test data
- Cache files are created
- Success message: "✅ Success! Generated X cache files"

**Expected Cache Files**:
- **By Country**: `AFG.json`, `PAK.json`, `IND.json`, `BGD.json`
- **By Theme**: `employment.json`, `labour.json`
- **By Partner**: `ilo.json`

---

### **Step 5: View Charts**

1. Click **"View Charts"** button in top navigation
2. You'll see the Cached Data Viewer with 4 view modes

#### **📍 By Location**
1. Click **"By Location"** tab
2. Search for "AFG" or "Afghanistan"
3. You should see:
   - **AFG** card showing:
     - 2 indicators (Employment Rate, Unemployment Rate)
     - 1 country
     - 2 charts available
     - Sources: ILO
4. Click on the **AFG** card
5. Modal opens showing detailed charts:
   - **Employment Rate** trend (2023-2024)
   - **Unemployment Rate** trend (2023-2024)

#### **🎨 By Theme**
1. Click **"By Theme"** tab
2. You should see:
   - **EMPLOYMENT** card
   - **LABOUR** card (if matched)
3. Click on **EMPLOYMENT**
4. View all employment-related indicators across all countries

#### **👥 By Data Partner**
1. Click **"By Data Partner"** tab
2. You should see:
   - **ILO** card showing:
     - Total observations
     - 4 countries
     - 2 indicators
3. Click on **ILO**
4. View all ILO data aggregated

---

### **Step 6: Clean Up Test Data**

#### **Method 1: Using the Button**
1. Go back to **"Data Ingestion"** tab
2. Click **"Clear Test Data"** button (red trash icon)
3. Confirmation dialog appears:
   ```
   ⚠️ Clear all TEST data?
   
   This will remove:
   - Test cache files
   - Test versions
   - All data labeled with "TEST"
   
   Production data will NOT be affected.
   ```
4. Click **OK**
5. Success message shows what was removed:
   ```
   ✅ Test cleanup complete!
   
   Cache files removed: 7
   Versions removed: 1
   Total items removed: 8
   ```

#### **Method 2: Using Browser Console**
```javascript
// Clear only test cache files
import { clearTestCacheFiles } from './src/utils/test-data-cleanup.js';
clearTestCacheFiles();

// Clear ALL cache files (careful!)
import { clearAllCacheFiles } from './src/utils/test-data-cleanup.js';
clearAllCacheFiles();

// Get cache statistics
import { getCacheStatistics } from './src/utils/test-data-cleanup.js';
const stats = getCacheStatistics();
console.log(stats);
```

#### **Method 3: Manual localStorage Cleanup**
Open browser console (F12) and run:
```javascript
// View all cache keys
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('cache_')) {
    console.log(key);
  }
}

// Clear test cache
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key && key.toLowerCase().includes('test')) {
    localStorage.removeItem(key);
  }
}
```

---

## 📊 **Test Data Specifications**

### **CSV File Details**
- **File**: `TEST-ilo-employment-q4-2024.csv`
- **Location**: `public/datacommons/raw/ilo/pending/`
- **Size**: ~2.5 KB
- **Rows**: 24 (excluding header)
- **Columns**: 9

### **CSV Structure**
```csv
Country,CountryCode,Year,IndicatorCode,IndicatorName,Value,Unit,Source,Methodology
Afghanistan,AFG,2024,EMP_RATE,Employment Rate,45.2,%,ILO STAT,Labour Force Survey
```

### **Countries Included**
- 🇦🇫 Afghanistan (AFG) - 3 years of data
- 🇵🇰 Pakistan (PAK) - 3 years of data
- 🇮🇳 India (IND) - 3 years of data
- 🇧🇩 Bangladesh (BGD) - 3 years of data

### **Indicators**
1. **EMP_RATE** - Employment Rate (%)
2. **UNEMP_RATE** - Unemployment Rate (%)

### **Time Period**
- 2022, 2023, 2024

### **Generated MCF Observations**
- 10 observations total
- Example:
  ```mcf
  Node: dcid:o/AFG_2024_EMP
  typeOf: dcs:StatVarObservation
  observationAbout: dcid:country/AFG
  observationDate: "2024"
  variableMeasured: dcid:Count_Person_Employed
  value: 45.2
  unit: Percent
  ```

---

## ✅ **Expected Results**

### **After Deployment to UN Data**

#### **Cache Files Created** (localStorage keys):
```
cache_locations_by-country_AFG.json       (Afghanistan data)
cache_locations_by-country_PAK.json       (Pakistan data)
cache_locations_by-country_IND.json       (India data)
cache_locations_by-country_BGD.json       (Bangladesh data)
cache_themes_employment.json              (Employment theme)
cache_themes_labour.json                  (Labour theme, if matched)
cache_partners_ilo.json                   (ILO partner data)
```

#### **Cache File Contents Example** (`AFG.json`):
```json
{
  "country": "Afghanistan",
  "countryCode": "AFG",
  "lastUpdated": "2025-11-03T...",
  "sources": ["ILO"],
  "indicators": [
    {
      "id": "dcid:Count_Person_Employed",
      "name": "Employment Rate",
      "value": 45.2,
      "unit": "Percent",
      "year": 2024,
      "source": "ILO"
    },
    {
      "id": "dcid:Count_Person_Unemployed",
      "name": "Unemployment Rate",
      "value": 11.2,
      "unit": "Percent",
      "year": 2024,
      "source": "ILO"
    }
  ],
  "trends": {
    "dcid:Count_Person_Employed": [
      {"year": 2023, "value": 43.8},
      {"year": 2024, "value": 45.2}
    ]
  }
}
```

---

## 🔍 **Verification Steps**

### **1. Check Deployment Status**
- Checkbox should be checked (☑️)
- Green "Deployed" badge appears
- "View Live" link becomes active

### **2. Verify Cache Files**
Open browser console and run:
```javascript
// List all test cache files
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.startsWith('cache_') && key.includes('TEST')) {
    console.log(key, localStorage.getItem(key).length + ' bytes');
  }
}
```

### **3. Verify Charts Load**
- Charts should appear in "View Charts" tab
- Each view mode should show relevant data
- Clicking items should open detailed modal
- Charts should render without errors

---

## 🐛 **Troubleshooting**

### **Problem: No TEST version showing**
**Solution**: Refresh the page. The TEST version is added to mock data automatically.

### **Problem: Deployment fails**
**Solution**: 
1. Check browser console for errors
2. Verify MCF content is being generated
3. Try deploying again

### **Problem: No charts appearing**
**Solution**:
1. Make sure deployment completed successfully
2. Check browser console for errors
3. Click "Refresh" button in Cached Data Viewer
4. Clear localStorage and re-deploy

### **Problem: Charts show "No data available"**
**Solution**:
1. Check that observations have valid year/value fields
2. Verify MCF parsing succeeded
3. Check that cache files contain data

### **Problem: Can't clear test data**
**Solution**:
1. Use browser console to manually clear:
   ```javascript
   localStorage.clear();
   ```
2. Refresh page
3. TEST data will reappear (it's in mock data)

---

## 📝 **Test Checklist**

- [ ] Open Data Ingestion dashboard
- [ ] View TEST Q4 2024 item
- [ ] Expand TEST item to see details
- [ ] Click "Approve & Deploy" button
- [ ] Select "Deploy to UN Data"
- [ ] Wait for success message
- [ ] Verify checkbox is checked
- [ ] Open "View Charts" tab
- [ ] Test "By Location" view - find AFG
- [ ] Click AFG card to view charts
- [ ] Test "By Theme" view - find employment
- [ ] Test "By Partner" view - find ILO
- [ ] Return to Data Ingestion
- [ ] Click "Clear Test Data"
- [ ] Confirm cleanup
- [ ] Verify test data is removed
- [ ] Check View Charts (should show "No data")

---

## 🎯 **Success Criteria**

✅ **Test Passed If**:
1. TEST version appears in dashboard
2. Deployment completes without errors
3. Cache files are generated (7+ files)
4. Charts appear in all 4 view modes
5. Clicking items shows detailed modal
6. Charts render correctly
7. Clear Test Data removes all test files
8. Production data remains untouched

---

## 🚀 **Next Steps After Testing**

Once you've verified the test workflow:

1. **Upload Real Data**: Use the "Upload New File" button
2. **Use Templates**: Download organization-specific templates
3. **Process Real MCF**: Generate actual MCF from your CSV
4. **Deploy to Production**: Deploy real data to UN Data cache
5. **Share Charts**: Use the data for visualizations

---

## 📚 **Related Documentation**

- `CACHE-DEPLOYMENT-GUIDE.md` - Complete cache deployment guide
- `PHASE1-IMPLEMENTATION.md` - Implementation details
- `DATAFLOW-COMPLETE.md` - Full system architecture
- `public/datacommons/templates/README.md` - Template usage guide

---

**Happy Testing!** 🎉

If you encounter any issues, check the browser console for detailed error messages or refer to the troubleshooting section above.

