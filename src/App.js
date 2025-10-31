import { useState, useEffect } from 'react';
import { FileSelector } from './components/FileSelector';
import DiffViewer from './components/DiffViewer';
import CodeDisplay from './components/CodeDisplay';
import ChartPreview from './components/ChartPreview';
import { CodeEditor } from './components/CodeEditor';
import { ChartFilter } from './components/ChartFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { Sun, Moon, Database } from 'lucide-react';
import { Label } from './components/ui/label';
import { getAllOrganizations, getStatistics } from './real-catalog';
import { parseMCF, extractObservations, observationsToChartData } from './mcf-parser';

// Dynamic MCF file loader - loads real files from public folder
async function loadMCFFile(fileId) {
  try {
    // Convert file ID to public URL path
    const publicPath = `/datacommons/${fileId}`;
    
    console.log('🔍 Loading MCF file:', publicPath);
    
    // Fetch the actual MCF file
    const response = await fetch(publicPath);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    console.log('✅ Loaded file successfully:', publicPath, `(${content.length} chars)`);
    
    return content;
  } catch (error) {
    console.error('❌ Error loading MCF file:', fileId, error);
    
    // Fallback: try GitHub if local fetch fails
    try {
      const githubUrl = `https://raw.githubusercontent.com/UN-Data-Commons/un-data-commons-etl/main/datacommons/${fileId}`;
      console.log('🔄 Trying GitHub fallback:', githubUrl);
      
      const response = await fetch(githubUrl);
      if (response.ok) {
        const content = await response.text();
        console.log('✅ Loaded from GitHub:', githubUrl, `(${content.length} chars)`);
        return content;
      }
    } catch (githubError) {
      console.error('❌ GitHub fallback failed:', githubError);
    }
    
    return null;
  }
}

// Mock MCF data kept for reference (not used - real files loaded via fetch)
const mockMCFData = {
  'unemployment_rate.mcf': {
    'v1.0.0': `Node: UnemploymentRate
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:unemploymentRate
statType: dcs:measuredValue

Node: Observation_UnemploymentRate_US_2020
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2020"
value: 8.1`,
    'v1.1.0': `Node: UnemploymentRate
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:unemploymentRate
statType: dcs:measuredValue
name: "Unemployment Rate"

Node: Observation_UnemploymentRate_US_2020
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2020"
value: 8.1

Node: Observation_UnemploymentRate_US_2021
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2021"
value: 5.4`,
    'v1.2.0': `Node: UnemploymentRate
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:unemploymentRate
statType: dcs:measuredValue
name: "Unemployment Rate"
description: "Percentage of labor force that is unemployed"

Node: Observation_UnemploymentRate_US_2020
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2020"
value: 8.1

Node: Observation_UnemploymentRate_US_2021
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2021"
value: 5.4

Node: Observation_UnemploymentRate_US_2022
typeOf: dcs:StatVarObservation
variableMeasured: dcs:UnemploymentRate
observationAbout: dcid:country/USA
observationDate: "2022"
value: 3.6`,
  },
  'population_census.mcf': {
    'v1.0.0': `Node: PopulationTotal
typeOf: dcs:StatisticalVariable
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue`,
  },
  'gdp_annual.mcf': {
    'v1.0.0': `Node: GDP_Annual
typeOf: dcs:StatisticalVariable
measuredProperty: dcs:amount
statType: dcs:measuredValue`,
  },
  'climate_temperature.mcf': {
    'v1.0.0': `Node: Temperature_Average
typeOf: dcs:StatisticalVariable
measuredProperty: dcs:temperature
statType: dcs:measuredValue`,
  },
};

// Transform functions for different views
const generateRawCode = (mcf) => mcf;

const generateFormattedCode = (mcf) => {
  return mcf
    .split('\n')
    .map((line) => {
      if (line.startsWith('Node:')) return line;
      if (line.trim() === '') return line;
      return '  ' + line;
    })
    .join('\n');
};

const generateStatView = (mcf) => {
  return `# STAT Format
# Generated from MCF

[StatisticalVariable]
${mcf
  .split('\n')
  .filter((line) => line.includes(':'))
  .map((line) => line.replace(/^(Node: |typeOf: |populationType: )/, ''))
  .join('\n')}

# End of STAT file`;
};

const generateDataCommonsView = (mcf) => {
  const nodes = mcf.split('\n\n');
  const jsonNodes = nodes.map((node) => {
    const lines = node.split('\n').filter((l) => l.trim());
    const obj = {};
    lines.forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim().replace(/"/g, '');
      if (key.trim() !== '') {
        obj[key.trim()] = value || '';
      }
    });
    return obj;
  });

  return JSON.stringify({ nodes: jsonNodes }, null, 2);
};

const generateCachedVersion = (mcf) => {
  return `/* 
 * Cached MCF File
 * Generated: ${new Date().toISOString()}
 * Optimized for local website use
 */

${mcf}

/* End of cached file */`;
};

const generateChartData = (mcf) => {
  const observations = mcf.match(/observationDate: "(\d+)"\s+value: ([\d.]+)/g);
  if (!observations) {
    return [
      { name: '2020', value: 8.1 },
      { name: '2021', value: 5.4 },
      { name: '2022', value: 3.6 },
    ];
  }

  return observations.map((obs) => {
    const dateMatch = obs.match(/observationDate: "(\d+)"/);
    const valueMatch = obs.match(/value: ([\d.]+)/);
    return {
      name: dateMatch ? dateMatch[1] : '',
      value: valueMatch ? parseFloat(valueMatch[1]) : 0,
    };
  });
};

const generateYAMLView = (mcf) => {
  // Convert MCF to YAML format
  const nodes = mcf.split('\n\n').filter(n => n.trim());
  
  let yaml = '# MCF to YAML conversion\n---\n';
  
  nodes.forEach((node, idx) => {
    const lines = node.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    
    yaml += `\nnode_${idx + 1}:\n`;
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^"|"$/g, '');
        yaml += `  ${key}: "${value}"\n`;
      }
    });
  });
  
  return yaml;
};

const generateStatYAML = (mcf) => {
  const statContent = generateStatView(mcf);
  return `# STAT Format (YAML)\n---\nstat_format:\n  content: |\n${statContent.split('\n').map(l => '    ' + l).join('\n')}`;
};

const generateDataCommonsYAML = (mcf) => {
  const jsonContent = generateDataCommonsView(mcf);
  try {
    const parsed = JSON.parse(jsonContent);
    return `# DataCommons (YAML)\n---\n${JSON.stringify(parsed, null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')}`;
  } catch {
    return '# Error converting to YAML';
  }
};

const generateCachedYAML = (mcf) => {
  const cachedContent = generateCachedVersion(mcf);
  return `# Cached Version (YAML)\n---\ncached:\n  timestamp: "${new Date().toISOString()}"\n  content: |\n${cachedContent.split('\n').map(l => '    ' + l).join('\n')}`;
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // File selection state (now just file IDs)
  const [selectedFileId, setSelectedFileId] = useState('');
  const [compareFileId, setCompareFileId] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  
  // MCF content state
  const [currentMCFContent, setCurrentMCFContent] = useState('');
  const [compareMCFContent, setCompareMCFContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // View mode states for each tab: 'formatted' | 'raw' | 'yaml' | 'chart' | 'edit'
  const [rawViewMode, setRawViewMode] = useState('formatted');
  const [statViewMode, setStatViewMode] = useState('formatted');
  const [datacommonsViewMode, setDatacommonsViewMode] = useState('formatted');
  const [cachedViewMode, setCachedViewMode] = useState('formatted');
  
  // Edit mode content states
  const [rawEditContent, setRawEditContent] = useState('');
  const [statEditContent, setStatEditContent] = useState('');
  const [datacommonsEditContent, setDatacommonsEditContent] = useState('');
  const [cachedEditContent, setCachedEditContent] = useState('');
  
  // Edit mode chart preview states
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [editPreviewData, setEditPreviewData] = useState([]);
  
  // Chart filtering states
  const [selectedCharts, setSelectedCharts] = useState([]);

  // Load real catalog data
  const [catalogStats, setCatalogStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    // Load real data statistics
    const stats = getStatistics();
    const orgs = getAllOrganizations();
    setCatalogStats(stats);
    setOrganizations(orgs);
    console.log('📊 Real Catalog Loaded:', stats);
    console.log('🏢 Organizations:', orgs);
  }, []);
  
  // Load MCF file when selection changes
  useEffect(() => {
    async function loadFile() {
      if (!selectedFileId) return;
      
      setIsLoading(true);
      try {
        const content = await loadMCFFile(selectedFileId);
        setCurrentMCFContent(content || '');
        console.log('📄 Loaded file:', selectedFileId);
      } catch (error) {
        console.error('Error loading file:', error);
        setCurrentMCFContent('');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFile();
  }, [selectedFileId]);
  
  // Load compare version when diff is shown
  useEffect(() => {
    async function loadCompareFile() {
      if (!showDiff || !compareFileId) {
        setCompareMCFContent('');
        return;
      }
      
      try {
        const content = await loadMCFFile(compareFileId);
        setCompareMCFContent(content || '');
        console.log('📄 Loaded compare file:', compareFileId);
      } catch (error) {
        console.error('Error loading compare file:', error);
        setCompareMCFContent('');
      }
    }
    
    loadCompareFile();
  }, [showDiff, compareFileId]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Use loaded content (or fallback to empty)
  const currentMCF = currentMCFContent;
  const compareMCF = compareMCFContent;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h1>MCF Pipeline Viewer</h1>
                <p className="text-sm text-muted-foreground">
                  End-to-end MCF transformation pipeline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* File Selector */}
      <FileSelector
        onFileSelected={setSelectedFileId}
        onCompareFileSelected={setCompareFileId}
        showDiff={showDiff}
        onToggleDiff={() => setShowDiff(!showDiff)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4 text-center py-4 text-muted-foreground">
            Loading MCF file...
          </div>
        )}
        
        {/* Diff Viewer */}
        {showDiff && !isLoading && (
          <DiffViewer
            oldVersion={compareMCF}
            newVersion={currentMCF}
            oldVersionName={compareFileId}
            newVersionName={selectedFileId}
          />
        )}

        {/* Tabs */}
        <Tabs defaultValue="raw" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="raw" className="text-xs sm:text-sm">
              Raw
            </TabsTrigger>
            <TabsTrigger value="stat" className="text-xs sm:text-sm">
              .STAT
            </TabsTrigger>
            <TabsTrigger value="datacommons" className="text-xs sm:text-sm">
              DataCommons
            </TabsTrigger>
            <TabsTrigger value="cached" className="text-xs sm:text-sm">
              Cached
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="mt-4">
            <div className="space-y-2">
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {rawViewMode === 'formatted' && 'Formatted MCF with proper indentation'}
                  {rawViewMode === 'raw' && 'Raw MCF file content without formatting'}
                  {rawViewMode === 'yaml' && 'YAML representation of MCF data'}
                  {rawViewMode === 'chart' && 'Visual chart representation of the data'}
                  {rawViewMode === 'edit' && 'Edit and modify MCF content - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setRawViewMode('formatted')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'formatted'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setRawViewMode('raw')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'raw'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setRawViewMode('yaml')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'yaml'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    YAML
                  </button>
                  <button
                    onClick={() => setRawViewMode('chart')}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'chart'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => {
                      setRawViewMode('edit');
                      if (!rawEditContent) {
                        setRawEditContent(generateFormattedCode(currentMCF));
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      rawViewMode === 'edit'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              {/* Content Display */}
              {rawViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Chart Visualization</h3>
                        <ChartFilter
                          charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))}
                          selectedCharts={selectedCharts}
                          onSelectionChange={setSelectedCharts}
                        />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart.data} title={chart.title} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : rawViewMode === 'edit' ? (
                <div className="space-y-4">
                  <CodeEditor
                    value={rawEditContent || generateFormattedCode(currentMCF)}
                    onChange={setRawEditContent}
                    language="mcf"
                    placeholder="Edit MCF content..."
                  />
                  <div className="flex gap-2 justify-between">
                    <button
                      onClick={() => {
                        const content = rawEditContent || generateFormattedCode(currentMCF);
                        const nodes = parseMCF(content);
                        const observations = extractObservations(nodes);
                        const chartData = observationsToChartData(observations);
                        setEditPreviewData(chartData);
                        setShowEditPreview(true);
                      }}
                      className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
                    >
                      Preview Chart
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRawEditContent(generateFormattedCode(currentMCF));
                          setShowEditPreview(false);
                        }}
                        className="px-4 py-2 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          const confirmed = window.confirm('Save changes? This will update the current view with your edits.');
                          if (confirmed) {
                            setCurrentMCFContent(rawEditContent);
                            setRawViewMode('formatted');
                            setShowEditPreview(false);
                          }
                        }}
                        className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                  
                  {/* Chart Preview */}
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter
                          charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))}
                          selectedCharts={selectedCharts}
                          onSelectionChange={setSelectedCharts}
                        />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart.data} title={chart.title || `Chart ${index + 1}`} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay
                  code={
                    rawViewMode === 'formatted' 
                      ? generateFormattedCode(currentMCF)
                      : rawViewMode === 'yaml'
                      ? generateYAMLView(currentMCF)
                      : generateRawCode(currentMCF)
                  }
                  language={
                    rawViewMode === 'yaml' ? 'yaml' : 'MCF'
                  }
                  formatted={rawViewMode !== 'raw'}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="stat" className="mt-4">
            <div className="space-y-2">
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {statViewMode === 'formatted' && '.STAT format representation of the MCF data'}
                  {statViewMode === 'raw' && 'Raw .STAT format without formatting'}
                  {statViewMode === 'yaml' && 'YAML representation of .STAT data'}
                  {statViewMode === 'chart' && 'Visual chart from .STAT data'}
                  {statViewMode === 'edit' && 'Edit .STAT content - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setStatViewMode('formatted')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'formatted' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Formatted</button>
                  <button onClick={() => setStatViewMode('raw')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'raw' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
                  <button onClick={() => setStatViewMode('yaml')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'yaml' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>YAML</button>
                  <button onClick={() => setStatViewMode('chart')} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chart</button>
                  <button onClick={() => { setStatViewMode('edit'); if (!statEditContent) setStatEditContent(generateStatView(currentMCF)); }} className={`px-3 py-1 text-xs rounded transition-all ${statViewMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
                </div>
              </div>
              
              {/* Content Display */}
              {statViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">.STAT Chart Visualization</h3>
                        <ChartFilter charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart.data} title={chart.title} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : statViewMode === 'edit' ? (
                <div className="space-y-4">
                  <CodeEditor value={statEditContent || generateStatView(currentMCF)} onChange={setStatEditContent} language="mcf" placeholder="Edit .STAT content..." />
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => { const content = statEditContent || generateStatView(currentMCF); const nodes = parseMCF(content); const observations = extractObservations(nodes); const chartData = observationsToChartData(observations); setEditPreviewData(chartData); setShowEditPreview(true); }} className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors">Preview Chart</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setStatEditContent(generateStatView(currentMCF)); setShowEditPreview(false); }} className="px-4 py-2 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors">Reset</button>
                      <button onClick={() => { if (window.confirm('Apply changes to .STAT view?')) { setStatViewMode('formatted'); setShowEditPreview(false); } }} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Apply Changes</button>
                    </div>
                  </div>
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart.data} title={chart.title || `Chart ${index + 1}`} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay code={statViewMode === 'yaml' ? generateStatYAML(currentMCF) : generateStatView(currentMCF)} language={statViewMode === 'yaml' ? 'yaml' : 'stat'} formatted={statViewMode !== 'raw'} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="datacommons" className="mt-4">
            <div className="space-y-2">
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {datacommonsViewMode === 'formatted' && 'DataCommons JSON representation'}
                  {datacommonsViewMode === 'raw' && 'Raw DataCommons JSON without formatting'}
                  {datacommonsViewMode === 'yaml' && 'YAML representation of DataCommons data'}
                  {datacommonsViewMode === 'chart' && 'Visual chart from DataCommons data'}
                  {datacommonsViewMode === 'edit' && 'Edit DataCommons JSON - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setDatacommonsViewMode('formatted')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'formatted' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Formatted</button>
                  <button onClick={() => setDatacommonsViewMode('raw')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'raw' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
                  <button onClick={() => setDatacommonsViewMode('yaml')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'yaml' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>YAML</button>
                  <button onClick={() => setDatacommonsViewMode('chart')} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chart</button>
                  <button onClick={() => { setDatacommonsViewMode('edit'); if (!datacommonsEditContent) setDatacommonsEditContent(generateDataCommonsView(currentMCF)); }} className={`px-3 py-1 text-xs rounded transition-all ${datacommonsViewMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
                </div>
              </div>
              
              {/* Content Display */}
              {datacommonsViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">DataCommons Chart Visualization</h3>
                        <ChartFilter charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart.data} title={chart.title} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : datacommonsViewMode === 'edit' ? (
                <div className="space-y-4">
                  <CodeEditor value={datacommonsEditContent || generateDataCommonsView(currentMCF)} onChange={setDatacommonsEditContent} language="json" placeholder="Edit DataCommons JSON..." />
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => { const content = datacommonsEditContent || generateDataCommonsView(currentMCF); const nodes = parseMCF(content); const observations = extractObservations(nodes); const chartData = observationsToChartData(observations); setEditPreviewData(chartData); setShowEditPreview(true); }} className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors">Preview Chart</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setDatacommonsEditContent(generateDataCommonsView(currentMCF)); setShowEditPreview(false); }} className="px-4 py-2 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors">Reset</button>
                      <button onClick={() => { if (window.confirm('Apply changes to DataCommons view?')) { setDatacommonsViewMode('formatted'); setShowEditPreview(false); } }} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Apply Changes</button>
                    </div>
                  </div>
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart.data} title={chart.title || `Chart ${index + 1}`} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay code={datacommonsViewMode === 'yaml' ? generateDataCommonsYAML(currentMCF) : generateDataCommonsView(currentMCF)} language={datacommonsViewMode === 'yaml' ? 'yaml' : 'json'} formatted={datacommonsViewMode !== 'raw'} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cached" className="mt-4">
            <div className="space-y-2">
              {/* View Mode Buttons */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {cachedViewMode === 'formatted' && 'Cached version optimized for local website use'}
                  {cachedViewMode === 'raw' && 'Raw cached version without formatting'}
                  {cachedViewMode === 'yaml' && 'YAML representation of cached data'}
                  {cachedViewMode === 'chart' && 'Visual chart from cached data'}
                  {cachedViewMode === 'edit' && 'Edit cached content - changes are local'}
                </p>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setCachedViewMode('formatted')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'formatted' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Formatted</button>
                  <button onClick={() => setCachedViewMode('raw')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'raw' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
                  <button onClick={() => setCachedViewMode('yaml')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'yaml' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>YAML</button>
                  <button onClick={() => setCachedViewMode('chart')} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'chart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Chart</button>
                  <button onClick={() => { setCachedViewMode('edit'); if (!cachedEditContent) setCachedEditContent(generateCachedVersion(currentMCF)); }} className={`px-3 py-1 text-xs rounded transition-all ${cachedViewMode === 'edit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
                </div>
              </div>
              
              {/* Content Display */}
              {cachedViewMode === 'chart' ? (
                (() => {
                  const nodes = parseMCF(currentMCF);
                  const observations = extractObservations(nodes);
                  const chartDataArray = observationsToChartData(observations);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Cached Chart Visualization</h3>
                        <ChartFilter charts={chartDataArray.map((chart, i) => ({ id: `chart-${i}`, name: chart.title, title: chart.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      {chartDataArray.map((chart, index) => {
                        const chartId = `chart-${index}`;
                        if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                          return <ChartPreview key={index} data={chart.data} title={chart.title} />;
                        }
                        return null;
                      })}
                    </div>
                  );
                })()
              ) : cachedViewMode === 'edit' ? (
                <div className="space-y-4">
                  <CodeEditor value={cachedEditContent || generateCachedVersion(currentMCF)} onChange={setCachedEditContent} language="mcf" placeholder="Edit cached content..." />
                  <div className="flex gap-2 justify-between">
                    <button onClick={() => { const content = cachedEditContent || generateCachedVersion(currentMCF); const nodes = parseMCF(content); const observations = extractObservations(nodes); const chartData = observationsToChartData(observations); setEditPreviewData(chartData); setShowEditPreview(true); }} className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors">Preview Chart</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setCachedEditContent(generateCachedVersion(currentMCF)); setShowEditPreview(false); }} className="px-4 py-2 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors">Reset</button>
                      <button onClick={() => { if (window.confirm('Apply changes to Cached view?')) { setCachedViewMode('formatted'); setShowEditPreview(false); } }} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Apply Changes</button>
                    </div>
                  </div>
                  {showEditPreview && editPreviewData.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Chart Preview</h3>
                        <ChartFilter charts={editPreviewData.map((data, i) => ({ id: `chart-${i}`, name: data.title || `Chart ${i + 1}`, title: data.title }))} selectedCharts={selectedCharts} onSelectionChange={setSelectedCharts} />
                      </div>
                      <div className="space-y-4">
                        {editPreviewData.map((chart, index) => {
                          const chartId = `chart-${index}`;
                          if (selectedCharts.length === 0 || selectedCharts.includes(chartId)) {
                            return <ChartPreview key={index} data={chart.data} title={chart.title || `Chart ${index + 1}`} />;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <CodeDisplay code={cachedViewMode === 'yaml' ? generateCachedYAML(currentMCF) : generateCachedVersion(currentMCF)} language={cachedViewMode === 'yaml' ? 'yaml' : 'mcf'} formatted={cachedViewMode !== 'raw'} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            MCF Pipeline Viewer - Material Design Dark Mode
          </p>
        </div>
      </footer>
    </div>
  );
}
