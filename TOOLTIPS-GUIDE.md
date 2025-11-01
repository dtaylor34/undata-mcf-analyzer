# 💬 Tooltips Guide: Understanding Visual Indicators

All visual elements now have tooltips! Hover over any icon, badge, or indicator to see what it means.

---

## 🎯 Hover Anywhere for Help

Every visual element in the file selector has a helpful tooltip. Just **hover your mouse** over:
- ☑️ Checkboxes
- 📦 Green icons
- 🏷️ Type badges
- 📁 Folder icons
- 📊 Status indicators

---

## 📦 Complete Package Icon (Green)

**Visual**: 📦 Green icon next to version name

**Hover to see**:
```
✅ Complete Package
All component files included. Selecting this loads 
all files combined with charts.
```

**When it appears**: Next to versions that have all standard files (schema, variables, topics, units, series, methods)

**Example**: "V01 (Current) 📦" means this is a complete package

---

## ☑️ Checkboxes (Three States)

### 1. Checked (Blue Fill)

**Visual**: ☑️ Blue checkbox with checkmark

**Hover to see**:
```
☑️ All files loaded: Click to deselect
```

**Meaning**: Complete version selected, all files combined

---

### 2. Indeterminate (Blue Dash)

**Visual**: ⊟ Blue border with horizontal line

**Hover to see**:
```
⊟ One file selected: Click to load all files
```

**Meaning**: Only ONE file from this version is loaded (partial selection)

---

### 3. Empty (Gray Border)

**Visual**: ☐ Gray empty checkbox

**Hover to see**:
```
☐ Not loaded: Click to load all files
```

**Meaning**: Nothing from this version is loaded

---

## 🏷️ File Type Badges

Each file has a colored badge showing its type. Hover for detailed explanation!

### Variables (Green)
**Badge**: `variables` in green
**Hover**: "Statistical Variables: Defines indicators (what can be measured). Charts come from these!"

### Schema (Blue)
**Badge**: `schema` in blue
**Hover**: "Schema: Base types, enumerations, and property definitions"

### Topics (Purple)
**Badge**: `topics` in purple
**Hover**: "Topics: Organizes indicators into UN thematic areas"

### Units (Yellow)
**Badge**: `units` in yellow
**Hover**: "Units: Measurement units (%, persons, dollars, etc.)"

### Series (Orange)
**Badge**: `series` in orange
**Hover**: "Series: Data series metadata and source information"

### Methods (Pink)
**Badge**: `methods` in pink
**Hover**: "Methods: Measurement and collection methodologies"

### Master (Gray)
**Badge**: `master` in gray
**Hover**: "Master: Main reference file that imports/combines others"

### Template (Gray)
**Badge**: `template` in gray
**Hover**: "Template: TMCF template for CSV to MCF conversion"

### Observations (Gray)
**Badge**: `observations` in gray
**Hover**: "Observations: Contains actual data values for charts"

---

## 📁 Folder Icons

**Visual**: 📁 Yellow folder icon

**Collapsed folder** (►):
**Hover**: "Version folder (collapsed) - Click to expand"

**Expanded folder** (▼):
**Hover**: "Version folder (expanded)"

---

## 🔽 Expand/Collapse Buttons

**Visual**: ▶️ or ▼ arrow button

**Collapsed** (▶️):
**Hover**: "Expand to show individual files"

**Expanded** (▼):
**Hover**: "Collapse to hide files"

---

## 📊 File Count Badge

**Visual**: Gray rounded badge like "7 files"

**Hover to see**:
```
This version contains 7 MCF files
```

**With CSV**:
```
This version contains 7 MCF files plus CSV observation data
```

---

## 📊 "All Files Combined" Indicator

**Visual**: 📊 (All files combined) in green at bottom

**Hover to see**:
```
All files in this version are loaded and combined. 
Charts will be generated from the complete dataset.
```

**When it appears**: When a version (parent) is selected, not individual files

---

## 💼 Individual File Checkboxes

**When checked** (file is loaded):
**Hover**: `☑️ filename.mcf loaded: Click to deselect`

**When unchecked** (file not loaded):
**Hover**: `☐ filename.mcf not loaded: Click to load just this file`

---

## 🎨 Color Coding Reference

| Color | Element | Meaning |
|-------|---------|---------|
| 🟦 Blue | Checkboxes, borders | Active selection |
| 🟩 Green | Package icon, "variables" badge | Complete/ready/main content |
| 🟨 Yellow | Folder icons, "units" badge | Navigation/organization |
| 🟪 Purple | "topics" badge | Thematic organization |
| 🟧 Orange | "series" badge | Data series |
| 🩷 Pink | "methods" badge | Methodology |
| ⬜ Gray | Unchecked, inactive | Not selected |

---

## 🎯 Tooltip Behavior

### How to Trigger:
- **Hover** your mouse over any visual element
- **Wait** ~0.5 seconds
- **Tooltip appears** with explanation

### Where Tooltips Appear:
- ✅ Version checkboxes (3 states)
- ✅ File checkboxes
- ✅ Package check icon (📦)
- ✅ File type badges
- ✅ File count badges
- ✅ Folder icons
- ✅ Expand/collapse buttons
- ✅ "All files combined" indicator

---

## 📚 Example Workflows with Tooltips

### Scenario 1: New User Exploring

**Action**: Opens app, sees file selector

**Hovers over**:
1. **📦 Green icon** → Tooltip: "Complete Package..."
2. **☑️ Checkbox** → Tooltip: "All files loaded..."
3. **`variables` badge** → Tooltip: "Statistical Variables..."

**Result**: Understands the interface instantly!

---

### Scenario 2: User Comparing Files

**Action**: Wants to know what's selected

**Hovers over**:
1. **Parent checkbox** → ⊟ Tooltip: "One file selected: Click to load all files"
2. **`sv.mcf` checkbox** → ☑️ Tooltip: "sv.mcf loaded: Click to deselect"

**Result**: Knows exactly what's loaded (just sv.mcf, not the whole version)

---

### Scenario 3: Understanding File Types

**Action**: Wonders what "variables" means

**Hovers over**:
1. **Green `variables` badge** → Tooltip: "Statistical Variables: Defines indicators... Charts come from these!"

**Result**: Understands this is the main file for charts!

---

## 💡 Tooltip Tips

### 1. **Cursor Style**
Elements with tooltips show `cursor-help` (question mark cursor) to indicate more info is available

### 2. **Enhanced Tooltips**
Some elements (like 📦 icon) have **rich tooltips** that appear on hover with formatted content

### 3. **Accessible**
All tooltips use standard HTML `title` attribute, so they work with:
- Screen readers
- Browser extensions
- Keyboard navigation (when focused)

---

## 🔍 Quick Reference: What Each Tooltip Tells You

| Element | Question Answered |
|---------|-------------------|
| **Checkbox states** | "What's loaded?" |
| **📦 Green icon** | "What does 'complete' mean?" |
| **Type badges** | "What is this file for?" |
| **File count** | "How many files?" |
| **Folder icons** | "How do I expand?" |
| **"All files combined"** | "What does this mean?" |

---

## 🎓 Learning Path

For new users, hover over elements in this order to learn the interface:

1. **💡 Info banner** (read first)
2. **📦 Green icon** (understand complete packages)
3. **☑️ Checkbox** (understand selection)
4. **Type badges** (understand file purposes)
5. **Expand button** (learn navigation)

After these 5 tooltips, you'll understand the entire interface!

---

## 🚀 Try It Now!

The server is running at **http://localhost:3000**

### Hover Over These:
1. The **📦 green icon** next to "Q4 2024"
2. The **☑️ checkbox** next to "V01 (Current)"
3. The **green `variables` badge** on sv.mcf
4. The **"7 files"** badge
5. The **📊 (All files combined)** text at bottom

Each will show you helpful information!

---

## ✅ Summary

**Before**: Visual indicators with no explanation  
**After**: Every element has a helpful tooltip!

**Hover over**:
- ✅ Checkboxes → See selection state
- ✅ 📦 Icons → Understand package status  
- ✅ Type badges → Learn file purposes
- ✅ Counters → See totals
- ✅ Indicators → Understand status

**No more guessing!** Just hover and learn. 🎉

