import { useState, useEffect } from 'react';
import { FileSelector } from './components/FileSelector';
import DiffViewer from './components/DiffViewer';
import CodeDisplay from './components/CodeDisplay';
import ChartPreview from './components/ChartPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { Sun, Moon, Database } from 'lucide-react';
import { Label } from './components/ui/label';
import { getAllOrganizations, getStatistics } from './real-catalog';
import { getAllFiles, getComparableVersions } from './mcf-file-index';
import { parseMCF, extractObservations, observationsToChartData } from './mcf-parser';

// Dynamic MCF file loader
async function loadMCFFile(fileId) {
  try {
    // Map file ID to actual file path
    const allFiles = getAllFiles();
    const fileInfo = allFiles.find(f => f.id === fileId);
    
    if (!fileInfo) {
      console.error('File not found:', fileId);
      return null;
    }
    
    // For demo: Generate sample content based on file
    // TODO: Replace with actual file loading when build system supports it
    return generateSampleMCF(fileInfo);
  } catch (error) {
    console.error('Error loading MCF file:', error);
    return null;
  }
}

// Generate sample MCF content (placeholder until file loading is implemented)
function generateSampleMCF(fileInfo) {
  return `Node: ${fileInfo.id.replace(/\//g, '_')}
typeOf: dcs:StatisticalVariable
name: "${fileInfo.name}"
populationType: dcs:Person
measuredProperty: dcs:count
statType: dcs:measuredValue
description: "MCF file from ${fileInfo.orgName}"

Node: Observation_${fileInfo.id.replace(/\//g, '_')}_2020
typeOf: dcs:StatVarObservation
variableMeasured: ${fileInfo.id.replace(/\//g, '_')}
observationAbout: dcid:country/USA
observationDate: "2020"
value: 100

Node: Observation_${fileInfo.id.replace(/\//g, '_')}_2021
typeOf: dcs:StatVarObservation
variableMeasured: ${fileInfo.id.replace(/\//g, '_')}
observationAbout: dcid:country/USA
observationDate: "2021"
value: 120

Node: Observation_${fileInfo.id.replace(/\//g, '_')}_2022
typeOf: dcs:StatVarObservation
variableMeasured: ${fileInfo.id.replace(/\//g, '_')}
observationAbout: dcid:country/USA
observationDate: "2022"
value: 150`;
}

// Sample MCF data for demonstration (will be replaced by dynamic loading)
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

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // File selection state
  const [selectedFile, setSelectedFile] = useState('ilo/schema/schema.mcf'); // Default to ILO schema
  const [selectedVersion, setSelectedVersion] = useState('');
  const [compareVersion, setCompareVersion] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  
  // MCF content state
  const [currentMCFContent, setCurrentMCFContent] = useState('');
  const [compareMCFContent, setCompareMCFContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (!selectedFile) return;
      
      setIsLoading(true);
      try {
        const fileId = selectedVersion || selectedFile;
        const content = await loadMCFFile(fileId);
        setCurrentMCFContent(content || '');
        console.log('📄 Loaded file:', fileId);
      } catch (error) {
        console.error('Error loading file:', error);
        setCurrentMCFContent('');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFile();
  }, [selectedFile, selectedVersion]);
  
  // Load compare version when diff is shown
  useEffect(() => {
    async function loadCompareFile() {
      if (!showDiff || !compareVersion) {
        setCompareMCFContent('');
        return;
      }
      
      try {
        const content = await loadMCFFile(compareVersion);
        setCompareMCFContent(content || '');
        console.log('📄 Loaded compare file:', compareVersion);
      } catch (error) {
        console.error('Error loading compare file:', error);
        setCompareMCFContent('');
      }
    }
    
    loadCompareFile();
  }, [showDiff, compareVersion]);

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
  
  // Parse MCF and extract chart data
  const chartData = currentMCF ? (() => {
    const nodes = parseMCF(currentMCF);
    const observations = extractObservations(nodes);
    return observationsToChartData(observations);
  })() : [];

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
        selectedFile={selectedFile}
        selectedVersion={selectedVersion}
        compareVersion={compareVersion}
        onFileChange={setSelectedFile}
        onVersionChange={setSelectedVersion}
        onCompareVersionChange={setCompareVersion}
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
            oldVersionName={compareVersion}
            newVersionName={selectedVersion}
          />
        )}

        {/* Tabs */}
        <Tabs defaultValue="raw" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="raw" className="text-xs sm:text-sm">
              Raw
            </TabsTrigger>
            <TabsTrigger value="formatted" className="text-xs sm:text-sm">
              Formatted
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
            <TabsTrigger value="chart" className="text-xs sm:text-sm">
              Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Raw MCF file content without formatting
              </p>
              <CodeDisplay
                code={generateRawCode(currentMCF)}
                language="MCF"
                formatted={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="formatted" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Formatted MCF file with proper indentation
              </p>
              <CodeDisplay
                code={generateFormattedCode(currentMCF)}
                language="MCF (Formatted)"
                formatted={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="stat" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                .STAT format representation of the MCF data
              </p>
              <CodeDisplay
                code={generateStatView(currentMCF)}
                language="STAT (Formatted)"
                formatted={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="datacommons" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                DataCommons JSON representation
              </p>
              <CodeDisplay
                code={generateDataCommonsView(currentMCF)}
                language="JSON (Formatted)"
                formatted={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="cached" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Cached version optimized for local website use
              </p>
              <CodeDisplay
                code={generateCachedVersion(currentMCF)}
                language="MCF (Formatted)"
                formatted={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Visual representation of the data
              </p>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading chart data...</div>
              ) : chartData.length > 0 ? (
                <ChartPreview
                  data={chartData}
                  title="Data Visualization"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No observation data available for charting
                </div>
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
