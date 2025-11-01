# V02 Feature Testing Guide

Welcome to V02! This guide will help you test all 4 new features.

---

## 🎯 Quick Start - Test All Features in 5 Minutes

### **1. URL Sharing & Permission System** ✅

**What to Test:**
- URL updates automatically as you navigate
- Share button copies URL to clipboard
- Permission badge shows in header

**Steps:**
1. Open app: `http://localhost:3000`
2. Look for permission badge in header (should show "👤 User" or "👑 Admin")
3. Select: WHO → sv.mcf
4. Notice URL updates: `?org=who&file=schema/sv.mcf`
5. Click **Share** button in header
6. Paste URL in new tab - should load same view!

**Expected Results:**
- ✅ URL changes as you interact with app
- ✅ Share button shows "Copied!" after clicking
- ✅ Pasted URL loads exact same state
- ✅ Permission badge visible

---

### **2. CSV Data Integration** ✅

**What to Test:**
- DataSourceSelector appears for schema files
- Can select and add CSV files
- Charts generate from combined data

**Steps:**
1. Select: WHO → sv.mcf
2. **Yellow box appears** below file selector: "⚠️ This file needs data sources"
3. From dropdown, select: `WHO__Adult_curr_tob_use.csv`
4. Click **[+ Add]**
5. Status updates: "✅ Ready to combine: Schema + 1 data source(s)"
6. Go to **MCF** tab → Click **Chart** button
7. **Charts appear!** 📊

**Expected Results:**
- ✅ Yellow DataSourceSelector box appears
- ✅ Dropdown shows 30+ WHO CSV options
- ✅ Can add/remove data sources
- ✅ Charts generate from combined data

**Try Multiple Sources:**
1. Add another CSV: `WHO__MALARIA_EST_CASES.csv`
2. Status shows: "Schema + 2 data source(s)"
3. Charts update with combined observations

---

### **3. Dynamic Charts Across All Tabs** ✅

**What to Test:**
- Charts work in all 4 tabs (MCF, .STAT, DataCommons, Cached)
- Charts use combined MCF+CSV data
- Chart filter works

**Steps:**
1. With WHO sv.mcf + CSV selected (from Test #2)
2. Go to each tab and click **Chart** button:
   - **MCF Tab → Chart** ✅
   - **.STAT Tab → Chart** ✅
   - **DataCommons Tab → Chart** ✅
   - **Cached Tab → Chart** ✅
3. All tabs show same charts (data consistency!)
4. Click **Filter Charts (X/X)** dropdown
5. Uncheck "All" → Select specific charts
6. Only selected charts display

**Expected Results:**
- ✅ Charts appear in all 4 tabs
- ✅ Same data across all tabs
- ✅ Chart filter works
- ✅ Metadata shows (title, description, unit, observations)

---

### **4. URL Sharing with Data Sources** ✅

**What to Test:**
- URL includes data sources
- Shared URL loads with data sources pre-selected

**Steps:**
1. Select: WHO → sv.mcf
2. Add CSV: `WHO__Adult_curr_tob_use.csv`
3. Go to: MCF → Chart
4. Look at URL:
   ```
   ?org=who&file=schema/sv.mcf&data=WHO__Adult_curr_tob_use.csv&tab=raw&view=chart
   ```
5. Click **Share** button
6. Open in new tab
7. **Data source pre-selected** + **Charts already visible**!

**Expected Results:**
- ✅ URL includes `data=` parameter
- ✅ Pasted URL loads with CSV pre-selected
- ✅ Charts appear immediately
- ✅ No need to re-select data sources

---

## 🎨 Visual Checklist

### **Header:**
```
┌────────────────────────────────────────────────────┐
│ 🗄️ MCF Pipeline Viewer [👤 User]  [🔗 Share] ☀️🌙 │
└────────────────────────────────────────────────────┘
```

### **DataSourceSelector (for schema files):**
```
┌────────────────────────────────────────────────────┐
│ ⚠️ This file needs data sources                    │
│                                                     │
│ [Dropdown: Select CSV file...] [+ Add]            │
│                                                     │
│ ✓ WHO__Adult_curr_tob_use.csv              [X]    │
│ ✓ WHO__MALARIA_EST_CASES.csv               [X]    │
│                                                     │
│ ✅ Ready to combine: Schema + 2 data source(s)    │
└────────────────────────────────────────────────────┘
```

### **Tab View Modes:**
```
[MCF] [.STAT] [DataCommons] [Cached]

   [Formatted] [Raw] [YAML] [Chart] [Edit]
   
   📊 Charts Generated from Combined Data
```

---

## 🔧 Admin Features (Test with Admin Permissions)

### **Set Yourself as Admin:**

Open browser console and run:
```javascript
localStorage.setItem('currentUser', 'admin@undata.org');
location.reload();
```

**You should see:**
- Header badge changes to: **"👑 Admin"**
- Full access to all organizations/files

### **Test Token-Based Access:**

Add `?token=tok_who_tobacco` to URL:
```
http://localhost:3000?token=tok_who_tobacco
```

**Expected:**
- Access restricted to WHO data
- Only specific CSV files available

---

## 🐛 Troubleshooting

### **Charts Not Appearing:**
1. Check console for errors
2. Ensure CSV file selected and added
3. Verify file has observations (not just variables)

### **DataSourceSelector Not Showing:**
1. Ensure you selected a **schema file** (like `sv.mcf`)
2. Schema files don't have observations (need CSV)
3. Sample files (like `sample-observations.mcf`) already have data - no selector needed

### **URL Not Updating:**
1. Check browser console for errors
2. Ensure no JavaScript errors blocking state updates

### **Permission Errors:**
1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Default is guest mode (limited access)

---

## 📊 Test Scenarios

### **Scenario A: New User Workflow**
1. Open app (guest mode)
2. Browse limited data
3. Receive share link from admin
4. Open link → auto-loaded with specific data

### **Scenario B: Admin Workflow**
1. Set admin permissions
2. Explore all organizations
3. Select WHO → sv.mcf
4. Add multiple CSV files
5. Generate charts
6. Share link with colleague

### **Scenario C: Researcher Workflow**
1. Open shared link with token
2. Data pre-loaded with CSV sources
3. View charts across all tabs
4. Edit MCF in Edit mode
5. Preview changes before applying

---

## ✅ Feature Completion Checklist

- [x] **URL Sharing** - State encoded in URL, shareable
- [x] **Permissions** - Admin/User roles, token-based access
- [x] **CSV Integration** - 30+ WHO CSV files, TMCF conversion
- [x] **Dynamic Charts** - Work across all tabs, use combined data

---

## 🚀 What's New in V02

| Feature | Description | Status |
|---------|-------------|--------|
| **URL State Management** | All app state in URL for sharing | ✅ Complete |
| **ShareButton** | One-click URL copying | ✅ Complete |
| **Permission System** | Role-based access control | ✅ Complete |
| **DataSourceSelector** | UI to combine schema + CSV | ✅ Complete |
| **Enhanced CSV Parsing** | RFC 4180 compliant, handles quotes | ✅ Complete |
| **30+ CSV Files** | Expanded WHO data manifest | ✅ Complete |
| **Dynamic Chart Generation** | Charts from combined MCF+CSV | ✅ Complete |
| **Cross-Tab Consistency** | Same data in all tabs | ✅ Complete |

---

**Happy Testing! 🎯**

*Questions? Check the console logs for detailed debug information.*

