# UN Data Commons Integration - Quick Start Guide

Welcome! This guide will help you get the UN Data Commons Integration layer up and running in minutes.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

**Required settings:**
- `DC_API_KEY`: Your Data Commons API key
- `STAT_API_URL`: Usually `https://data.un.org/api/v1`
- `DC_API_URL`: Usually `https://datacommons.undata.org/api`

### 3. Build Initial Cache

```bash
npm run build:cache
```

This creates `catalog-ui-cache.json` from your MCF files.

### 4. Start the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### 5. Verify It's Working

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected response:
# { "status": "healthy", "cache": "loaded", "uptime": 123 }
```

## 📦 What You Just Installed

```
undata-integration/
├── data-layer.js           # Main integration layer
├── IndicatorPreview.jsx    # React component for charts
├── mcf-diff.js            # MCF comparison tool
├── config.dev.js          # Development configuration
├── config.prod.js         # Production configuration
├── examples.js            # Usage examples
├── package.json           # Dependencies
├── .env.example           # Environment template
└── deploy.sh              # Deployment script
```

## 🎯 Common Use Cases

### Use Case 1: Query Indicator Data

```javascript
const DataLayer = require('./data-layer');
const config = require('./config.dev');

const dataLayer = new DataLayer(config);
await dataLayer.initialize();

const result = await dataLayer.query({
  indicators: ['dc/sdg_1_1_1'],
  locations: ['country/USA'],
  startYear: 2015,
  endYear: 2023
});

console.log(result.data);
```

### Use Case 2: Compare Quarterly MCF Files

```bash
# Compare two quarters
node mcf-diff.js ./datacommons/2024_q2 ./datacommons/2024_q3

# Generate HTML report
node mcf-diff.js ./datacommons/2024_q2 ./datacommons/2024_q3 \
  --format=html --output=report.html

# View the report
open report.html
```

### Use Case 3: Add Chart Preview to Your React App

```jsx
import React from 'react';
import IndicatorPreview from './IndicatorPreview';
import DataLayer from './data-layer';
import config from './config.prod';

const dataLayer = new DataLayer(config);

function Dashboard() {
  return (
    <IndicatorPreview 
      indicatorId="dc/sdg_1_1_1"
      dataLayer={dataLayer}
      defaultLocation="country/USA"
      defaultStartYear={2015}
      defaultEndYear={2023}
    />
  );
}
```

### Use Case 4: Search Indicators

```javascript
const results = await dataLayer.searchIndicators('poverty');

results.forEach(indicator => {
  console.log(`${indicator.id}: ${indicator.name}`);
});
```

## 🔧 Configuration Options

### Cache Settings

Edit `config.dev.js` or `config.prod.js`:

```javascript
cache: {
  enabled: true,
  path: './catalog-ui-cache.json',
  maxAge: 3600000,  // 1 hour
  
  // Optional: Redis for distributed caching
  redis: {
    enabled: true,
    host: 'localhost',
    port: 6379
  }
}
```

### API Timeouts

```javascript
stat: {
  baseURL: 'https://data.un.org/api/v1',
  timeout: 30000,  // 30 seconds
  retries: 3
}
```

## 📊 Monitoring & Debugging

### View Performance Stats

```javascript
const stats = dataLayer.getStats();

console.log(`
  Cache Hit Rate: ${stats.cacheHitRate}%
  Avg Response Time: ${stats.avgResponseTime}ms
  Total Queries: ${stats.totalQueries}
`);
```

### Check Cache Status

```bash
npm run cache:stats
```

### View Logs

```bash
# Using PM2
pm2 logs undata-integration

# Or check log files
tail -f logs/production.log
```

### Clear Cache

```bash
# Clear entire cache
npm run cache:clear

# Rebuild cache
npm run cache:rebuild
```

## 🚢 Deployment

### Deploy to Staging

```bash
./deploy.sh staging
```

### Deploy to Production

```bash
./deploy.sh production
```

The deploy script automatically:
- ✅ Runs tests
- ✅ Builds cache
- ✅ Generates documentation
- ✅ Starts the application
- ✅ Runs health checks

## 📝 Common Tasks

### Task 1: Update MCF Files

```bash
# 1. Add new MCF files to datacommons/2024_q4/
# 2. Compare with previous quarter
node mcf-diff.js datacommons/2024_q3 datacommons/2024_q4 \
  --format=html --output=q4_changes.html

# 3. Review changes
open q4_changes.html

# 4. Rebuild cache
npm run cache:rebuild

# 5. Restart application
pm2 restart undata-integration
```

### Task 2: Add New React Component

```jsx
// 1. Create your component
import { DataLayer } from './data-layer';

function MyComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const dataLayer = new DataLayer(config);
    dataLayer.query({ ... }).then(result => {
      setData(result.data);
    });
  }, []);
  
  return <div>{/* Your UI */}</div>;
}
```

### Task 3: Export Data to CSV

```javascript
const result = await dataLayer.query({
  indicators: ['dc/sdg_1_1_1'],
  locations: ['country/USA'],
  startYear: 2015,
  endYear: 2023
});

const csv = dataLayer.exportToCSV(result.data);
fs.writeFileSync('export.csv', csv);
```

## 🐛 Troubleshooting

### Problem: Cache not loading

**Solution:**
```bash
# Check if cache file exists
ls -lh catalog-ui-cache.json

# If missing, rebuild
npm run cache:rebuild

# Check permissions
chmod 644 catalog-ui-cache.json
```

### Problem: API timeouts

**Solution:**
```javascript
// Increase timeout in config
stat: {
  timeout: 60000  // Increase to 60 seconds
}
```

### Problem: High memory usage

**Solution:**
```bash
# 1. Check cache size
du -h catalog-ui-cache.json

# 2. Reduce cache age
# In config: maxAge: 1800000  (30 minutes)

# 3. Enable Redis for distributed caching
# In config: redis.enabled = true
```

### Problem: Slow query performance

**Solution:**
```javascript
// 1. Check cache stats
const stats = dataLayer.getCacheStats();
console.log('Hit rate:', stats.hitRate);

// 2. If hit rate is low, rebuild cache
await dataLayer.rebuildCache();

// 3. Pre-cache common queries
await dataLayer.prewarmCache([
  'dc/sdg_1_1_1',
  'dc/sdg_2_1_1',
  // ... your most common indicators
]);
```

## 📚 Learn More

- **Full Documentation**: See `README.md` for complete details
- **Integration Guide**: See `INTEGRATION_GUIDE.md` for advanced usage
- **Examples**: Run `node examples.js` for comprehensive examples
- **API Reference**: Run `npm run build:docs` to generate JSDoc

## 🆘 Getting Help

1. **Check the logs**: `pm2 logs` or `tail -f logs/*.log`
2. **Run health check**: `curl http://localhost:3000/health`
3. **Review examples**: `node examples.js`
4. **Check GitHub Issues**: [github.com/undata/data-commons-integration/issues](https://github.com/undata/data-commons-integration/issues)

## ✅ Next Steps

Now that you're set up, consider:

1. **Customize the cache strategy** for your data access patterns
2. **Add monitoring** (Sentry, New Relic, etc.)
3. **Set up automated MCF comparisons** for each quarterly update
4. **Build custom React components** for your specific use cases
5. **Configure automated backups** of your cache
6. **Set up CI/CD** for automated deployments

## 🎉 You're Ready!

Your UN Data Commons integration is now running with:
- ⚡ Fast cached responses
- 🔄 Automatic fallback to .STAT and Live DC
- 📊 Built-in React components
- 🔍 MCF comparison tools
- 📈 Performance monitoring

Happy coding! 🚀
