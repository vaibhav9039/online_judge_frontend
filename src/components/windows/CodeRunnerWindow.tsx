import React, { useState, useEffect, useCallback } from 'react';
import {
  executeCode,
  ExecutionResult,
  CODE_TEMPLATES,
  historyService,
  HistoryItem,
} from '../../services/codeExecutionService';

export function CodeRunnerWindow() {
  const [language, setLanguage] = useState<'java' | 'cpp'>('java');
  const [code, setCode] = useState(CODE_TEMPLATES.java['Hello World']);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [showInput, setShowInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHistory(historyService.getHistory());
  }, []);

  const handleLanguageChange = (lang: 'java' | 'cpp') => {
    setLanguage(lang);
    setCode(CODE_TEMPLATES[lang]['Hello World']);
    setOutput(null);
    setShowTemplates(false);
  };

  const handleTemplateSelect = (templateName: string) => {
    setCode(CODE_TEMPLATES[language][templateName]);
    setShowTemplates(false);
    setOutput(null);
  };

  const handleRun = useCallback(async () => {
    if (isRunning || !code.trim()) return;

    setIsRunning(true);
    setOutput(null);

    try {
      const result = await executeCode(code, language, input);
      setOutput(result);

      historyService.addToHistory({ code, language, input, result });
      setHistory(historyService.getHistory());
    } catch (error) {
      setOutput({
        status: 'error',
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language, input, isRunning]);

  const handleHistorySelect = (item: HistoryItem) => {
    setLanguage(item.language);
    setCode(item.code);
    setInput(item.input);
    setOutput(item.result);
    setShowHistory(false);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearHistory = () => {
    historyService.clearHistory();
    setHistory([]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleCopyCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  // Handle Tab indentation
  const handleKeyDownTextarea = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode =
        code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const templates = CODE_TEMPLATES[language];

  return (
    <div className="h-full flex flex-col gap-1 p-1 bg-[#ece9d8]">
      {/* Toolbar */}
      <div className="xp-panel flex items-center gap-1 p-1 flex-wrap">
        <span className="text-xs font-bold">Lang:</span>

        <button
          className={`xp-button text-xs px-2 ${
            language === 'java' ? 'xp-button-pressed' : ''
          }`}
          onClick={() => handleLanguageChange('java')}
        >
          ☕ Java
        </button>

        <button
          className={`xp-button text-xs px-2 ${
            language === 'cpp' ? 'xp-button-pressed' : ''
          }`}
          onClick={() => handleLanguageChange('cpp')}
        >
          ⚙️ C++
        </button>

        <div className="w-px h-4 bg-gray-400 mx-1" />

        {/* Templates */}
        <div className="relative">
          <button
            className="xp-button text-xs px-2"
            onClick={() => {
              setShowTemplates(!showTemplates);
              setShowHistory(false);
            }}
          >
            📋 Templates ▼
          </button>

          {showTemplates && (
            <div className="absolute top-full left-0 mt-1 xp-panel z-50 min-w-[160px]">
              {Object.keys(templates).map((name) => (
                <button
                  key={name}
                  className="block w-full text-left px-2 py-1 text-xs hover:bg-[#316ac5] hover:text-white"
                  onClick={() => handleTemplateSelect(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="relative">
          <button
            className="xp-button text-xs px-2"
            onClick={() => {
              setShowHistory(!showHistory);
              setShowTemplates(false);
            }}
          >
            🕒 History ({history.length}) ▼
          </button>

          {showHistory && (
            <div className="absolute top-full left-0 mt-1 xp-panel z-50 min-w-[220px] max-h-[220px] overflow-auto">
              {history.length === 0 ? (
                <div className="px-2 py-1 text-xs text-gray-500">
                  No history yet
                </div>
              ) : (
                <>
                  {history.map((item) => (
                    <button
                      key={item.id}
                      className="block w-full text-left px-2 py-1 text-xs hover:bg-[#316ac5] hover:text-white border-b"
                      onClick={() => handleHistorySelect(item)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{item.language === 'java' ? '☕' : '⚙️'}</span>
                        <span
                          className={
                            item.result.status === 'success'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {item.result.status === 'success' ? '✓' : '✗'}
                        </span>
                        <span className="truncate flex-1">
                          {item.code.substring(0, 25)}...
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                  <button
                    className="block w-full text-center px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                    onClick={handleClearHistory}
                  >
                    🗑️ Clear History
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className={`xp-button text-xs px-2 ${
            showInput ? 'xp-button-pressed' : ''
          }`}
          onClick={() => setShowInput(!showInput)}
        >
          📥 Input
        </button>

        <button className="xp-button text-xs px-2" onClick={handleCopyCode}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>

        <div className="flex-1" />

        <button
          className="xp-button-primary text-xs px-4"
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
        >
          ▶️ Run (Ctrl+↵)
        </button>
      </div>

      {/* Editor + Input */}
      <div className="flex-1 flex gap-1 min-h-0">
        <div className="flex-1 flex flex-col">
          <div className="xp-panel-header text-xs px-2 py-0.5 flex justify-between">
            <span>📝 {language === 'java' ? 'Main.java' : 'main.cpp'}</span>
            <span className="text-[10px] text-gray-500">
              {code.split('\n').length} lines | {code.length} chars
            </span>
          </div>

          <textarea
            className="xp-input flex-1 font-mono text-xs resize-none xp-scroll"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDownTextarea}
            spellCheck={false}
          />
        </div>

        {showInput && (
          <div className="w-48 flex flex-col">
            <div className="xp-panel-header text-xs px-2 py-0.5">
              📥 Stdin
            </div>
            <textarea
              className="xp-input flex-1 font-mono text-xs resize-none xp-scroll"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Output */}
      <div className="h-28 flex flex-col">
        <div className="xp-panel-header text-xs px-2 py-0.5 flex justify-between">
          <span>📤 Output</span>

          {isRunning && (
            <span className="text-blue-600 animate-pulse">
              Compiling & executing...
            </span>
          )}

          {!isRunning && output && (
            <span
              className={
                output.status === 'success'
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {output.status === 'success' ? '✓ Success' : '✗ Error'} ⏱️{' '}
              {output.executionTime.toFixed(0)}ms
            </span>
          )}
        </div>

        <div className="xp-panel flex-1 p-2 font-mono text-xs xp-scroll bg-white">
          {output ? (
            output.status === 'success' ? (
              <pre>{output.output}</pre>
            ) : (
              <pre className="text-red-600">{output.error}</pre>
            )
          ) : (
            <pre className="text-gray-400">// Output will appear here</pre>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="xp-panel px-2 py-0.5 text-[10px] flex justify-between text-gray-600">
        <span>🔌 Connected to execution server</span>
        <span>💡 Ctrl+Enter = Run | Ctrl+S = Copy | Tab = Indent</span>
      </div>
    </div>
  );
}
