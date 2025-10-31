# 📥 MASTER DOWNLOAD CHECKLIST

**Project:** UN Data Commons Figma Integration  
**Status:** Ready to Download & Install  
**Total Files:** 18

---

## ⭐ PRIORITY 1: ESSENTIAL COMPONENTS (Must Download)

### New Figma UI Components

| # | File | Size | Purpose | Link |
|---|------|------|---------|------|
| 1 | **App-FIGMA.jsx** | ~25 KB | Main app with Figma design | [Download](computer:///mnt/user-data/outputs/App-FIGMA.jsx) |
| 2 | **OrganizationSelector.jsx** | ~4 KB | 4 org cards (SDG/ILO/UNICEF/WHO) | [Download](computer:///mnt/user-data/outputs/OrganizationSelector.jsx) |
| 3 | **VersionSelector.jsx** | ~6 KB | Partner versioning system | [Download](computer:///mnt/user-data/outputs/VersionSelector.jsx) |
| 4 | **DiffViewer.jsx** | ~6 KB | Side-by-side comparison | [Download](computer:///mnt/user-data/outputs/DiffViewer.jsx) |
| 5 | **CodeDisplay.jsx** | ~4 KB | Syntax highlighted display | [Download](computer:///mnt/user-data/outputs/CodeDisplay.jsx) |
| 6 | **ChartPreview.jsx** | ~5 KB | Interactive Recharts | [Download](computer:///mnt/user-data/outputs/ChartPreview.jsx) |
| 7 | **QuarterlyComparison.jsx** | ~8 KB | SDG Q4→Q1→Q2 view | [Download](computer:///mnt/user-data/outputs/QuarterlyComparison.jsx) |

**Checklist:**
- [ ] Downloaded all 7 components
- [ ] Placed in `src/components/` folder
- [ ] App-FIGMA.jsx renamed to `src/App.jsx`

---

## ⭐ PRIORITY 2: INTEGRATION GUIDES (Read These)

| # | File | Purpose | Link |
|---|------|---------|------|
| 8 | **PHASE2_INTEGRATION_GUIDE.md** | Step-by-step setup | [Download](computer:///mnt/user-data/outputs/PHASE2_INTEGRATION_GUIDE.md) |
| 9 | **PROJECT_COMPLETE_SUMMARY.md** | Full project overview | [Download](computer:///mnt/user-data/outputs/PROJECT_COMPLETE_SUMMARY.md) |
| 10 | **QUICK_REFERENCE.md** | Quick context | [Download](computer:///mnt/user-data/outputs/QUICK_REFERENCE.md) |

**Checklist:**
- [ ] Read PHASE2_INTEGRATION_GUIDE.md
- [ ] Reviewed PROJECT_COMPLETE_SUMMARY.md
- [ ] Kept QUICK_REFERENCE.md handy

---

## ⭐ PRIORITY 3: DATA & BACKEND (If Not Already Copied)

| # | File | Size | Purpose | Link |
|---|------|------|---------|------|
| 11 | **real-catalog.js** | ~4 KB | 36,511 indicators | [Download](computer:///mnt/user-data/outputs/real-catalog.js) |
| 12 | **data-layer-UPDATED.js** | ~9 KB | Data access layer | [Download](computer:///mnt/user-data/outputs/data-layer-UPDATED.js) |

**Checklist:**
- [ ] `real-catalog.js` in `src/`, `src/components/`, `src/undata-integration/`
- [ ] `data-layer-UPDATED.js` in `src/undata-integration/`

---

## 📚 REFERENCE DOCS (Optional)

| # | File | Purpose | Link |
|---|------|---------|------|
| 13 | **ACTION_PLAN_FIGMA_INTEGRATION.md** | Master plan | [Download](computer:///mnt/user-data/outputs/ACTION_PLAN_FIGMA_INTEGRATION.md) |
| 14 | **CURRENT_STATUS.md** | Status tracker | [Download](computer:///mnt/user-data/outputs/CURRENT_STATUS.md) |
| 15 | **FILE_INVENTORY.md** | All files list | [Download](computer:///mnt/user-data/outputs/FILE_INVENTORY.md) |
| 16 | **MASTER_INDEX.md** | Package index | [Download](computer:///mnt/user-data/outputs/MASTER_INDEX.md) |
| 17 | **VISUAL_COMPARISON.md** | Before/after | [Download](computer:///mnt/user-data/outputs/VISUAL_COMPARISON.md) |
| 18 | **INTEGRATION_SUMMARY.md** | Original integration guide | [Download](computer:///mnt/user-data/outputs/INTEGRATION_SUMMARY.md) |

---

## 📋 FILE PLACEMENT GUIDE

### Where to Put Each File:

```
/Users/dt/undata/undata-mcf-analyzer/
├── src/
│   ├── App.jsx                           ← App-FIGMA.jsx (REPLACE)
│   │
│   ├── components/
│   │   ├── OrganizationSelector.jsx     ← NEW
│   │   ├── VersionSelector.jsx          ← NEW
│   │   ├── DiffViewer.jsx               ← NEW
│   │   ├── CodeDisplay.jsx              ← NEW
│   │   ├── ChartPreview.jsx             ← NEW
│   │   ├── QuarterlyComparison.jsx      ← NEW
│   │   └── real-catalog.js              ← Copy here
│   │
│   ├── undata-integration/
│   │   ├── data-layer.js                ← Replace with data-layer-UPDATED.js
│   │   └── real-catalog.js              ← Copy here
│   │
│   └── real-catalog.js                   ← Copy here
│
└── docs/                                 ← Create for documentation
    ├── PHASE2_INTEGRATION_GUIDE.md
    ├── PROJECT_COMPLETE_SUMMARY.md
    └── [other docs...]
```

---

## ⚡ QUICK INSTALL COMMANDS

### Step 1: Backup Current App
```bash
cd /Users/dt/undata/undata-mcf-analyzer
cp src/App.jsx src/App-BACKUP-$(date +%Y%m%d).jsx
```

### Step 2: Copy Downloaded Files
```bash
# Assuming files are in ~/Downloads/

# Main app
cp ~/Downloads/App-FIGMA.jsx src/App.jsx

# Components
cp ~/Downloads/OrganizationSelector.jsx src/components/
cp ~/Downloads/VersionSelector.jsx src/components/
cp ~/Downloads/DiffViewer.jsx src/components/
cp ~/Downloads/CodeDisplay.jsx src/components/
cp ~/Downloads/ChartPreview.jsx src/components/
cp ~/Downloads/QuarterlyComparison.jsx src/components/

# Data layer (if not already done)
cp ~/Downloads/data-layer-UPDATED.js src/undata-integration/data-layer.js

# Catalog (to all locations)
cp ~/Downloads/real-catalog.js src/
cp ~/Downloads/real-catalog.js src/components/
cp ~/Downloads/real-catalog.js src/undata-integration/
```

### Step 3: Verify
```bash
# Check all files exist
ls src/App.jsx
ls src/components/OrganizationSelector.jsx
ls src/components/VersionSelector.jsx
ls src/components/DiffViewer.jsx
ls src/components/CodeDisplay.jsx
ls src/components/ChartPreview.jsx
ls src/components/QuarterlyComparison.jsx
```

### Step 4: Start
```bash
npm start
```

---

## ✅ VERIFICATION CHECKLIST

### After Starting App:

#### Visual Checks:
- [ ] App loads without errors
- [ ] Header shows "🗄️ MCF Pipeline Viewer"
- [ ] Dark/Light toggle visible (☀️ 🌙)
- [ ] 4 organization cards display
- [ ] Real numbers showing (not "4 indicators")

#### Functional Checks:
- [ ] Click organization → version selector appears
- [ ] Select indicator from dropdown
- [ ] Tabs display (Raw/Formatted/.STAT/DC/Cached/Chart)
- [ ] Dark mode toggle works
- [ ] Version selector functional
- [ ] Diff toggle button present

#### SDG Specific:
- [ ] SDG card shows "3 quarters"
- [ ] Click SDG → quarterly comparison displays
- [ ] Q4-2024, Q1-2025, Q2-2025 visible
- [ ] Growth/decline percentages shown

#### Data Checks:
- [ ] ILO shows "7,121 indicators"
- [ ] UNICEF shows "2,389 indicators"
- [ ] WHO shows "21,531 indicators"
- [ ] Total: 36,511 indicators visible somewhere

#### Chart Checks:
- [ ] Select indicator
- [ ] Click "Chart" tab
- [ ] Recharts visualization displays
- [ ] No console errors

---

## 🔧 TROUBLESHOOTING

### Issue: "Cannot find module"
**Fix:**
```bash
# Ensure files in correct locations
ls -la src/components/OrganizationSelector.jsx
ls -la src/real-catalog.js
```

### Issue: Charts not rendering
**Fix:**
```bash
# Verify recharts installed
npm list recharts
# If not: npm install recharts
```

### Issue: Styling looks off
**Solution:** Components use inline styles, should work without Tailwind

### Issue: Dark mode not working
**Check:** Browser console for errors, verify toggle button visible

---

## 📊 PROGRESS TRACKER

```
Download Progress:
[  ] 0/7   Components
[  ] 0/3   Integration Guides
[  ] 0/2   Data/Backend
[  ] 0/6   Reference Docs

Installation Progress:
[  ] Backed up current app
[  ] Copied components
[  ] Verified file locations
[  ] Started app
[  ] Tested features

Total Progress: 0/18 files
```

---

## 🎯 SUCCESS CRITERIA

You're done when ALL these are true:

✅ **Downloaded:**
- All 7 component files
- At least 2 integration guides
- Data layer files (if needed)

✅ **Installed:**
- Components in `src/components/`
- App-FIGMA.jsx as `src/App.jsx`
- real-catalog.js in 3 locations

✅ **Tested:**
- App starts without errors
- Real data displays (36,511)
- Dark/Light mode works
- Version selector functional
- Charts render

✅ **Verified:**
- No console errors
- All tabs work
- Diff viewer functional
- Quarterly comparison shows (SDG)

---

## 🎉 COMPLETION REWARD

When all checkboxes are ✅, you'll have:

🎨 **Beautiful Figma UI**  
📊 **Real 36,511 Indicators**  
🔄 **Partner Versioning**  
⚖️ **Diff Viewer**  
📈 **Quarterly Tracking**  
🌙 **Dark/Light Mode**  
💎 **Professional Dashboard**

**Ready to show your team!** 🚀

---

**Last Updated:** October 31, 2025  
**Total Files:** 18  
**Total Size:** ~150 KB  
**Estimated Install Time:** 10 minutes

---

**START HERE:** Download files 1-7, then read file 8! 👆
