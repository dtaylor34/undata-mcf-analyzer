# 🗂️ Hierarchical File Selector Guide

## ✨ New Feature: Nested File Selection

The file selector now uses a **hierarchical structure** that matches how you think about the data!

---

## 📊 New Structure

```
Organization (ILO, SDG, UNICEF, WHO)
  ↓
Version (V01, Q4-2024, etc.)
  ↓
Individual Files (schema.mcf, sv.mcf, etc.)
```

---

## 🎯 Two Ways to Select

### 1. **Select Version (Parent) = Load ALL Files Combined**
When you click on a **version folder** (e.g., "ILO V01"):
- ✅ Loads ALL component files (schema.mcf, sv.mcf, unit.mcf, topics.mcf, etc.)
- ✅ Combines them into one view
- ✅ Shows charts! (if observation data available)
- ✅ Perfect for seeing the complete picture

**Visual Indicator**: 📦 Shows "(All files combined)" in the selection summary

### 2. **Select File (Child) = Inspect Individual Parts**
When you click on an **individual file** (e.g., "sv.mcf"):
- ✅ Loads only that specific file
- ✅ Perfect for detailed inspection
- ✅ Great for comparing specific components between versions
- ✅ Lighter and faster for code review

**Visual Indicator**: Individual file name shown in selection summary

---

## 🎬 Visual Example

### The Selector Looks Like This:

```
┌────────────────────────────────────────────────┐
│ Organization Tabs: [🏆 ILO] 🎯 SDG  👶 UNICEF │
│                                                 │
│ 📂 V01 (Current)                  [7 files]    │
│   ├── 📄 schema.mcf  (Base types)              │
│   ├── 📄 sv.mcf  (Statistical variables)       │
│   ├── 📄 unit.mcf  (Units)                     │
│   ├── 📄 ilo_topics.mcf  (Topics)              │
│   ├── 📄 series.mcf  (Series)                  │
│   ├── 📄 ilo_measurement_method.mcf (Methods)  │
│   └── 📄 ilo.mcf  (Master)                     │
│                                                 │
│ Selected: 🏆 ILO V01 📊 (All files combined)   │
└────────────────────────────────────────────────┘
```

---

## 🚀 How to Use

### Example 1: View ILO Complete Package with Charts

**Goal**: See all ILO data together with charts

**Steps**:
1. Click "🏆 ILO" tab
2. Click on "📂 V01 (Current)" folder (the parent)
3. Expands to show all files
4. Content loads ALL 7 files combined
5. Charts appear! ✅

**What You'll See**:
- Combined content with file separators
- All statistical variables from sv.mcf
- All schema definitions
- All topics
- Charts if observation data available

---

### Example 2: Compare Just the Variables File Between Versions

**Goal**: See what changed in `sv.mcf` between Q4 2024 and Q1 2025

**Steps**:
1. Click "🎯 SDG" tab
2. Click "📂 Q4 2024" folder to expand it
3. Click on "📄 sv.mcf" file (the child)
4. Click "Show Diff" button
5. Click "📂 Q1 2025" folder to expand it
6. Click on "📄 sv.mcf" file in Q1 2025
7. Diff viewer shows changes between the two sv.mcf files

**What You'll See**:
- Side-by-side comparison of just sv.mcf
- Line-by-line differences
- Added/removed/modified indicators

---

### Example 3: Inspect Individual Files

**Goal**: Read just the topics file to understand thematic organization

**Steps**:
1. Click "🏆 ILO" tab
2. Expand "📂 V01" folder
3. Click on "📄 ilo_topics.mcf" file
4. Content loads only topics file
5. Easier to read without other files mixed in

---

## 🎨 Visual Indicators

### Folder/Version Level:
- 📂 **Folder icon**: Collapsed version
- 📁 **Open folder icon**: Expanded version
- 📦 **Package check icon**: Complete package (has all files)
- **"7 files"** badge: Shows how many files in this version

### File Level:
- 📄 **File icon**: Individual file
- **Type badge**: `schema`, `variables`, `topics`, `units`, etc.
- **Description**: Short explanation of what the file contains

### Selection State:
- **Blue highlight**: Currently selected (main view)
- **Purple highlight**: Selected for comparison (diff mode)
- **Blue border**: Selected version/file

---

## 🔍 Diff Mode

When comparing versions:

### Compare Complete Packages:
1. Select "ILO V01" (parent)
2. Click "Show Diff"
3. Select "ILO V02" (parent) - future version example
4. Sees diff of ALL files combined

### Compare Individual Files:
1. Select "ILO V01 → sv.mcf" (child)
2. Click "Show Diff"
3. Select "ILO V02 → sv.mcf" (child)
4. Sees diff of just sv.mcf files

### Mixed Comparison:
1. Select "ILO V01" (complete)
2. Click "Show Diff"
3. Select "ILO V01 → sv.mcf" (individual)
4. Compares complete package vs just variables file

**All combinations work!**

---

## 📦 File Types Explained

| Type | File | Purpose | Charts? |
|------|------|---------|---------|
| `schema` | schema.mcf | Base types, enumerations | ❌ No |
| `variables` | sv.mcf | Statistical variables (indicators) | ❌ Needs data |
| `units` | unit.mcf | Measurement units | ❌ No |
| `topics` | *_topics.mcf | Thematic organization | ❌ No |
| `series` | series.mcf | Data series metadata | ❌ No |
| `methods` | *_measurement_method.mcf | Methodology | ❌ No |
| `master` | ilo.mcf, sdg.mcf, etc. | Master reference | ❌ No |
| `template` | *.tmcf | Template MCF for CSV | ❌ No |

**When you select the VERSION (parent)**, all these combine = **Charts!** ✅

---

## 💡 Pro Tips

### Tip 1: Default Behavior
- **By default**: Selecting a version automatically expands it and shows all files
- You can see the structure without extra clicks

### Tip 2: Quick Navigation
- Click organization tabs to quickly switch datasets
- Previously expanded folders stay expanded

### Tip 3: Understanding File Size
- `sv.mcf` is usually the LARGEST file (1,000+ indicators)
- `unit.mcf` is usually tiny (~30 lines)
- Combined files can be 70,000+ lines!

### Tip 4: Performance
- **Individual file**: Loads fast, lightweight
- **Complete package**: Takes 2-3 seconds, but worth it for charts!

### Tip 5: Cached Tab Explorer
- If you want to see thematic areas and charts from live API
- Go to "Cached" tab → Click "🌍 Explorer" button
- Shows organized view from UN Data Commons

---

## 🎯 Use Cases

### Use Case 1: Data Partner Review
**Scenario**: ILO sends updated data, you want to review all changes

**Solution**: 
1. Select "ILO V01" (old)
2. Enable Diff
3. Select "ILO V02" (new) - when available
4. Review complete package differences

---

### Use Case 2: Schema Development
**Scenario**: You're updating age group definitions in schema.mcf

**Solution**:
1. Select "ILO V01 → schema.mcf" (individual file)
2. Click "Edit" mode
3. Make changes
4. Preview impact

---

### Use Case 3: Topic Reorganization
**Scenario**: Checking how indicators are organized into themes

**Solution**:
1. Select "ILO V01 → ilo_topics.mcf"
2. Review thematic structure
3. Or use "Cached → Explorer" for visual organization

---

### Use Case 4: Quality Assurance
**Scenario**: Verify ALL components before deployment

**Solution**:
1. Select "ILO V01" (complete package)
2. Check each tab: MCF, .STAT, DataCommons, Cached
3. Verify charts appear correctly
4. Check transformations work

---

## 🔄 Migration from Old Selector

### What Changed:

**Old Way**:
```
Organization → File Type → Version
🏆 ILO → schema.mcf → (no versions, just one file)
```

**New Way**:
```
Organization → Version → Files
🏆 ILO → V01 → [schema.mcf, sv.mcf, unit.mcf, ...]
```

### Benefits:

| Old | New |
|-----|-----|
| ❌ Had to select each file individually | ✅ Select version = get all files |
| ❌ No way to see complete picture | ✅ Combined view with charts |
| ❌ Unclear file organization | ✅ Clear hierarchical structure |
| ❌ Hard to compare versions | ✅ Easy version comparison |

---

## 🚀 Future Enhancements

When more versions are added:

```
🏆 ILO
  ├── 📂 V01 (Current)      [7 files]
  ├── 📂 V02 (Draft)        [7 files]  ← Future
  └── 📂 V03 (Staging)      [8 files]  ← Future

🎯 SDG
  ├── 📂 Sample Data        [1 file]
  ├── 📂 Q4 2024           [8 files]
  ├── 📂 Q1 2025           [8 files]
  └── 📂 Q2 2025           [5 files]

👶 UNICEF
  ├── 📂 V01 (Current)      [8 files]
  └── 📂 V02 (Draft)        [8 files]  ← Future

🏥 WHO
  ├── 📂 V01 (Current)      [5 files + CSV]
  └── 📂 V02 (Update)       [5 files + CSV]  ← Future
```

Then you can easily compare V01 vs V02, V02 vs V03, etc.!

---

## ✅ Summary

### Key Points:
1. **Version (folder) selection** = Load ALL files combined → See charts
2. **File selection** = Load individual file → Inspect details
3. **Both work with Diff** = Compare versions or individual files
4. **Clear visual indicators** = Know what you're looking at
5. **Flexible** = Mix and match comparisons

### The Power:
- **Before**: 7 clicks to see all ILO files
- **After**: 1 click to see complete ILO package with charts! 🎉

---

**Ready to try it?** Open http://localhost:3000 and click on "🏆 ILO" → "📂 V01 (Current)"!

