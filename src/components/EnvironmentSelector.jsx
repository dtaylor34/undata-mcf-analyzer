/**
 * FILE: src/components/EnvironmentSelector.jsx
 * PURPOSE: Environment selector dropdown for Staging/Test/Production
 * 
 * FEATURES:
 * - Switch between Staging, Test, and Production
 * - Visual indicators with icons and colors
 * - Persists selection to localStorage
 * - Shows current environment status
 */

import React, { useState, useEffect } from 'react';
import { 
  getAllEnvironments, 
  getCurrentEnvironment, 
  setEnvironment, 
  getEnvironmentConfig 
} from '../utils/environment-config';

export function EnvironmentSelector({ isDarkMode }) {
  const [currentEnv, setCurrentEnv] = useState(getCurrentEnvironment());
  const [isOpen, setIsOpen] = useState(false);
  
  const environments = getAllEnvironments();
  const currentConfig = getEnvironmentConfig(currentEnv);

  const handleEnvironmentChange = (envId) => {
    setEnvironment(envId);
    setCurrentEnv(envId);
    setIsOpen(false);
    
    // Reload page to apply new environment to all charts
    window.location.reload();
  };

  // Color mapping for Tailwind classes
  const colorClasses = {
    orange: {
      bg: isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100',
      border: isDarkMode ? 'border-orange-700' : 'border-orange-300',
      text: isDarkMode ? 'text-orange-400' : 'text-orange-700',
      hover: isDarkMode ? 'hover:bg-orange-800/50' : 'hover:bg-orange-200'
    },
    blue: {
      bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
      border: isDarkMode ? 'border-blue-700' : 'border-blue-300',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-700',
      hover: isDarkMode ? 'hover:bg-blue-800/50' : 'hover:bg-blue-200'
    },
    green: {
      bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
      border: isDarkMode ? 'border-green-700' : 'border-green-300',
      text: isDarkMode ? 'text-green-400' : 'text-green-700',
      hover: isDarkMode ? 'hover:bg-green-800/50' : 'hover:bg-green-200'
    }
  };

  const currentColors = colorClasses[currentConfig.color];

  return (
    <div className="relative">
      {/* Current Environment Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
          isDarkMode
            ? 'bg-gray-700 text-white hover:bg-gray-600'
            : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
        }`}
        title={`Current: ${currentConfig.name} - Click to change`}
      >
        <span className={`font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Environment |</span>
        <span className="font-bold">{currentConfig.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-2xl border-2 z-50 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select Environment
              </div>
            </div>
            
            <div className="p-2">
              {environments.map((env) => {
                const isActive = env.id === currentEnv;
                const envColors = colorClasses[env.color];
                
                return (
                  <button
                    key={env.id}
                    onClick={() => handleEnvironmentChange(env.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? `${envColors.bg} ${envColors.border} border-2` 
                        : `${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                    }`}
                  >
                    {/* Checkbox */}
                    <div 
                      className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center"
                      style={{
                        borderColor: isActive ? '#3b82f6' : isDarkMode ? '#6b7280' : '#d1d5db',
                        backgroundColor: isActive ? '#3b82f6' : 'transparent'
                      }}
                    >
                      {isActive && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          isActive 
                            ? envColors.text 
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {env.name}
                        </span>
                        {isActive && (
                          <span className={`text-xs px-2 py-0.5 rounded ${envColors.bg} ${envColors.text}`}>
                            Active
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {env.description}
                      </div>
                      <div className={`text-xs mt-1 font-mono ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {env.baseUrl.replace('https://', '').split('/')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={`p-3 border-t text-xs ${
              isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
            }`}>
              💡 Changing environment will reload the page
            </div>
          </div>
        </>
      )}
    </div>
  );
}

