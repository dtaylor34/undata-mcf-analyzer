import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme

// Custom MCF language definition
languages.mcf = {
  'comment': /^#.*/m,
  'property': /^[A-Za-z]+(?=:)/m,
  'string': /"(?:\\.|[^\\"])*"/,
  'keyword': /\b(?:Node|typeOf|name|description|populationType|measuredProperty|statType|observationDate|value|observationAbout|variableMeasured)\b/,
  'operator': /:/,
  'punctuation': /[{}[\],]/
};

export function CodeEditor({ value, onChange, language = 'mcf', placeholder = 'Enter code here...' }) {
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

  return (
    <div className="relative flex border border-border rounded-lg overflow-hidden bg-[#1e1e1e] font-mono text-sm">
      {/* Line numbers */}
      <div className="flex-shrink-0 bg-[#252525] text-[#858585] text-right py-4 pr-3 pl-4 select-none border-r border-[#333]">
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
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            outline: 'none',
          }}
          textareaClassName="focus:outline-none"
          preClassName="language-mcf"
        />
      </div>
    </div>
  );
}

