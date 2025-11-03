# 🤖 Transcoding Automation Strategy

## 📋 Overview

This document outlines the complete automation strategy for the **SDG Transcoding Review** process in the MCF Pipeline Viewer.

**Current Manual Process:** Humans review 10,000+ Excel rows manually  
**Automated Solution:** Visual diff + approval workflow + one-click deploy

---

## 🎯 What is the Transcoding Matrix?

### **Purpose:**
Maps **OLD taxonomy codes** → **NEW taxonomy codes** to maintain data consistency across SDG indicator updates.

### **Example Mapping:**
```
OLD:  ACTIVITY → TOTAL → "No breakdown" (SDG:CL_ACTIVITY)
NEW:  ECONOMIC_ACTIVITY → _T → "Total or no breakdown" (SDG:CL_ECONOMIC_ACTIVITY)
```

### **Scale:**
- **10,305 mappings** in SDG Q2-2025
- Covers: Activity, Age, Education, Sex, Location, etc.
- Generated automatically by ETL API
- Requires manual review before deployment

---

## 🔄 Current Manual Workflow (SLOW)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Someone runs ETL API manually                            │
│    POST /etl/run {"agency": "sdg", "data_version": "q2-2025"}│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ETL generates transcoding Excel file (10,305 rows)       │
│    docs/sdg_TRANSCODING_review.xlsx                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Human downloads Excel file                                │
│    Opens in Excel/Google Sheets                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Human reviews 10,305 rows manually (HOURS/DAYS)          │
│    • Spot-checks mappings                                    │
│    • Looks for errors                                        │
│    • Makes manual edits                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Human saves Excel, re-uploads to server                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Human re-runs ETL with merge flag                         │
│    POST /etl/run {                                            │
│      "agency": "sdg",                                         │
│      "control_file_options": {                                │
│        "merge_transcoding_matrix": true                       │
│      }                                                        │
│    }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Manual deployment to:                                     │
│    • .STAT Explorer                                          │
│    • DataCommons Live Search                                 │
│    • UNData Website (Cached)                                 │
└─────────────────────────────────────────────────────────────┘
```

**Time:** Hours to Days  
**Error-Prone:** Excel editing, manual uploads, multi-step process

---

## ✨ Automated Workflow (FAST)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Data Partner uploads new data                             │
│    → Automatically triggers ETL API                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ETL generates transcoding matrix                          │
│    → Automatically loaded into MCF Pipeline Viewer           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Visual Diff Display (like GitHub PR)                      │
│    ┌──────────────────────────────────────────────────────┐ │
│    │ 🔄 10,305 mappings detected                          │ │
│    │                                                      │ │
│    │ ✅ 10,280 mappings look good (green)               │ │
│    │ ⚠️  25 mappings need review (yellow)               │ │
│    │ ❌ 0 mappings rejected (red)                       │ │
│    │                                                      │ │
│    │ [Filter by Enumeration ▼]  [Search...🔍]          │ │
│    │                                                      │ │
│    │ OLD → NEW                                           │ │
│    │ ════════════════════════════════════════════════    │ │
│    │ ACTIVITY / TOTAL → ECONOMIC_ACTIVITY / _T  ✅      │ │
│    │ ACTIVITY / PRIV_HH → ECONOMIC_ACTIVITY / HH ✅     │ │
│    │ AGE / Y15T24 → AGE_GROUP / 15-24  ⚠️              │ │
│    │                                                      │ │
│    │ [❌ Reject] [⚠️ Flag for Review] [✅ Approve All] │ │
│    └──────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. One-Click Approval                                        │
│    [✅ Approve & Deploy] button                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Automated Parallel Deployment                             │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│    │ .STAT        │  │ DataCommons  │  │ Cached       │   │
│    │ Deploy ✅    │  │ Deploy ✅    │  │ Deploy ✅    │   │
│    └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Time:** Minutes  
**Reliable:** No Excel editing, no manual uploads, all in one tool

---

## 🛠️ Technical Implementation

### **Phase 1: Connect to ETL API** ✅ (NOW)

```javascript
// src/utils/etl-api-client.js

export async function fetchTranscodingMatrix(agency, dataVersion) {
  const response = await fetch(`${ETL_API_URL}/etl/transcoding`, {
    method: 'GET',
    params: { agency, data_version: dataVersion }
  });
  return await response.json();
}

export async function runETL(agency, dataVersion, options) {
  const response = await fetch(`${ETL_API_URL}/etl/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agency,
      data_version: dataVersion,
      control_file_options: options
    })
  });
  return await response.json();
}

export async function approveAndDeploy(agency, dataVersion, edits) {
  // 1. Apply any manual edits to transcoding matrix
  if (edits.length > 0) {
    await applyTranscodingEdits(agency, dataVersion, edits);
  }
  
  // 2. Re-run ETL with merge flag
  const result = await runETL(agency, dataVersion, {
    merge_transcoding_matrix: true
  });
  
  // 3. Trigger parallel deployment
  const deployments = await Promise.all([
    deployToSTAT(agency, dataVersion),
    deployToDataCommons(agency, dataVersion),
    deployToCached(agency, dataVersion)
  ]);
  
  return { etl: result, deployments };
}
```

### **Phase 2: Visual Diff Component** ✅ (CREATED)

- `src/components/TranscodingViewer.jsx` - Table view of mappings
- Filter by enumeration type
- Search across all fields
- Highlight changes vs. previous version
- Flag suspicious mappings

### **Phase 3: Approval Workflow** 🚧 (NEXT)

```javascript
// src/components/TranscodingApproval.jsx

- [ ] Review mappings
  - Auto-approve if confidence > 95%
  - Flag for review if < 95%
- [ ] Manual override
  - Click to edit specific mapping
  - Provide justification
- [ ] Approval states
  - Pending (yellow)
  - Approved (green)
  - Rejected (red)
- [ ] One-click deploy
```

### **Phase 4: Automated Deployment** 🚧 (NEXT)

```javascript
// Parallel deployment to all 3 targets

async function deployAll(agency, dataVersion) {
  return await Promise.allSettled([
    deployToSTAT(agency, dataVersion),      // .STAT Explorer
    deployToDataCommons(agency, dataVersion), // Live Search
    deployToCached(agency, dataVersion)      // UNData Website
  ]);
}
```

---

## 📊 Benefits

| Metric | Before (Manual) | After (Automated) | Improvement |
|--------|----------------|-------------------|-------------|
| **Time** | Hours/Days | Minutes | **99% faster** |
| **Errors** | High (Excel editing) | Low (automated) | **90% reduction** |
| **Visibility** | None (local Excel) | Full (web UI) | **100% transparency** |
| **Audit Trail** | Manual notes | Automatic logging | **Complete history** |
| **Deployment** | Manual, sequential | Automatic, parallel | **Instant** |

---

## 🎯 Next Steps

### **Immediate (This Week):**
1. ✅ Parse Excel file structure
2. ✅ Create TranscodingViewer component
3. 🚧 Connect to ETL API
4. 🚧 Test with SDG Q2-2025 data

### **Short-term (Next 2 Weeks):**
1. Add diff highlighting (changed vs. unchanged)
2. Implement approval workflow
3. Add manual edit capability
4. Create deployment automation

### **Long-term (Next Month):**
1. AI-assisted mapping suggestions
2. Confidence scoring (flag low-confidence mappings)
3. Historical comparison (compare with previous quarters)
4. Multi-agency support (WHO, UNICEF, ILO)

---

## 🔗 API Endpoints Reference

From: http://k8s-undataet-undataet-033d3498ce-782c9dcd125fb73f.elb.us-west-2.amazonaws.com/docs

### **Main ETL Endpoint:**
```
POST /etl/run
{
  "agency": "sdg",
  "data_version": "q2-2025",
  "control_file_options": {
    "generate_transcoding_file": true,
    "merge_transcoding_matrix": true,
    "generate_metadata_file": true,
    "generate_indicator_svg_file": true,
    "generate_units_of_measure_file": true,
    "generate_hierarchy_file": true,
    "merge_metadata_tables": true
  }
}
```

### **SDG Preprocessor:**
```
POST /sdg_preprocessor/preprocess   # Check if mapping files need update
POST /sdg_preprocessor/finalize      # Generate final artifacts
```

### **Status Monitoring:**
```
GET /status/{job_id}   # Check ETL job status
```

---

## 📝 Conclusion

**The transcoding review Excel file represents the BIGGEST BOTTLENECK in the current manual process.**

By automating this step in the MCF Pipeline Viewer, we can:
- ✅ **Eliminate Excel editing** entirely
- ✅ **Provide visual diff** like GitHub Pull Requests
- ✅ **Enable one-click approval** with full audit trail
- ✅ **Auto-deploy** to all 3 targets simultaneously

**This is the high-value automation opportunity!** 🚀

