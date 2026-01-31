import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { SubmitWindow } from './SubmitWindow';
import { useWindows } from '../../contexts/WindowContext';
import { Problem, TestCase, ProblemExample } from '../../types';

export function ProblemsWindow() {
  const { problems, isLoading, fetchTestCases } = useData();
  const { openWindow } = useWindows();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedProblem) {
      fetchTestCases(selectedProblem.id).then(setTestCases);
    } else {
      setTestCases([]);
    }
  }, [selectedProblem, fetchTestCases]);
  const handleSubmit = (problemId: number, problemTitle: string) => {
    openWindow({
      id: `submit-${problemId}`,
      title: `Submit - ${problemTitle}`,
      icon: '📤',
      component: () => <SubmitWindow problemId={problemId} />,
      position: { x: 200, y: 100 },
      size: { width: 700, height: 500 },
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return '';
    }
  };
  const parseExamples = (examplesJson: string): ProblemExample[] => {
    try {
      return JSON.parse(examplesJson);
    } catch {
      return [];
    }
  };
  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="mb-2">
        <input
          type="text"
          className="xp-input w-full text-xs"
          placeholder="🔍 Search problems..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 flex gap-2 min-h-0">
        {/* Problems List */}
        <div className="w-1/2 flex flex-col">
          <div className="xp-panel-inset flex-1 overflow-auto xp-scroll">
            {isLoading ? (
              <div className="text-xs text-center p-4 text-muted-foreground">
                Loading problems...
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="text-xs text-center p-4 text-muted-foreground">
                No problems found.
              </div>
            ) : (
              <table className="xp-table w-full">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Title</th>
                    <th style={{ width: '70px' }}>Difficulty</th>
                    <th style={{ width: '80px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem, index) => (
                    <tr
                      key={problem.id}
                      className={selectedProblem?.id === problem.id ? 'selected' : ''}
                      onClick={() => setSelectedProblem(problem)}
                    >
                      <td>{index + 1}</td>
                      <td className="truncate max-w-[150px]">{problem.title}</td>
                      <td className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </td>
                      <td>
                        <button
                          className="xp-button text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubmit(problem.id, problem.title);
                          }}
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Problem Details */}
        <div className="w-1/2 flex flex-col">
          {selectedProblem ? (
            <div className="xp-panel-inset flex-1 overflow-auto xp-scroll p-2">
              <div className="mb-2">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  {selectedProblem.title}
                  <span className={`text-xs ${getDifficultyColor(selectedProblem.difficulty)}`}>
                    ({selectedProblem.difficulty})
                  </span>
                </h3>
                {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedProblem.tags.map((tag, i) => (
                      <span key={i} className="bg-secondary px-1 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <div className="text-xs font-bold mb-1">Description:</div>
                <div className="text-xs bg-secondary/30 p-2 rounded">
                  {selectedProblem.description}
                </div>
              </div>
              {/* Examples */}
              {selectedProblem.examplesJson && (
                <div className="mb-2">
                  <div className="text-xs font-bold mb-1">Examples:</div>
                  {parseExamples(selectedProblem.examplesJson).map((example, i) => (
                    <div key={i} className="bg-secondary/30 p-2 rounded mb-1 text-xs">
                      <div><strong>Input:</strong> <code>{JSON.stringify(example.input)}</code></div>
                      <div><strong>Output:</strong> <code>{JSON.stringify(example.output)}</code></div>
                    </div>
                  ))}
                </div>
              )}
              {/* Constraints */}
              {selectedProblem.constraints && (
                <div className="mb-2">
                  <div className="text-xs font-bold mb-1">Constraints:</div>
                  <pre className="text-xs bg-secondary/30 p-2 rounded whitespace-pre-wrap">
                    {selectedProblem.constraints}
                  </pre>
                </div>
              )}
              {/* Test Cases Count */}
              <div className="text-xs text-muted-foreground mt-2">
                📝 {testCases.length} test case(s) available
              </div>
              <button
                className="xp-button-primary mt-2 w-full"
                onClick={() => handleSubmit(selectedProblem.id, selectedProblem.title)}
              >
                Submit Solution
              </button>
            </div>
          ) : (
            <div className="xp-panel-inset flex-1 flex items-center justify-center text-muted-foreground text-xs">
              Select a problem to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
