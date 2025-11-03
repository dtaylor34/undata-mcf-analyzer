# UN Data Commons MCF Pipeline - Complete Dataflow

## 📋 **Table of Contents**
1. [System Overview](#system-overview)
2. [MCF File Upload Flow](#mcf-file-upload-flow)
3. [Processing Pipeline](#processing-pipeline)
4. [Environment Deployment](#environment-deployment)
5. [SDG & Partners Flow](#sdg--partners-flow)
6. [Automated Systems](#automated-systems)
7. [Architecture Diagram](#architecture-diagram)

---

## 🎯 **System Overview**

The MCF Pipeline Viewer is a **multi-environment data transformation and deployment system** that processes MCF (Meta Content Framework) files from UN agencies and deploys them to three environments.

### **Key Components**
- **Frontend Viewer**: React app for browsing, comparing, and editing MCF files
- **File Index**: Hierarchical catalog of MCF files by organization/version
- **Transcoding Engine**: Automated taxonomy mapping (OLD → NEW)
- **Multi-Format Transformer**: Converts MCF → .STAT, DataCommons, Cached JSON
- **Environment Manager**: Deploys to Staging, Test, Production
- **Version Control**: Git-based change tracking and diff comparison

---

## 📤 **1. MCF File Upload Flow**

### **Step 1: User Uploads New MCF File**

```
┌─────────────────────────────────────────────────────────────┐
│                    UN AGENCY (ILO, SDG, etc.)               │
│  Creates new MCF file with indicators/schema updates        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FILE UPLOAD (Multiple Options)                 │
│  • GitHub Pull Request → /datacommons/[org]/[version]/      │
│  • Direct Upload via API (future)                           │
│  • FTP/SFTP to staging server                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  FILE WATCHER (Automated)                   │
│  scripts/file-watcher.js                                    │
│                                                             │
│  ✅ Detects new .mcf files in /datacommons/                │
│  ✅ Triggers data-processor.js                              │
│  ✅ Logs event to audit trail                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               DATA PROCESSOR (Automated)                    │
│  scripts/data-processor.js                                  │
│                                                             │
│  1️⃣  Parse MCF file (syntax validation)                     │
│  2️⃣  Extract metadata (org, version, indicators)            │
│  3️⃣  Register in mcf-file-index-v2.js                       │
│  4️⃣  Generate file analysis (variable count, etc.)          │
│  5️⃣  Update catalog statistics                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            FILE INDEX UPDATE (Automated)                    │
│  src/mcf-file-index-v2.js                                   │
│                                                             │
│  Hierarchical Structure:                                    │
│  ├── Organization (ILO, SDG, UNICEF, WHO)                  │
│  │   ├── Version (Q1 2025, Q2 2025, V01, etc.)             │
│  │   │   ├── Files (schema.mcf, sv.mcf, etc.)              │
│  │   │   └── CSV Files (observations)                       │
│  │                                                           │
│  Example Entry:                                             │
│  sdg: {                                                     │
│    name: 'SDG',                                             │
│    emoji: '🎯',                                             │
│    versions: {                                              │
│      'q2-2025': {                                           │
│        name: 'Q2 2025',                                     │
│        files: [...],                                        │
│        csvFiles: [...]                                      │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              NOW VISIBLE IN VIEWER UI ✅                    │
│  • Appears in Dataset dropdown                              │
│  • Available for comparison with other versions             │
│  • Can be edited in Edit mode                               │
│  • Ready for transcoding review (if SDG)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ **2. Processing Pipeline**

### **What Happens to MCF Files?**

```
┌─────────────────────────────────────────────────────────────┐
│                  MCF FILE (Source)                          │
│  Format: Meta Content Framework                             │
│  Contains: Schema, Variables, Observations                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              MULTI-FORMAT TRANSFORMER                       │
│  scripts/transform-mcf.js                                   │
│                                                             │
│  Generates 3 Output Formats:                                │
│                                                             │
│  1️⃣  .STAT (SDMX) Format                                    │
│     • For UN statistical systems                            │
│     • SDMX-compliant structure                              │
│     • Dimensions, Measures, Attributes                      │
│                                                             │
│  2️⃣  DataCommons JSON                                        │
│     • For Google DataCommons                                │
│     • Knowledge graph nodes                                 │
│     • Statistical variables                                 │
│                                                             │
│  3️⃣  Cached JSON (Website)                                  │
│     • Optimized for web display                             │
│     • Pre-computed aggregations                             │
│     • Fast API responses                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                OUTPUT FILE STORAGE                          │
│                                                             │
│  /transformed/                                              │
│    ├── stat/                                                │
│    │   └── [org]/[version].xml (SDMX)                      │
│    ├── datacommons/                                         │
│    │   └── [org]/[version].json                            │
│    └── cached/                                              │
│        └── [org]/[version].json                            │
└─────────────────────────────────────────────────────────────┘
```

### **File Analysis & Charts**

```
┌─────────────────────────────────────────────────────────────┐
│              MCF ANALYSIS ENGINE                            │
│  src/utils/mcf-parser.js                                    │
│                                                             │
│  Extracts:                                                  │
│  • Statistical Variables (SVs)                              │
│  • Observations (data points)                               │
│  • Dimensions (country, time, indicator)                    │
│  • Metadata (units, measurement methods)                    │
│                                                             │
│  If has CSV data:                                           │
│  ✅ Auto-generates charts                                   │
│  ✅ Creates chart preview                                   │
│  ✅ Enables Dual Chart Preview (DataCommons + .STAT)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **3. SDG & Partners Flow**

### **SDG Transcoding (Automated Taxonomy Mapping)**

```
┌─────────────────────────────────────────────────────────────┐
│              SDG Q2 2025 UPLOAD                             │
│  New SDG taxonomy with updated codes                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           TRANSCODING ENGINE (Automated)                    │
│  scripts/transcoding-generator.js                           │
│                                                             │
│  1️⃣  Compare OLD vs NEW taxonomy                            │
│     • OLD: Q1 2025 enumerations                             │
│     • NEW: Q2 2025 enumerations                             │
│                                                             │
│  2️⃣  AI-Powered Mapping                                      │
│     • Fuzzy match on code names                             │
│     • Semantic similarity (NLP)                             │
│     • Pattern recognition                                   │
│                                                             │
│  3️⃣  Confidence Scoring (0-100%)                            │
│     • High (90-100%): Auto-approve ✅                       │
│     • Medium (70-89%): Needs review ⚠️                      │
│     • Low (<70%): Manual review required ❌                 │
│                                                             │
│  4️⃣  Generate Transcoding Matrix                            │
│     • 10,304 mappings generated                             │
│     • 8,243 high confidence (80%)                           │
│     • 2,061 need review (20%)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         TRANSCODING REVIEW (Manual - Admin)                 │
│  UI: TranscodingViewer Component                            │
│                                                             │
│  Features:                                                  │
│  • 📊 10,304 mappings with confidence scores                │
│  • 🔍 Search & filter by enumeration                        │
│  • ⚡ Lazy loading (200 rows at a time)                     │
│  • ✅ Bulk approval for high confidence                     │
│  • ⚠️  Review queue for medium/low confidence               │
│  • 📋 Export transcoding matrix                             │
│                                                             │
│  Admin Actions:                                             │
│  ├─ "Approve All High Confidence" (8,243 items)            │
│  ├─ "Not approved, needs work"                              │
│  └─ "Have questions, need to sync with team"                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         TRANSCODING APPLIED (Automated)                     │
│  • Updates SDG indicators with new codes                    │
│  • Maintains backward compatibility                         │
│  • Logs all changes to audit trail                          │
│  • Ready for deployment                                     │
└─────────────────────────────────────────────────────────────┘
```

### **Partner Organizations (ILO, UNICEF, WHO)**

```
┌─────────────────────────────────────────────────────────────┐
│         PARTNER ORGANIZATION UPLOAD                         │
│  ILO / UNICEF / WHO / Other UN Agencies                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            STANDARD MCF PROCESSING                          │
│  • No transcoding needed (already standardized)             │
│  • Direct transformation to 3 formats                       │
│  • Auto-indexed in File Selector                            │
│  • Available for comparison with SDG                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         CROSS-ORGANIZATION COMPARISON                       │
│  • Compare ILO V01 vs SDG Q2 2025                          │
│  • Identify overlapping indicators                          │
│  • Find data gaps                                           │
│  • Harmonize taxonomies                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌍 **4. Environment Deployment Flow**

### **Three-Tier Environment System**

```
┌─────────────────────────────────────────────────────────────┐
│                APPROVED MCF FILES                           │
│  (After transcoding review & validation)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  🔶 ENVIRONMENT 1: STAGING                                  │
│  URL: https://staging.undatacommons.dev                     │
│                                                             │
│  Purpose: Preview environment with latest changes           │
│  Deployment: Automated (git push triggers deploy)           │
│  Data: Latest approved files                                │
│  Access: Internal UN teams only                             │
│                                                             │
│  Automated Deployment Steps:                                │
│  1️⃣  git push to 'staging' branch                           │
│  2️⃣  CI/CD pipeline triggered                               │
│  3️⃣  Transform MCF → .STAT/DC/Cached                        │
│  4️⃣  Deploy to staging servers                              │
│  5️⃣  Run validation tests                                   │
│  6️⃣  Send notification to team                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ (Manual approval gate)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  🧪 ENVIRONMENT 2: TEST                                     │
│  URL: https://test.undatacommons.dev                        │
│                                                             │
│  Purpose: Testing environment for validation                │
│  Deployment: Semi-automated (after staging approval)        │
│  Data: Staging data + test datasets                         │
│  Access: QA team + external partners (limited)              │
│                                                             │
│  Deployment Workflow:                                       │
│  1️⃣  Staging validation passes ✅                           │
│  2️⃣  Admin clicks "Promote to Test"                         │
│  3️⃣  Run comprehensive test suite                           │
│  4️⃣  Load testing (performance)                             │
│  5️⃣  Integration testing (all formats)                      │
│  6️⃣  Generate test report                                   │
│  7️⃣  Email stakeholders for review                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ (Manual approval gate)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  🌍 ENVIRONMENT 3: PRODUCTION                               │
│  URL: https://data.un.org/UNSDWebsite/undatacommons         │
│                                                             │
│  Purpose: Live production environment                       │
│  Deployment: Manual approval required                       │
│  Data: Fully validated, approved datasets                   │
│  Access: Public                                             │
│                                                             │
│  Deployment Workflow:                                       │
│  1️⃣  Test validation passes ✅                              │
│  2️⃣  Admin review + sign-off                                │
│  3️⃣  Schedule deployment (maintenance window)               │
│  4️⃣  Create backup of current production                    │
│  5️⃣  Deploy new data (blue-green deployment)                │
│  6️⃣  Run smoke tests                                        │
│  7️⃣  Switch traffic to new version                          │
│  8️⃣  Monitor for 24h                                        │
│  9️⃣  Rollback capability (if issues)                        │
└─────────────────────────────────────────────────────────────┘
```

### **Environment-Specific Features**

```
┌─────────────────────────────────────────────────────────────┐
│              ENVIRONMENT SWITCHER (UI)                      │
│  src/utils/environment-config.js                            │
│                                                             │
│  User can select environment in viewer:                     │
│  • Changes API endpoints dynamically                        │
│  • Updates chart URLs                                       │
│  • Persists selection to localStorage                       │
│  • Shows color-coded badges (🔶 🧪 🌍)                      │
│                                                             │
│  Use Cases:                                                 │
│  • Test new indicators in staging                           │
│  • Compare staging vs production data                       │
│  • Preview charts before deployment                         │
│  • Validate data transformations                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 **5. Automated Systems**

### **What's Automated vs Manual?**

| Process | Automated? | Details |
|---------|-----------|---------|
| **File Upload Detection** | ✅ Automated | File watcher monitors `/datacommons/` |
| **MCF Parsing** | ✅ Automated | Extracts variables, observations, metadata |
| **File Index Update** | ✅ Automated | Registers new files in catalog |
| **Multi-Format Transformation** | ✅ Automated | MCF → .STAT/DC/Cached |
| **Transcoding Generation** | ✅ Automated | AI-powered taxonomy mapping with confidence scores |
| **High Confidence Auto-Approval** | ⚠️ Semi-Auto | Admin can bulk approve with one click |
| **Medium/Low Confidence Review** | ❌ Manual | Human review required |
| **Staging Deployment** | ✅ Automated | Git push triggers CI/CD |
| **Test Deployment** | ⚠️ Semi-Auto | Requires manual approval gate |
| **Production Deployment** | ❌ Manual | Full admin review + sign-off |
| **Chart Generation** | ✅ Automated | If CSV data present |
| **Version Comparison** | ✅ Automated | Side-by-side diff with lazy loading |
| **Validation Testing** | ✅ Automated | Runs after each deployment |

### **Automation Engine Components**

```
┌─────────────────────────────────────────────────────────────┐
│            AUTOMATION COMPONENTS                            │
│                                                             │
│  📁 File Watcher (scripts/file-watcher.js)                 │
│     • Monitors /datacommons/ directory                      │
│     • Triggers on .mcf file changes                         │
│     • Debounced (waits 2s for batch uploads)                │
│                                                             │
│  📊 Data Processor (scripts/data-processor.js)             │
│     • Validates MCF syntax                                  │
│     • Extracts metadata                                     │
│     • Updates file index                                    │
│                                                             │
│  🔄 Transcoding Engine (scripts/transcoding-generator.js)  │
│     • Compares OLD vs NEW taxonomy                          │
│     • Fuzzy matching algorithm                              │
│     • Confidence scoring (ML-based)                         │
│     • Generates 10,304 mappings in seconds                  │
│                                                             │
│  🔀 Transformer (scripts/transform-mcf.js)                 │
│     • MCF → SDMX (XML)                                      │
│     • MCF → DataCommons (JSON)                              │
│     • MCF → Cached (optimized JSON)                         │
│                                                             │
│  🚀 Deployer (scripts/deploy.js)                           │
│     • Multi-environment deployment                          │
│     • Blue-green deployment strategy                        │
│     • Automatic rollback on failure                         │
│     • Health checks & monitoring                            │
│                                                             │
│  ✅ Validator (scripts/validate.js)                        │
│     • Schema validation                                     │
│     • Data integrity checks                                 │
│     • Cross-reference validation                            │
│     • Performance benchmarks                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **6. Complete Architecture Diagram**

```
                    ┌──────────────────────────────────────────┐
                    │      UN AGENCIES (Data Sources)          │
                    │  ILO │ SDG │ UNICEF │ WHO │ Partners    │
                    └────────────────┬─────────────────────────┘
                                     │
                                     │ Upload MCF Files
                                     ▼
                    ┌──────────────────────────────────────────┐
                    │         GitHub Repository                 │
                    │    /datacommons/[org]/[version]/         │
                    │  ├─ schema.mcf                           │
                    │  ├─ sv.mcf (statistical variables)       │
                    │  ├─ series.mcf                           │
                    │  └─ observations.csv (optional)          │
                    └────────────────┬─────────────────────────┘
                                     │
                    ┌────────────────┴─────────────────────────┐
                    │                                          │
                    ▼                                          ▼
    ┌─────────────────────────────┐        ┌─────────────────────────────┐
    │   FILE WATCHER (Automated)  │        │   MCF Pipeline Viewer (UI)  │
    │   Detects new files         │        │   React Frontend             │
    └─────────────┬───────────────┘        └─────────────┬───────────────┘
                  │                                       │
                  ▼                                       │
    ┌─────────────────────────────┐                      │
    │   DATA PROCESSOR            │                      │
    │   • Parse MCF               │                      │
    │   • Extract metadata        │                      │
    │   • Update file index       │                      │
    └─────────────┬───────────────┘                      │
                  │                                       │
                  ▼                                       │
    ┌─────────────────────────────┐                      │
    │   FILE INDEX (Catalog)      │◄─────────────────────┘
    │   mcf-file-index-v2.js      │   User Selects File
    │   Hierarchical structure    │
    └─────────────┬───────────────┘
                  │
                  │ If SDG: Trigger Transcoding
                  ▼
    ┌─────────────────────────────┐
    │   TRANSCODING ENGINE        │
    │   • Compare OLD vs NEW      │
    │   • AI-powered mapping      │
    │   • Confidence scoring      │
    │   • 10,304 mappings         │
    └─────────────┬───────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │   TRANSCODING REVIEW UI     │
    │   • Lazy loading            │
    │   • Search & filter         │
    │   • Bulk approve            │
    │   • Manual review queue     │
    └─────────────┬───────────────┘
                  │
                  │ Admin Approves
                  ▼
    ┌─────────────────────────────┐
    │   MULTI-FORMAT TRANSFORMER  │
    │   MCF Source                │
    │   ├─→ .STAT (SDMX XML)      │
    │   ├─→ DataCommons (JSON)    │
    │   └─→ Cached (Website JSON) │
    └─────────────┬───────────────┘
                  │
                  │ Deploy to Environments
                  ▼
    ┌────────────────────────────────────────────┐
    │         DEPLOYMENT PIPELINE                │
    │                                            │
    │  🔶 STAGING (Automated)                   │
    │     ├─ Auto-deploy on git push            │
    │     ├─ Run validation tests               │
    │     └─ Notify team                        │
    │         │                                  │
    │         │ Manual Approval                  │
    │         ▼                                  │
    │  🧪 TEST (Semi-Automated)                 │
    │     ├─ Comprehensive test suite           │
    │     ├─ Load & integration tests           │
    │     └─ Generate test report               │
    │         │                                  │
    │         │ Admin Sign-off                   │
    │         ▼                                  │
    │  🌍 PRODUCTION (Manual)                   │
    │     ├─ Backup current data                │
    │     ├─ Blue-green deployment              │
    │     ├─ Smoke tests                        │
    │     └─ Monitor 24h                        │
    └────────────────┬───────────────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────────────────┐
    │         PUBLIC APIs & WEBSITES              │
    │                                             │
    │  📈 .STAT Platform                         │
    │     • SDMX API                              │
    │     • Statistical tables                    │
    │                                             │
    │  🌐 DataCommons                             │
    │     • Knowledge graph                       │
    │     • Statistical variables                 │
    │                                             │
    │  💾 UN Data Website                         │
    │     • Cached endpoints                      │
    │     • Fast chart rendering                  │
    └─────────────────────────────────────────────┘
```

---

## 🎯 **Key Benefits of This System**

### **For Data Managers**
✅ **80% Time Savings** - Automated transcoding with high confidence scores  
✅ **Version Comparison** - Side-by-side diff with 60k+ line support  
✅ **Multi-Environment Testing** - Validate before production  
✅ **Audit Trail** - Track all changes with git history  

### **For Developers**
✅ **Automated Deployments** - CI/CD pipeline for staging  
✅ **Multi-Format Support** - One source → 3 output formats  
✅ **Lazy Loading** - Handle 10k+ records without crashes  
✅ **Real-time Search** - Filter 10,304 mappings instantly  

### **For End Users**
✅ **Fast Data Access** - Cached JSON for quick API responses  
✅ **Interactive Charts** - Auto-generated from MCF + CSV  
✅ **Multiple Views** - .STAT, DataCommons, Cached formats  
✅ **Environment Switcher** - Compare staging vs production  

---

## 📝 **Summary**

| Stage | Input | Process | Output | Automation |
|-------|-------|---------|--------|------------|
| **1. Upload** | MCF files from UN agencies | File watcher detects | Registered in catalog | ✅ Fully Automated |
| **2. Processing** | MCF schema | Parse & extract metadata | File analysis + charts | ✅ Fully Automated |
| **3. Transcoding** | SDG Q2 2025 | Compare vs Q1 2025 | 10,304 mappings with confidence | ✅ Automated (AI) |
| **4. Review** | Transcoding matrix | Admin bulk approval | Approved mappings | ⚠️ Semi-Automated |
| **5. Transform** | Approved MCF | Multi-format conversion | .STAT/DC/Cached | ✅ Fully Automated |
| **6. Deploy Staging** | Transformed data | Git push → CI/CD | Staging environment | ✅ Fully Automated |
| **7. Deploy Test** | Staging-validated data | Test suite | Test environment | ⚠️ Manual Approval |
| **8. Deploy Prod** | Test-validated data | Blue-green deployment | Production APIs | ❌ Manual Sign-off |

---

## 🚀 **Next Steps**

To fully automate the system:

1. **Add API Upload Endpoint** - Allow direct file uploads via API
2. **Auto-Approve High Confidence** - 90%+ confidence → auto-deploy to staging
3. **ML Confidence Improvement** - Train model on historical transcoding decisions
4. **Slack/Teams Integration** - Real-time notifications for approvals
5. **Canary Deployments** - Gradual rollout to production (10% → 50% → 100%)

---

**Document Version**: 1.0  
**Last Updated**: November 3, 2025  
**Maintained By**: UN Data Commons Team

