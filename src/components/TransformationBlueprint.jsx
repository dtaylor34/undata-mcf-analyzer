/**
 * FILE: src/components/TransformationBlueprint.jsx
 * PURPOSE: Visual representation of CSV → MCF transformation mapping
 * 
 * FEATURES:
 * - Side-by-side CSV column → MCF field mapping
 * - Visual connectors between source and target
 * - Editable transformation rules
 * - Sample data preview
 * - Download blueprint as JSON
 */

import React, { useState } from 'react';
import { ArrowRight, Download, Edit3, Check, X } from 'lucide-react';

export default function TransformationBlueprint({ 
  csvColumns = [], 
  mcfMapping = {},
  sampleData = [],
  onUpdateMapping,
  isDarkMode 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMapping, setEditedMapping] = useState(mcfMapping);
  
  // Default example if no data provided
  const exampleColumns = csvColumns.length > 0 ? csvColumns : [
    { name: 'Country', example: 'Afghanistan', type: 'string' },
    { name: 'Year', example: '2024', type: 'number' },
    { name: 'Indicator', example: 'EMP_RATE', type: 'string' },
    { name: 'Value', example: '45.2', type: 'number' },
    { name: 'Unit', example: '%', type: 'string' },
    { name: 'Source', example: 'ILO STAT', type: 'string' }
  ];
  
  const exampleMapping = Object.keys(mcfMapping).length > 0 ? mcfMapping : {
    'Country': {
      mcfField: 'geoId',
      mcfType: 'dcid:country/',
      transformation: 'convertToISO3166',
      example: 'dcid:country/AFG'
    },
    'Year': {
      mcfField: 'observationDate',
      mcfType: 'string',
      transformation: 'toISODate',
      example: '2024'
    },
    'Indicator': {
      mcfField: 'variableMeasured',
      mcfType: 'dcid',
      transformation: 'mapToDataCommonsVariable',
      example: 'dcid:Count_Person_Employed'
    },
    'Value': {
      mcfField: 'value',
      mcfType: 'number',
      transformation: 'parseFloat',
      example: '45.2'
    },
    'Unit': {
      mcfField: 'unit',
      mcfType: 'string',
      transformation: 'mapToStandardUnit',
      example: 'Percent'
    },
    'Source': {
      mcfField: 'provenanceUrl',
      mcfType: 'url',
      transformation: 'none',
      example: 'https://ilostat.ilo.org'
    }
  };
  
  const handleSave = () => {
    if (onUpdateMapping) {
      onUpdateMapping(editedMapping);
    }
    setIsEditing(false);
  };
  
  const handleDownload = () => {
    const blueprint = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      columns: exampleColumns,
      mapping: exampleMapping,
      transformationRules: getTransformationRules()
    };
    
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformation-blueprint.json';
    a.click();
  };
  
  const getTransformationRules = () => {
    return [
      { rule: 'Country names → ISO 3166-1 alpha-3 codes', example: 'Afghanistan → AFG' },
      { rule: 'Indicator codes → Data Commons variable IDs', example: 'EMP_RATE → dcid:Count_Person_Employed' },
      { rule: 'Date formats → ISO 8601', example: '2024 → 2024' },
      { rule: 'Missing values → Skip or default to 0', example: 'null → 0' },
      { rule: 'Unit symbols → Standard unit names', example: '% → Percent' }
    ];
  };
  
  return (
    <div className={`rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'} shadow-lg`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📋 Transformation Blueprint
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              CSV → MCF Conversion Map
            </p>
          </div>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Rules
                </button>
                <button
                  onClick={handleDownload}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${
                    isDarkMode 
                      ? 'border-gray-700 text-white hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedMapping(mcfMapping);
                    setIsEditing(false);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${
                    isDarkMode 
                      ? 'border-gray-700 text-white hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mapping Visualization */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* CSV Structure */}
          <div className="col-span-5">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                <span className="text-xl">📊</span>
                CSV Structure (Source)
              </h4>
              
              <div className="space-y-3">
                {exampleColumns.map((column, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-900' : 'bg-white'
                    }`}
                  >
                    <div className={`font-mono font-bold text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      {column.name}
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Example: <span className="font-mono">{column.example}</span>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Type: {column.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Arrow Connectors */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="space-y-12">
              {exampleColumns.map((_, idx) => (
                <div key={idx} className="flex items-center justify-center">
                  <ArrowRight className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              ))}
            </div>
          </div>
          
          {/* MCF Output */}
          <div className="col-span-5">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                <span className="text-xl">📄</span>
                MCF Output (Target)
              </h4>
              
              <div className="space-y-3">
                {exampleColumns.map((column, idx) => {
                  const mapping = exampleMapping[column.name];
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-900' : 'bg-white'
                      }`}
                    >
                      <div className={`font-mono font-bold text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                        {mapping?.mcfField || 'unmapped'}
                      </div>
                      <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Example: <span className="font-mono">{mapping?.example || 'N/A'}</span>
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Type: {mapping?.mcfType || 'unknown'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Transformation Rules */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🔄 Transformation Rules
          </h4>
          <div className="space-y-2">
            {getTransformationRules().map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {rule.rule}
                  </div>
                  <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {rule.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* MCF Preview */}
        <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📝 Generated MCF (Sample)
          </h4>
          <pre className={`text-xs font-mono p-3 rounded overflow-x-auto ${
            isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'
          }`}>
{`Node: dcid:o/Afghanistan_2024_EMP_RATE
typeOf: dcid:StatVarObservation
observationAbout: dcid:country/AFG
observationDate: "2024"
variableMeasured: dcid:Count_Person_Employed
value: 45.2
unit: Percent
provenanceUrl: "https://ilostat.ilo.org"`}
          </pre>
        </div>
      </div>
    </div>
  );
}

