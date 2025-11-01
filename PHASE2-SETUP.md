# Phase 2: Automation & Review Queue Setup Guide

## 🎯 What's New in Phase 2

Phase 2 adds the complete automation pipeline and review workflow:

1. **File Watcher** - Automatically detect and process new data files
2. **Data Processor** - Convert CSV/SDMX to MCF format
3. **Governance Validator** - Ensure Theme & SDG alignment
4. **Review Queue UI** - Admin interface for approving submissions
5. **Deployment Automation** - CI/CD pipeline to Test → Staging → Production

---

## 📋 Prerequisites

- Node.js 16+ installed
- Git configured
- Review Queue dependencies (already in package.json)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Required Directories

```bash
mkdir -p inbox processing mcf output/cached logs approvals rejections
```

### 3. Start the File Watcher (Background Process)

```bash
npm run watch
```

This will monitor `inbox/` for new files and automatically process them.

### 4. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 5. Navigate to Review Queue

Click the "📋 Review Queue" button in the header to access the admin review interface.

---

## 📁 Directory Structure

```
undata-mcf-analyzer/
├── inbox/              # Drop new CSV/SDMX/MCF files here
├── processing/         # Files being processed (temporary)
├── mcf/                # Generated MCF files (organized by org)
│   ├── who/
│   ├── unicef/
│   ├── ilo/
│   └── fao/
├── output/             # Deployment outputs
│   ├── cached/         # Cached JSON for website
│   ├── stat/           # SDMX-JSON for .STAT
│   └── datacommons/    # DataCommons JSON
├── logs/               # Processing and deployment logs
├── approvals/          # Approved submissions metadata
├── rejections/         # Rejected submissions metadata
├── review-queue.json   # Current review queue (auto-generated)
└── scripts/            # Automation scripts
    ├── file-watcher.js
    ├── data-processor.js
    ├── governance-validator.js
    ├── git-automation.js
    └── deploy.js
```

---

## 🔄 Workflow

### For Data Partners (Submitting Data)

1. **Prepare your data** in CSV or SDMX format
2. **Drop file into `inbox/`** folder
3. File watcher **automatically processes** it
4. **Email notification** sent to admins for review
5. **Wait for approval** (you'll be notified)

### For Admins (Reviewing Data)

1. **Open Review Queue** at `http://localhost:3000/review`
2. **Select pending submission** from sidebar
3. **Review governance validation**:
   - Theme coverage
   - SDG alignment
   - Data quality
4. **Preview charts** (DataCommons + .STAT side-by-side)
5. **Approve or Reject** the submission
6. If approved, **deployment pipeline automatically runs**

---

## 📊 npm Scripts

```bash
# Development
npm start                    # Start development server
npm run watch                # Start file watcher (auto-process)
npm run process:file <path>  # Manually process a single file

# Deployment
npm run deploy:test          # Deploy to test environment
npm run deploy:staging       # Deploy to staging environment
npm run deploy:production    # Deploy to production (requires approval)
npm run deploy:pipeline      # Run full pipeline (test → staging)

# Utilities
npm run validate:governance  # Run governance validator
npm run list:drafts          # List all draft branches
npm run approve:draft <name> # Approve a specific draft branch
npm run reject:draft <name>  # Reject a specific draft branch
```

---

## 🏛️ Governance Validation

All data must meet minimum governance requirements:

- **Theme Coverage**: ≥ 80% of indicators mapped to UNData Themes
- **SDG Coverage**: ≥ 80% of indicators mapped to SDG Goals
- **Agency Alignment**: Data aligns with expected agency themes

If requirements aren't met:
- ⚠️ Warning badge shown in Review Queue
- Admin can still approve (manual override)
- Suggestions provided for unmapped indicators

---

## 🔐 Permissions

### Admin Role
- Access Review Queue
- Approve/Reject submissions
- Deploy to all environments
- Full data access

### Partner Role
- Submit data to inbox/
- View own submission status
- See chart previews for own data
- Cannot approve/deploy

### Guest Role
- View sample data only
- Cannot submit or approve

---

## 🚢 Deployment Pipeline

Approved submissions trigger automated deployment:

```
Test Environment → Validation Tests → Staging Environment → Manual Gate → Production
     (automatic)        (automatic)         (automatic)       (manual)    (manual)
```

**Test Environment**
- Base URL: `https://test-data.un.org`
- Purpose: Automated validation
- Auto-deploys on approval

**Staging Environment**
- Base URL: `https://staging-data.un.org`
- Purpose: Pre-production testing
- Auto-deploys after test passes

**Production Environment**
- Base URL: `https://data.un.org`
- Purpose: Live public data
- **Requires manual trigger**: `npm run deploy:production`

---

## 📝 File Naming Conventions

For automatic organization detection:

- WHO files: `WHO_*.csv` or `who_*.csv`
- UNICEF files: `UNICEF_*.csv` or `unicef_*.csv`
- ILO files: `ILO_*.csv` or `ilo_*.csv`
- FAO files: `FAO_*.csv` or `fao_*.csv`
- SDG files: `SDG_*.csv` or `sdg_*.csv`

---

## 🐛 Troubleshooting

**File watcher not processing files**
- Check that file watcher is running: `npm run watch`
- Check logs: `tail -f logs/errors.json`
- Ensure file isn't locked or being written

**Review queue empty**
- Check `review-queue.json` exists
- Process files manually: `npm run process:file inbox/yourfile.csv`

**Deployment fails**
- Check environment configs in `config/environments.js`
- Verify API credentials
- Check logs: `cat logs/deployments/*.json`

---

## 📚 Additional Documentation

- `UNIFIED-PIPELINE-GUIDE.md` - Complete pipeline architecture
- `config/undata-taxonomy.js` - Theme & SDG definitions
- `config/partners.js` - Partner registry
- `config/environments.js` - Environment configuration

---

## 🎓 Training Resources

For partners:
1. Review `QUICKSTART.md`
2. Watch data submission video
3. Test with sample files in `examples/`

For admins:
1. Review this guide
2. Practice with test data
3. Review governance criteria in `config/undata-taxonomy.js`

---

## 💡 Tips

- **Test locally first**: Drop files in `inbox/` before production
- **Use descriptive filenames**: Include org, indicator, and date
- **Include TMCF templates**: For complex CSV files
- **Review governance warnings**: Even if auto-approved
- **Monitor deployments**: Check logs after production deploy

---

## 🆘 Support

Questions? Contact:
- Technical: tech@undata.org
- Governance: governance@undata.org
- Partners: partners@undata.org

---

**Ready to start?** Drop a file in `inbox/` and watch the magic happen! ✨

