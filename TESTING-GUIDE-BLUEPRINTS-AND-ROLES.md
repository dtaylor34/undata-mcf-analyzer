# Testing Guide: Blueprints & Role-Based Access

## ✅ What's Been Implemented

### 1. **Transformation Blueprints** 📚
- MCF Structure Blueprint
- MCF → .STAT Transformation Blueprint
- MCF → DataCommons Transformation Blueprint
- MCF → Cached JSON Transformation Blueprint
- Blueprint viewer modal with detailed explanations

### 2. **Admin vs Partner Access** 🔐
- Role selector (Admin only)
- Role-based filtering (Partners see only their organization's data)
- Partner-specific actions (Approve Data, Request Changes)
- Admin-specific actions (Generate MCF, Deploy)

---

## 🧪 Test Scenario 1: Blueprint Links

### As Admin:
1. **Open Data Ingestion Dashboard**
   - Click "Data Ingestion" button

2. **View ILO Test Data**
   - Find "ILO: TEST Q4 2024" version
   - Click the Eye icon 👁️

3. **Test MCF Blueprint**
   - Click the **"MCF"** tab
   - Click **"View MCF Structure"** button
   - Modal should show:
     - StatisticalVariable structure
     - StatVarObservation structure
     - Required fields
     - Code examples
     - Key principles

4. **Test .STAT Blueprint**
   - Click the **".STAT"** tab
   - Click **"MCF → .STAT Blueprint"** button
   - Modal should show:
     - Step-by-step transformation rules
     - SDMX-JSON structure
     - Field mapping examples
     - Before/after code comparison

5. **Test DataCommons Blueprint**
   - Click the **"DataCommons"** tab
   - Click **"MCF → DataCommons Blueprint"** button
   - Modal should show:
     - Schema.org transformation
     - Variable and observation mapping
     - Provenance handling
     - Example output

6. **Test Cached Blueprint**
   - Click the **"Cached"** tab
   - Click **"MCF → Cached Blueprint"** button
   - Modal should show:
     - Location-based caching strategy
     - Theme-based caching strategy
     - Performance optimizations
     - Multiple file examples

---

## 🧪 Test Scenario 2: ILO Partner Access

### As Admin (Switch to Partner View):
1. **Switch Role**
   - In header, find "View as:" dropdown
   - Select **"ILO Partner"**
   - Header should show blue badge: "ILO Partner"

2. **Verify Filtering**
   - Should see ONLY ILO datasets
   - SDG and UNICEF data should be hidden
   - Count in filter buttons should reflect ILO data only

3. **Test Partner Actions on MCF Data**
   - Find "SDG: Q3 2025" (status: MCF)
   - Should see two buttons:
     - ✓ **Approve Data** (green)
     - 📝 **Request Changes** (orange border)
   - NO "Approve & Deploy" menu (Admin only)

4. **Test Approve Workflow**
   - Click **"✓ Approve Data"**
   - Confirmation dialog should appear
   - Shows: Dataset name, organization, approval message
   - Click OK
   - Success message: "Approved! UN Data team will be notified"

5. **Test Request Changes Workflow**
   - Click **"📝 Request Changes"**
   - Prompt dialog should appear
   - Enter feedback: "Please update Q3 employment figures for AFG"
   - Click OK
   - Success message: "Feedback submitted! You will be notified"

6. **Test View Formats**
   - Click Eye icon 👁️ on ILO dataset
   - Should see all tabs: CSV | MCF | .STAT | DataCommons | Cached
   - Click through tabs to preview data in different formats
   - Blueprint buttons should work for ALL formats

---

## 🧪 Test Scenario 3: Format Conversions

### Using ILO Test Data:
1. **Generate MCF** (if not already done)
   - Switch to Admin view
   - Find "ILO: TEST Q4 2024"
   - Click **"Generate MCF"**
   - Success message should appear

2. **Deploy to .STAT**
   - Click **"Approve & Deploy"** dropdown
   - Select **"Deploy to .STAT"**
   - Watch progress:
     - "Converting MCF to SDMX-JSON 2.0..."
     - "Generating SDMX structure..."
     - "Saving .STAT file..."
     - "✅ Success! Deployed to .STAT"
   - Checkbox should be checked

3. **View .STAT Content**
   - Click Eye icon 👁️
   - Click **.STAT** tab
   - Should show ACTUAL SDMX-JSON code (not example)
   - Click **"MCF → .STAT Blueprint"** to see transformation rules

4. **Deploy to DataCommons**
   - Click **"Deploy to DataCommons"**
   - Watch progress
   - Success message should appear

5. **View DataCommons Content**
   - Click **DataCommons** tab
   - Should show ACTUAL DataCommons JSON (not example)
   - Click **"MCF → DataCommons Blueprint"** to see transformation rules

6. **Deploy to UN Data**
   - Click **"Deploy to UN Data"**
   - Watch cache generation progress
   - Success with file count

7. **View Cached Content**
   - Click **Cached** tab
   - Should show cache statistics
   - Click **"MCF → Cached Blueprint"** to see caching strategy

---

## ✅ Expected Results Summary

### Blueprints:
- ✅ All 4 blueprint buttons work
- ✅ Modals show detailed transformation rules
- ✅ Examples include real code snippets
- ✅ Close button works

### Admin View:
- ✅ Sees ALL organizations (ILO, SDG, UNICEF)
- ✅ Has "Generate MCF" button
- ✅ Has "Approve & Deploy" menu
- ✅ Can deploy to all formats
- ✅ Can switch between role views

### Partner View (ILO):
- ✅ Sees ONLY ILO data
- ✅ Has "Approve Data" button (MCF stage)
- ✅ Has "Request Changes" button
- ✅ Can view all formats via Eye icon
- ✅ Can view blueprints
- ✅ NO Generate MCF button
- ✅ NO Approve & Deploy menu

### Format Conversions:
- ✅ .STAT generates actual SDMX-JSON
- ✅ DataCommons generates actual Schema.org JSON
- ✅ Cached generates optimized files
- ✅ All show real converted data (not examples)

---

## 🐛 Troubleshooting

**Blueprint modal doesn't appear:**
- Check console for errors
- Ensure server is running on port 3000
- Hard refresh (Cmd+Shift+R)

**Role selector not visible:**
- Only visible when `userRole='admin'` is passed to DataIngestionDashboard
- Check App.js props

**Can't see ILO data as partner:**
- Ensure role is set to "ILO Partner" (not "partner")
- Check that ILO test data exists in versions list
- Verify `effectiveOrganization` is set to 'ILO'

**Formats not deployed:**
- Must generate MCF first before deploying
- Admin access required for deployment
- Check localStorage for saved content

---

## 📋 Next Steps

After testing, you can:
1. Add real API calls for approval/feedback
2. Implement email notifications
3. Add revision history
4. Create partner dashboard with approval queue
5. Add chart preview in each format
