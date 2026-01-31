import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { TestCase, ProblemExample } from '../../types';

interface SubmitWindowProps {
  problemId: number;
}

export function SubmitWindow({ problemId }: SubmitWindowProps) {
  const { problems, submitSolution, fetchTestCases } = useData();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [submitted, setSubmitted] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  const problem = problems.find((p) => p.id === problemId);
  useEffect(() => {
    if (problemId) {
      fetchTestCases(problemId).then(setTestCases);
    }
  }, [problemId, fetchTestCases]);
  const handleSubmit = () => {
    if (!code.trim()) return;
    submitSolution(problemId, code, language);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };
const parseExamples = (examplesJson: string): ProblemExample[] => {
    try {
      return JSON.parse(examplesJson);
    } catch {
      return [];
    }
  };
  const examples = problem?.examplesJson ? parseExamples(problem.examplesJson) : [];

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="xp-panel p-2">
        <div className="font-bold">{problem?.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">{problem?.description}</div>
        {examples.length > 0 && (
          <div className="mt-1 text-xs">
            <strong>Example:</strong> Input: <code>{JSON.stringify(examples[0].input)}</code> → Output: <code>{JSON.stringify(examples[0].output)}</code>
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-xs">Language:</label>
        <select
          className="xp-input text-xs"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>JavaScript</option>
          <option>Python</option>
          <option>C++</option>
          <option>Java</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <label className="text-xs mb-1">Your Solution:</label>
        <textarea
          className="xp-input flex-1 font-mono text-xs resize-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Write your code here..."
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs">
          📝 {testCases.length} test case(s)
        </div>
        <button
          className="xp-button-primary px-6"
          onClick={handleSubmit}
          disabled={!code.trim()}
        >
          {submitted ? '✓ Submitted!' : 'Submit Solution'}
        </button>
      </div>
    </div>
  );
}
