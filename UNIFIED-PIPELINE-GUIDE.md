# 🚀 Unified MCF-First Data Pipeline

## Complete Implementation Guide for UN Data Commons

---

## 📋 Overview

This system implements a **bulletproof, MCF-first data pipeline** that:

✅ Automates data ingestion from partner agencies  
✅ Validates theme & SDG alignment (95% minimum coverage)  
✅ Provides dual chart previews (DataCommons + .STAT)  
✅ Shows comprehensive diff across all systems  
✅ Manages partner onboarding and permissions  
✅ Deploys to Test → Staging → Production environments  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: DATA INGESTION (Automated)                             │
│  ─────────────────────────────────────                          │
│  Drop new data → inbox/{agency}/                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: AUTO-PROCESSING                                        │
│  • Convert CSV/SDMX → MCF (single source of truth)              │
│  • Validate theme/SDG alignment                                 │
│  • Generate governance report                                   │
│  • Create draft Git branch                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: REVIEW IN MCF ANALYZER (Human QA)                      │
│  • View data in MCF Analyzer UI                                 │
│  • See theme/SDG alignment                                      │
│  • Preview charts (DataCommons + .STAT)                         │
│  • Review comprehensive diff                                    │
│  • Approve or reject                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: AUTOMATED DEPLOYMENT                                   │
│  MCF → Transform to 3 outputs in parallel:                      │
│  ├─→ .STAT (SDMX-JSON)    → .STAT Explorer                      │
│  ├─→ DataCommons (MCF)    → Knowledge Graph API                 │
│  └─→ Cached (Optimized)   → UNData Website                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
/Users/dt/undata/undata-mcf-analyzer/
│
├── 📥 inbox/                          # Drop new data here
│   ├── unicef/
│   ├── who/
│   ├── ilo/
│   └── fao/
│
├── 🔄 processing/                     # Auto-processing workspace
│   └── {timestamp}_{agency}_{dataset}/
│
├── 📊 mcf/                            # MCF SOURCE OF TRUTH
│   ├── unicef/
│   ├── who/
│   ├── ilo/
│   └── sdg/
│
├── 🚀 output/                         # Generated outputs (auto)
│   ├── stat/                          # For .STAT Explorer
│   ├── datacommons/                   # For DC Knowledge Graph
│   └── cached/                        # For UNData website
│
├── 🎨 src/                            # React app
│   ├── components/
│   │   ├── DualChartPreview.jsx      # Side-by-side charts
│   │   ├── GovernancePanel.jsx       # Theme/SDG validation
│   │   ├── DataCommonsChartPreview.jsx
│   │   └── StatChartPreview.jsx
│   └── utils/
│       └── data-pipeline.js           # Core orchestrator
│
├── 🔧 scripts/                        # Automation
│   ├── watcher.js                     # Watches inbox/
│   ├── processor.js                   # Converts & validates
│   ├── theme-sdg-validator.js         # Governance checks
│   └── deploy.js                      # Deployment automation
│
└── ⚙️ config/                         # Configuration
    ├── undata-taxonomy.js             # Themes & SDGs
    ├── partners.js                    # Partner registry
    └── environments.js                # Test/Staging/Prod
```

---

## 🎯 Key Features

### 1. **Governance System**

**Bulletproof Theme & SDG Alignment:**
- Auto-detects themes using keyword matching
- Requires 95% coverage minimum
- Manual mapping interface for unmapped indicators
- Validates against expected agency mappings

**Files:**
- `config/undata-taxonomy.js` - Master theme/SDG registry
- `scripts/theme-sdg-validator.js` - Validation logic
- `src/components/GovernancePanel.jsx` - UI for review

---

### 2. **Dual Chart Preview**

**See Exact Production Appearance:**
- **DataCommons charts** - Same library as data.un.org
- **.STAT charts** - Same library as .STAT Explorer
- Side-by-side comparison
- Interactive testing (hover, zoom, filter)

**Files:**
- `src/components/DualChartPreview.jsx` - Main component
- `src/components/DataCommonsChartPreview.jsx` - DC charts
- `src/components/StatChartPreview.jsx` - .STAT charts

---

### 3. **Comprehensive Diff System**

**5-Section Impact Analysis:**
1. **MCF Diff** - Source changes
2. **.STAT Impact** - SDMX/DSD changes
3. **DataCommons Impact** - Knowledge Graph changes
4. **Cached Impact** - Website data changes
5. **Chart Diff** - Visual before/after comparison

**Files:**
- `src/utils/data-pipeline.js` - DataPipeline class
- All diff logic in single orchestrator

---

### 4. **Partner Management**

**Structured Onboarding:**
- Partner registry with permissions
- Onboarding checklist (6 steps)
- Shareable URLs for specific datasets
- Permission-based access control

**Files:**
- `config/partners.js` - Partner registry
- Tracks onboarding status
- Manages permissions

---

### 5. **Multi-Environment Deployment**

**Test → Staging → Production:**
- Environment-specific URLs
- Staged approval workflow
- Automated deployment scripts
- Rollback capability

**Files:**
- `config/environments.js` - Environment configs

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/dt/undata/undata-mcf-analyzer
npm install
```

### 2. Start MCF Analyzer

```bash
npm start
```

### 3. Drop New Data

```bash
# Copy your CSV/MCF file to inbox
cp ~/new-data.csv inbox/unicef/
```

### 4. System Auto-Processes

- Converts to MCF
- Validates governance
- Creates review URL
- Opens browser to review page

### 5. Review & Approve

- View governance alignment
- Preview charts (DC + .STAT)
- Review comprehensive diff
- Click "Deploy to Staging"

### 6. Done! ✅

Data is live in all 3 systems:
- .STAT Explorer
- DataCommons API
- UNData Website

---

## 📊 Governance Requirements

### Minimum Requirements for Deployment

| Requirement | Minimum | Blocker if Failed? |
|------------|---------|-------------------|
| Theme Coverage | 95% | ✅ Yes |
| SDG Mapping | At least 1 SDG | ✅ Yes |
| Schema Validation | Pass | ✅ Yes |
| Data Quality Score | 70% | ✅ Yes |
| Partner Permissions | Active + canPublish | ✅ Yes |

---

## 🔐 Partner Permissions

### Permission Levels

**Admin:**
- Full access to all datasets
- Can approve deployments
- Can manage partners

**Partner (Active):**
- Can publish own datasets
- Can generate shareable URLs
- Access to own data only

**Partner (Onboarding):**
- Read-only access
- Cannot publish
- Limited to sample datasets

---

## 🌍 Environments

### Test
- **URL:** https://test-nsi-undata-dst.dev.officialstatistics.org
- **Purpose:** Development & QA testing
- **Auto-deploy:** On PR merge to `develop`

### Staging
- **URL:** https://staging-nsi-undata-dst.dev.officialstatistics.org
- **Purpose:** Pre-production validation
- **Deploy:** Manual approval in MCF Analyzer

### Production
- **URL:** https://de-undata-dst.dev.officialstatistics.org
- **Purpose:** Live public data
- **Deploy:** Manual approval (requires 2FA)

---

## 🔄 Workflow Examples

### Example 1: New UNICEF Data

```bash
# 1. Drop file
cp UNICEF__CHILD_HEALTH_2025.csv inbox/unicef/

# 2. System auto-processes (30 seconds)
# ✅ Converted to MCF
# ✅ Validated themes/SDGs (98% coverage)
# ✅ Generated charts
# ✅ Created draft branch

# 3. Open review URL (auto-opens in browser)
http://localhost:3000/review?branch=draft/unicef/20250201

# 4. Review in UI
# ✅ Theme alignment: 98% (DSS-HEA, SDG03)
# ✅ Charts look good in both DC & .STAT
# ✅ Diff shows +15 observations, no breaking changes

# 5. Approve
# Click "Deploy to Staging"

# 6. Done!
# Data live in staging within 2 minutes
```

### Example 2: New Partner Onboarding (FAO)

```bash
# 1. Create partner profile
node scripts/partner-onboarding.js \
  --name "Food and Agriculture Organization" \
  --email "statistics@fao.org" \
  --sample-data "inbox/fao/FAO_SAMPLE.csv"

# 2. System analyzes sample data
# ✅ 45 indicators detected
# ✅ Themes: ECS-AGR (85%), ENV (15%)
# ✅ SDGs: SDG02 (100%)
# ⚠️  Coverage: 85% (below 95% minimum)

# 3. Open onboarding dashboard
http://localhost:3000/partner-onboarding/fao

# 4. Complete checklist
# ☐ Data review (needs manual theme mapping)
# ☐ Theme mapping (10 indicators unmapped)
# ✓ Technical setup
# ✓ Branding setup
# ☐ Legal agreement (pending signature)
# ☐ User training (not scheduled)

# 5. Once complete, partner status → "active"
# Can now publish to all 3 systems
```

---

## 📈 Chart Libraries

### DataCommons (data.un.org)
- **Library:** Google DataCommons Web Components
- **CDN:** https://datacommons.org/datacommons.js
- **Charts:** Line, Bar, Map, Scatter

### .STAT (SDMX Explorer)
- **Library:** OECD .STAT Visualization
- **CDN:** @oecd-sis/oecd-dot-stat-viz
- **Charts:** Time series, Pivot tables, Maps

---

## 🛠️ Development

### Run Locally

```bash
npm start
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

---

## 📞 Support

### For Partners
- **Email:** undata-support@un.org
- **Documentation:** https://docs.undata.org
- **Slack:** #undata-partners

### For Developers
- **GitHub:** https://github.com/UN-Data-Commons/un-data-commons-etl
- **Issues:** File issues in GitHub repo

---

## 🎉 Success Metrics

**Deployment Speed:**
- Drop file → Live in production: **< 30 minutes**
- Manual review time: **< 10 minutes**

**Data Quality:**
- Theme coverage: **95%+ required**
- SDG alignment: **100% of datasets**
- Breaking changes: **Auto-detected**

**Partner Satisfaction:**
- Onboarding time: **< 2 weeks**
- Self-service: **Yes**
- Transparency: **Full visibility**

---

**Built with ❤️ for the UN Data Commons**

