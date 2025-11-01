# Which Files Have Charts?

## Quick Reference

| Organization | File Type | Has Charts? | Notes |
|--------------|-----------|-------------|-------|
| **SDG** | sample-observations.mcf | ✅ YES (2 charts) | Test file with observations |
| **SDG** | Q4 2024/sv.mcf | ❌ NO | Metadata only (41,572 variables) |
| **SDG** | Q4 2024/schema.mcf | ❌ NO | Schema definitions |
| **SDG** | Q4 2024/unit.mcf | ❌ NO | Unit definitions |
| **SDG** | Q4 2024/series.mcf | ❌ NO | Series metadata |
| **ILO** | ilo.mcf | ❌ NO | Metadata only |
| **UNICEF** | sv.mcf | ❌ NO | Metadata only |
| **WHO** | sv.mcf | ❌ NO | Metadata only (but 522 CSV files available!) |

---

## How to See Charts Right Now

### Step 1: Select the Right File
1. **Organization:** 🎯 SDG
2. **File Type:** sample-observations.mcf
3. **Version:** Sample Data (With Charts)

### Step 2: Go to Chart View
1. Click any tab: **MCF**, **.STAT**, **DataCommons**, or **Cached**
2. Click the **"Chart"** button (5th button in the view switcher)
3. You should see **2 charts**!

### Step 3: Use the Filter
1. Click **"Filter Charts (2/2)"** button
2. You'll see:
   - ☑ All Charts
   - ☑ Proportion of population below international poverty line
   - ☑ Proportion of population living below the national poverty line

---

## Why Other Files Don't Have Charts

### Understanding MCF File Types

MCF files come in two varieties:

#### 1. **Schema Files (Metadata Only)** ❌ No Charts
```
Node: dcid:undata/sdg/SI_POV_DAY1
typeOf: dcs:StatisticalVariable
name: "Proportion of population below poverty line"
unit: "Percentage"
```
**Contains:** Variable definitions, units, descriptions
**Missing:** Actual data points (observations)
**Result:** No charts can be generated

#### 2. **Complete Files (Metadata + Observations)** ✅ Has Charts
```
Node: dcid:undata/sdg/SI_POV_DAY1
typeOf: dcs:StatisticalVariable
name: "Proportion of population below poverty line"
unit: "Percentage"

Node: dcid:obs_001
typeOf: dcs:StatVarObservation
variableMeasured: dcid:undata/sdg/SI_POV_DAY1
observationAbout: dcid:Earth
observationDate: "2020"
value: 8.4
```
**Contains:** Variable definitions AND actual data
**Result:** Charts can be generated! ✅

---

## How to Get Charts for Other Files

You have **3 options**:

### Option 1: Load CSV Data (Quick - 10 mins)
The observations are in CSV files. Example for WHO:

```javascript
// In App.js, modify loadMCFFile():
async function loadMCFFile(fileId) {
  const schemaContent = await fetch(`/datacommons/${fileId}`).then(r => r.text());
  
  // If it's a WHO schema file and has no observations
  if (fileId.includes('who/schema/sv.mcf')) {
    const csvObs = await loadCSVAndConvert('WHO__Adult_curr_tob_use.csv');
    return combineSchemaAndObservations(schemaContent, csvObs);
  }
  
  return schemaContent;
}
```

**Result:** WHO charts work!

### Option 2: Create More Sample Files (Easy - 5 mins per org)
Copy the pattern from `sample-observations.mcf`:
- Pick a few interesting variables
- Add sample observations
- Save as `[org]/sample-observations.mcf`

### Option 3: Batch Convert All CSV Files (Best long-term - 2 hours)
Run a script to convert all 522 WHO CSV files to MCF observations:

```bash
node scripts/convert-all-csv-to-mcf.js
```

**Result:** All files have charts forever!

---

## Console Debug Tips

### Check if Current File Has Observations

```javascript
// After selecting a file, check console for:
"✅ Observations: X"

// If X = 0, no charts will show
// If X > 0, charts should display
```

### See Which Files Loaded
```javascript
// Look for this pattern:
"🔍 Loading MCF file: /datacommons/[org]/[file].mcf"
"✅ Observations: [number]"

// Number > 0 = has charts
// Number = 0 = no charts
```

---

## Current Status Summary

From your console logs:

| File Loaded | Observations | Charts Generated |
|-------------|--------------|------------------|
| sample-observations.mcf | 23 | ✅ 2 charts |
| ilo.mcf | 0 | ❌ 0 charts |
| sdg/q4-2024/schema.mcf | 0 | ❌ 0 charts |
| sdg/q4-2024/sdg.mcf | 0 | ❌ 0 charts |
| sdg/q4-2024/sdg.tmcf | 0 | ❌ 0 charts |
| sdg/q4-2024/unit.mcf | 0 | ❌ 0 charts |
| sdg/q4-2024/sv.mcf | 0 | ❌ 0 charts |

**Only `sample-observations.mcf` has observations, so only it shows charts!**

---

## Next Steps

### Immediate (Test Charts):
1. ✅ Go back to SDG → sample-observations.mcf
2. ✅ Click "Chart" view mode
3. ✅ See 2 working charts!

### Short-term (Enable WHO Charts):
Implement Option 1 above to load CSV data for WHO

### Long-term (All Organizations):
1. Create sample files for ILO, UNICEF
2. OR implement CSV loading
3. OR run batch conversion

---

## FAQ

**Q: Why can I see "Auto-selected 2 charts" but no charts display?**
A: You switched to a different file after. Go back to `sample-observations.mcf` to see them.

**Q: Will SDG Q4 2024 files ever have charts?**
A: Yes, but you need to either:
- Add observations to those files
- Load CSV data that corresponds to those variables
- Create a combined file with both metadata + observations

**Q: How do I know if a file will have charts BEFORE selecting it?**
A: Look at the file size in the logs:
- Small (< 10KB): Probably metadata only
- Large (> 100KB): Might have observations
- Or check console: "Observations: X" after loading

**Q: Can I convert the sv.mcf files to have observations?**
A: Yes! That's what the CSV converter is for. It takes sv.mcf (metadata) + CSV files (data) and combines them.

---

## Pro Tip

Add this to the file selector UI to show which files have charts:

```javascript
// In FileSelector.jsx
{file.hasObservations && <span className="text-green-500">📊</span>}
```

This way users know immediately which files will show charts!

