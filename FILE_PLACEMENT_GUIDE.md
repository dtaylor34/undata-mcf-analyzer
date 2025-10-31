# Quick File Placement Guide

## 🎯 Where Do Files Go?

### Visual File Structure

```
your-react-app/
│
├── src/                                    ← React source code
│   │
│   ├── undata-integration/                ← CREATE THIS FOLDER
│   │   ├── data-layer.js                  ← PLACE HERE (backend logic)
│   │   ├── config.dev.js                  ← PLACE HERE (dev config)
│   │   ├── config.prod.js                 ← PLACE HERE (prod config)
│   │   └── mcf-diff.js                    ← PLACE HERE (comparison tool)
│   │
│   ├── components/                         ← React components folder
│   │   └── IndicatorPreview.jsx           ← PLACE HERE (React component)
│   │
│   ├── App.js                              ← EDIT THIS (add imports)
│   └── index.js
│
├── .env                                    ← CREATE FROM .env.example
├── package.json                            ← UPDATE (add dependencies)
├── deploy.sh                               ← PLACE IN ROOT
├── examples.js                             ← PLACE IN ROOT (for testing)
└── MACOS_SETUP.md                          ← PLACE IN ROOT (reference)
```

---

## 📦 File-by-File Placement

| File | Goes In | Purpose |
|------|---------|---------|
| **data-layer.js** | `src/undata-integration/` | Backend integration logic |
| **config.dev.js** | `src/undata-integration/` | Development settings |
| **config.prod.js** | `src/undata-integration/` | Production settings |
| **mcf-diff.js** | `src/undata-integration/` | Compare MCF files |
| **IndicatorPreview.jsx** | `src/components/` | React chart component |
| **.env.example** | Root (rename to `.env`) | Your API keys |
| **deploy.sh** | Root | Deployment script |
| **examples.js** | Root | Testing examples |
| **package.json** | Root | Add dependencies |

---

## ⚡ Quick Copy-Paste Commands

### For Existing React App
```bash
# Step 1: Navigate to your app
cd /path/to/your/react-app

# Step 2: Create folders
mkdir -p src/undata-integration
mkdir -p src/components

# Step 3: Copy files (from Downloads or wherever you extracted zip)
cp ~/Downloads/undata-integration-package/data-layer.js src/undata-integration/
cp ~/Downloads/undata-integration-package/config.dev.js src/undata-integration/
cp ~/Downloads/undata-integration-package/config.prod.js src/undata-integration/
cp ~/Downloads/undata-integration-package/mcf-diff.js src/undata-integration/
cp ~/Downloads/undata-integration-package/IndicatorPreview.jsx src/components/
cp ~/Downloads/undata-integration-package/.env.example .env
cp ~/Downloads/undata-integration-package/deploy.sh .
cp ~/Downloads/undata-integration-package/examples.js .

# Step 4: Install dependencies
npm install axios recharts
```

### For New React App
```bash
# Step 1: Create new React app
npx create-react-app my-undata-app
cd my-undata-app

# Step 2: Follow Step 2-4 from above
```

---

## 🔧 What To Edit After Copying

### 1. Edit `.env` file
```bash
nano .env
```
Add your API keys:
```
REACT_APP_DC_API_KEY=your_actual_api_key
REACT_APP_DC_API_URL=https://datacommons.undata.org/api
REACT_APP_STAT_API_URL=https://data.un.org/api/v1
```

### 2. Edit `src/App.js`
Add these imports at the top:
```javascript
import IndicatorPreview from './components/IndicatorPreview';
import DataLayer from './undata-integration/data-layer';
import config from './undata-integration/config.dev';
```

Then use the component:
```javascript
function App() {
  const [dataLayer, setDataLayer] = useState(null);
  
  useEffect(() => {
    const dl = new DataLayer(config);
    dl.initialize().then(() => setDataLayer(dl));
  }, []);

  return (
    <div className="App">
      {dataLayer && (
        <IndicatorPreview 
          indicatorId="dc/sdg_1_1_1"
          dataLayer={dataLayer}
        />
      )}
    </div>
  );
}
```

### 3. Update `package.json`
Add to dependencies:
```json
"axios": "^1.6.0",
"recharts": "^2.10.0"
```

Then run: `npm install`

---

## ✅ Verify Everything Works

```bash
# Start your app
npm start

# Should open http://localhost:3000
# You should see a chart with SDG data
```

---

## 🎯 That's It!

Three main locations:
1. **Backend files** → `src/undata-integration/`
2. **React component** → `src/components/`
3. **Config files** → Root directory

The key is keeping backend logic separate from React components for clean architecture.
