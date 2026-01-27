import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { SubmitWindow } from './SubmitWindow';
import { useWindows } from '../../contexts/WindowContext';

export function ProblemsWindow() {
  const { problems } = useData();
  const { openWindow } = useWindows();
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const handleSubmit = (problemId: string, problemTitle: string) => {
    openWindow({
      id: `submit-${problemId}`,
      title: `Submit - ${problemTitle}`,
      icon: '📤',
      component: () => <SubmitWindow problemId={problemId} />,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 450 },
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

  return (
    <div className="h-full flex flex-col">
      <div className="xp-panel-inset flex-1 overflow-auto xp-scroll">
        <table className="xp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Title</th>
              <th style={{ width: '80px' }}>Difficulty</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem, index) => (
              <tr
                key={problem.id}
                className={selectedProblem === problem.id ? 'selected' : ''}
                onClick={() => setSelectedProblem(problem.id)}
              >
                <td>{index + 1}</td>
                <td>{problem.title}</td>
                <td className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </td>
                <td>
                  <button
                    className="xp-button text-xs"
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
      </div>

      {selectedProblem && (
        <div className="mt-2 xp-panel p-2">
          <div className="font-bold mb-1">Description:</div>
          <div className="text-xs">
            {problems.find((p) => p.id === selectedProblem)?.description}
          </div>
        </div>
      )}
    </div>
  );
}
