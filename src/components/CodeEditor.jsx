import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

// Add custom light theme styles
const lightThemeStyles = `
  .language-mcf .token.comment { color: #6a737d; }
  .language-mcf .token.property { color: #005cc5; }
  .language-mcf .token.string { color: #032f62; }
  .language-mcf .token.keyword { color: #d73a49; }
  .language-mcf .token.operator { color: #24292e; }
  .language-json .token.property { color: #005cc5; }
  .language-json .token.string { color: #032f62; }
  .language-json .token.number { color: #005cc5; }
  .language-json .token.boolean { color: #005cc5; }
  .language-json .token.null { color: #005cc5; }
  .language-yaml .token.atrule { color: #005cc5; }
  .language-yaml .token.string { color: #032f62; }
  .language-yaml .token.number { color: #005cc5; }
  .language-yaml .token.boolean { color: #005cc5; }
`;

// Inject light theme styles if needed
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('prism-light-theme');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'prism-light-theme';
    style.textContent = lightThemeStyles;
    document.head.appendChild(style);
  }
}

// Custom MCF language definition
languages.mcf = {
  'comment': /^#.*/m,
  'property': /^[A-Za-z]+(?=:)/m,
  'string': /"(?:\\.|[^\\"])*"/,
  'keyword': /\b(?:Node|typeOf|name|description|populationType|measuredProperty|statType|observationDate|value|observationAbout|variableMeasured)\b/,
  'operator': /:/,
  'punctuation': /[{}[\],]/
};

export function CodeEditor({ value, onChange, language = 'mcf', placeholder = 'Enter code here...', isDarkMode = true }) {
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  const highlightCode = (code) => {
    try {
      let lang = languages.mcf;
      
      if (language === 'yaml') {
        lang = languages.yaml;
      } else if (language === 'json') {
        lang = languages.json;
      } else if (language === 'javascript' || language === 'js') {
        lang = languages.javascript;
      }
      
      return highlight(code, lang, language);
    } catch (e) {
      return code;
    }
  };

  // Theme colors
  const bgColor = isDarkMode ? '#1e1e1e' : '#f5f5f5';
  const lineNumBg = isDarkMode ? '#252525' : '#e8e8e8';
  const lineNumColor = isDarkMode ? '#858585' : '#6b7280';
  const textColor = isDarkMode ? '#d4d4d4' : '#111827';
  const borderColor = isDarkMode ? '#333' : '#d1d5db';

  return (
    <div 
      className="relative flex border rounded-lg overflow-hidden font-mono text-sm"
      style={{ 
        backgroundColor: bgColor,
        borderColor: borderColor
      }}
    >
      {/* Line numbers */}
      <div 
        className="flex-shrink-0 text-right py-4 pr-3 pl-4 select-none border-r"
        style={{
          backgroundColor: lineNumBg,
          color: lineNumColor,
          borderColor: borderColor
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlightCode}
          padding={16}
          placeholder={placeholder}
          style={{
            fontFamily: '"Fira Code", "Fira Mono", Monaco, Menlo, Consolas, monospace',
            fontSize: 14,
            lineHeight: 1.5,
            minHeight: '500px',
            backgroundColor: bgColor,
            color: textColor,
            outline: 'none',
          }}
          textareaClassName="focus:outline-none"
          preClassName="language-mcf"
        />
      </div>
    </div>
  );
}

