import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Problem } from '../../types';

export function AdminPanelWindow() {
  const { problems, addProblem, deleteProblem, addTestCase, deleteTestCase } = useData();
  const [activeTab, setActiveTab] = useState<'problems' | 'add'>('problems');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  
  // New problem form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  
  // New test case form
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');

  const handleAddProblem = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    addProblem({
      title: newTitle,
      description: newDescription,
      difficulty: newDifficulty,
      testCases: [],
    });
    setNewTitle('');
    setNewDescription('');
    setNewDifficulty('Easy');
    setActiveTab('problems');
  };

  const handleAddTestCase = () => {
    if (!selectedProblem || !newInput.trim() || !newOutput.trim()) return;
    addTestCase(selectedProblem.id, {
      input: newInput,
      expectedOutput: newOutput,
    });
    setNewInput('');
    setNewOutput('');
    // Refresh selected problem
    const updated = problems.find(p => p.id === selectedProblem.id);
    if (updated) setSelectedProblem(updated);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex mb-2">
        <button
          className={`xp-tab ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          📋 Manage Problems
        </button>
        <button
          className={`xp-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add New
        </button>
      </div>

      <div className="flex-1 xp-panel-inset p-2 overflow-auto xp-scroll">
        {activeTab === 'problems' && (
          <div className="flex gap-2 h-full">
            {/* Problems List */}
            <div className="w-1/2 flex flex-col">
              <div className="text-xs font-bold mb-1">Problems:</div>
              <div className="xp-panel-inset flex-1 overflow-auto xp-scroll">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`p-1 cursor-pointer flex justify-between items-center ${
                      selectedProblem?.id === problem.id ? 'bg-primary text-white' : 'hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <span className="text-xs truncate">{problem.title}</span>
                    <button
                      className="xp-button text-xs px-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProblem(problem.id);
                        if (selectedProblem?.id === problem.id) {
                          setSelectedProblem(null);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Cases */}
            <div className="w-1/2 flex flex-col">
              <div className="text-xs font-bold mb-1">
                Test Cases: {selectedProblem?.title || '(Select a problem)'}
              </div>
              {selectedProblem ? (
                <>
                  <div className="xp-panel-inset flex-1 overflow-auto xp-scroll mb-2">
                    {selectedProblem.testCases.length === 0 ? (
                      <div className="text-xs text-muted-foreground p-2">
                        No test cases yet.
                      </div>
                    ) : (
                      selectedProblem.testCases.map((tc, index) => (
                        <div key={tc.id} className="border-b border-border p-1 flex justify-between">
                          <div className="text-xs">
                            <div><strong>Input:</strong> {tc.input}</div>
                            <div><strong>Output:</strong> {tc.expectedOutput}</div>
                          </div>
                          <button
                            className="xp-button text-xs px-1"
                            onClick={() => deleteTestCase(selectedProblem.id, tc.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add Test Case Form */}
                  <div className="xp-panel p-2">
                    <div className="text-xs font-bold mb-1">Add Test Case:</div>
                    <div className="flex gap-1 mb-1">
                      <input
                        type="text"
                        className="xp-input flex-1 text-xs"
                        placeholder="Input"
                        value={newInput}
                        onChange={(e) => setNewInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="xp-input flex-1 text-xs"
                        placeholder="Expected Output"
                        value={newOutput}
                        onChange={(e) => setNewOutput(e.target.value)}
                      />
                    </div>
                    <button className="xp-button text-xs" onClick={handleAddTestCase}>
                      Add Test Case
                    </button>
                  </div>
                </>
              ) : (
                <div className="xp-panel-inset flex-1 flex items-center justify-center text-muted-foreground text-xs">
                  Select a problem to manage test cases
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-md">
            <div className="mb-2">
              <label className="text-xs block mb-1">Title:</label>
              <input
                type="text"
                className="xp-input w-full"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Problem title"
              />
            </div>
            <div className="mb-2">
              <label className="text-xs block mb-1">Description:</label>
              <textarea
                className="xp-input w-full h-24 resize-none"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Problem description..."
              />
            </div>
            <div className="mb-3">
              <label className="text-xs block mb-1">Difficulty:</label>
              <select
                className="xp-input"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <button className="xp-button-primary px-4" onClick={handleAddProblem}>
              Create Problem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
