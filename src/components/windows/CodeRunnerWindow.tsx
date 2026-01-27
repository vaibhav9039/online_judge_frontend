import React, { useState } from 'react';
import { executeCode, ExecutionResult } from '../../services/codeExecutionService';

const CODE_TEMPLATES = {
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
};

export function CodeRunnerWindow() {
  const [language, setLanguage] = useState<'java' | 'cpp'>('java');
  const [code, setCode] = useState(CODE_TEMPLATES.java);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (lang: 'java' | 'cpp') => {
    setLanguage(lang);
    setCode(CODE_TEMPLATES[lang]);
    setOutput(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    
    try {
      const result = await executeCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput({
        output: '',
        error: 'Execution failed. Please try again.',
        executionTime: 0,
        status: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 p-1">
      {/* Toolbar */}
      <div className="xp-panel flex items-center gap-2 p-1">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold">Language:</span>
          <button
            className={`xp-button text-xs px-2 ${language === 'java' ? 'xp-button-pressed' : ''}`}
            onClick={() => handleLanguageChange('java')}
          >
            ☕ Java
          </button>
          <button
            className={`xp-button text-xs px-2 ${language === 'cpp' ? 'xp-button-pressed' : ''}`}
            onClick={() => handleLanguageChange('cpp')}
          >
            ⚙️ C++
          </button>
        </div>
        <div className="flex-1" />
        <button
          className="xp-button-primary text-xs px-4 flex items-center gap-1"
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
        >
          {isRunning ? (
            <>
              <span className="animate-spin">⏳</span>
              Running...
            </>
          ) : (
            <>
              ▶️ Run Code
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="xp-panel-header text-xs px-2 py-0.5">
          📝 Code Editor - {language === 'java' ? 'Main.java' : 'main.cpp'}
        </div>
        <textarea
          className="xp-input flex-1 font-mono text-xs resize-none xp-scroll"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Write your ${language.toUpperCase()} code here...`}
          spellCheck={false}
        />
      </div>

      {/* Output */}
      <div className="h-32 flex flex-col">
        <div className="xp-panel-header text-xs px-2 py-0.5 flex items-center justify-between">
          <span>📤 Output</span>
          {output && (
            <span className={`text-xs ${output.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {output.status === 'success' ? '✓ Success' : '✗ Error'} 
              ({output.executionTime.toFixed(0)}ms)
            </span>
          )}
        </div>
        <div className="xp-panel-inset flex-1 p-2 font-mono text-xs overflow-auto xp-scroll bg-black text-green-400">
          {isRunning ? (
            <div className="flex items-center gap-2">
              <span className="animate-pulse">▌</span>
              Compiling and executing...
            </div>
          ) : output ? (
            <>
              {output.error ? (
                <pre className="text-red-400 whitespace-pre-wrap">{output.error}</pre>
              ) : (
                <pre className="whitespace-pre-wrap">{output.output}</pre>
              )}
            </>
          ) : (
            <span className="text-gray-500">Click "Run Code" to execute your program...</span>
          )}
        </div>
      </div>

      {/* Demo notice */}
      <div className="xp-panel p-1 text-xs text-center text-muted-foreground">
        ⚠️ Demo Mode - Output is simulated. Configure API for real execution.
      </div>
    </div>
  );
}
