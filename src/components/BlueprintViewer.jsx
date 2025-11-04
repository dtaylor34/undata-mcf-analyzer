/**
 * FILE: src/components/BlueprintViewer.jsx
 * PURPOSE: Display transformation blueprints and rules for converting between formats
 */

import React from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

export default function BlueprintViewer({ blueprint, isDarkMode, onClose }) {
  if (!blueprint) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-auto rounded-lg shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } z-10`}>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {blueprint.title}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {blueprint.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* MCF Structure */}
          {blueprint.structure && (
            <div>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📋 Structure
              </h4>
              {Object.entries(blueprint.structure).map(([key, value]) => (
                <div key={key} className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <h5 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {key}
                  </h5>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {value.description}
                  </p>
                  <div className="mb-2">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Required Fields:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {value.requiredFields.map(field => (
                        <span key={field} className={`px-2 py-1 rounded text-xs ${
                          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                        }`}>
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                  <pre className={`mt-2 p-3 rounded text-xs font-mono overflow-auto ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                  }`}>
{value.example}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {/* Key Principles */}
          {blueprint.keyPrinciples && (
            <div>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                💡 Key Principles
              </h4>
              <ul className="space-y-2">
                {blueprint.keyPrinciples.map((principle, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {principle}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Transformation Rules */}
          {blueprint.transformationRules && (
            <div>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🔄 Transformation Rules
              </h4>
              <div className="space-y-4">
                {blueprint.transformationRules.map((rule, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Step {rule.step}
                      </span>
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rule.rule}
                      </span>
                    </div>
                    {rule.logic && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {rule.logic}
                      </p>
                    )}
                    {rule.mapping && (
                      <div className="mt-2">
                        <pre className={`p-3 rounded text-xs font-mono ${
                          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                        }`}>
{JSON.stringify(rule.mapping, null, 2)}
                        </pre>
                      </div>
                    )}
                    {rule.dimensions && (
                      <ul className="mt-2 space-y-1">
                        {rule.dimensions.map((dim, dimIdx) => (
                          <li key={dimIdx} className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            • {dim}
                          </li>
                        ))}
                      </ul>
                    )}
                    {rule.structure && (
                      <div className="mt-2">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Structure: {rule.structure}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {rule.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Example Transformation */}
          {blueprint.exampleTransformation && (
            <div>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📝 Example Transformation
              </h4>
              
              {blueprint.exampleTransformation.mcfInput && (
                <div className="mb-4">
                  <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    MCF Input:
                  </h5>
                  <pre className={`p-4 rounded-lg text-xs font-mono overflow-auto ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                  }`}>
{blueprint.exampleTransformation.mcfInput}
                  </pre>
                </div>
              )}
              
              <div className="flex items-center justify-center my-3">
                <ArrowRight className="h-6 w-6 text-blue-500" />
              </div>
              
              {blueprint.exampleTransformation.sdmxOutput && (
                <div>
                  <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    SDMX-JSON Output:
                  </h5>
                  <pre className={`p-4 rounded-lg text-xs font-mono overflow-auto ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                  }`}>
{blueprint.exampleTransformation.sdmxOutput}
                  </pre>
                </div>
              )}
              
              {blueprint.exampleTransformation.datacommonsOutput && (
                <div>
                  <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    DataCommons JSON Output:
                  </h5>
                  <pre className={`p-4 rounded-lg text-xs font-mono overflow-auto ${
                    isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                  }`}>
{blueprint.exampleTransformation.datacommonsOutput}
                  </pre>
                </div>
              )}
              
              {blueprint.exampleTransformation.cachedOutputs && (
                <div className="space-y-4">
                  {Object.entries(blueprint.exampleTransformation.cachedOutputs).map(([key, output]) => (
                    <div key={key}>
                      <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()} ({output.path}):
                      </h5>
                      <pre className={`p-4 rounded-lg text-xs font-mono overflow-auto ${
                        isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                      }`}>
{output.content}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Performance Optimization */}
          {blueprint.performanceOptimization && (
            <div>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ⚡ Performance Optimization
              </h4>
              <ul className="space-y-2">
                {blueprint.performanceOptimization.map((optimization, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {optimization}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

