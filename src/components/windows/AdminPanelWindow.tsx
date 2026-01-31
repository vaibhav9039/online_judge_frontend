import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Problem, TestCase } from '../../types';

export function AdminPanelWindow() {
  const { 
    problems, 
    isLoading, 
    addProblem, 
    deleteProblem, 
    fetchTestCases,
    addTestCase, 
    deleteTestCase 
  } = useData();
  const [activeTab, setActiveTab] = useState<'problems' | 'add'>('problems');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadingTestCases, setLoadingTestCases] = useState(false);
  
  // New problem form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newExamples, setNewExamples] = useState('[]');
  const [newConstraints, setNewConstraints] = useState('');
  const [newTags, setNewTags] = useState('');
  
  // New test case form
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');

  useEffect(() => {
    if (selectedProblem) {
      setLoadingTestCases(true);
      fetchTestCases(selectedProblem.id).then((cases) => {
        setTestCases(cases);
        setLoadingTestCases(false);
      });
    } else {
      setTestCases([]);
    }
  }, [selectedProblem, fetchTestCases]);

  const handleAddProblem = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;    
    const result = await addProblem({
      title: newTitle,
      description: newDescription,
      difficulty: newDifficulty,
      examplesJson: newExamples,
      constraints: newConstraints,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      createdByUserId: 1, // TODO: Get from auth context
    });    
    if (result) {
      setNewTitle('');
      setNewDescription('');
      setNewDifficulty('Easy');
      setNewExamples('[]');
      setNewConstraints('');
      setNewTags('');
      setActiveTab('problems');
    }
  };

  const handleAddTestCase = async () => {
    if (!selectedProblem || !newInput.trim() || !newOutput.trim()) return;
    const result = await addTestCase(selectedProblem.id, newInput, newOutput);
    
    if (result) {
      setTestCases(prev => [...prev, result]);
      setNewInput('');
      setNewOutput('');
    }
  };
  const handleDeleteTestCase = async (testCaseId: number) => {
    const success = await deleteTestCase(testCaseId);
    if (success) {
      setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
    }
  };
  const handleDeleteProblem = async (problemId: number) => {
    const success = await deleteProblem(problemId);
    if (success && selectedProblem?.id === problemId) {
      setSelectedProblem(null);
    }
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
              <div className="text-xs font-bold mb-1">
                Problems: {isLoading && '(Loading...)'}
              </div>
              <div className="xp-panel-inset flex-1 overflow-auto xp-scroll">
                {problems.length === 0 && !isLoading && (
                  <div className="text-xs text-muted-foreground p-2">
                    No problems found. Add one!
                  </div>
                )}
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`p-1 cursor-pointer flex justify-between items-center ${
                      selectedProblem?.id === problem.id ? 'bg-primary text-white' : 'hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <span className="text-xs truncate flex-1">
                      {problem.title}
                      <span className={`ml-2 ${
                        problem.difficulty === 'Easy' ? 'text-green-600' :
                        problem.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ({problem.difficulty})
                      </span>
                    </span>
                    <button
                      className="xp-button text-xs px-1 ml-1"
                      onClick={(e) => {
                        handleDeleteProblem(problem.id);
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
                    {loadingTestCases ? (
                      <div className="text-xs text-muted-foreground p-2">
                        Loading test cases...
                      </div>
                    ) : testCases.length === 0 ? (
                      <div className="text-xs text-muted-foreground p-2">
                        No test cases yet.
                      </div>
                    ) : (
                      testCases.map((tc, index) => (
                        <div key={tc.id} className="border-b border-border p-1 flex justify-between">
                          <div className="text-xs flex-1 overflow-hidden">
                            <div><strong>#{index + 1} Input:</strong></div>
                            <pre className="whitespace-pre-wrap break-all bg-secondary/30 p-1 rounded text-xs mb-1">
                              {tc.inputData}
                            </pre>
                            <div><strong>Expected:</strong></div>
                            <pre className="whitespace-pre-wrap break-all bg-secondary/30 p-1 rounded text-xs">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                          <button
                            className="xp-button text-xs px-1 ml-1 h-fit"
                            onClick={() => handleDeleteTestCase(tc.id)}
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
                    <div className="mb-1">
                      <label className="text-xs block mb-1">Input Data (JSON):</label>
                      <textarea
                        className="xp-input w-full text-xs h-12 resize-none font-mono"
                        placeholder='{"nums":[2,7,11,15],"target":9}'
                        value={newInput}
                        onChange={(e) => setNewInput(e.target.value)}
                      />
                      </div>
                    <div className="mb-1">
                      <label className="text-xs block mb-1">Expected Output:</label>
                      <input
                        type="text"
                        className="xp-input w-full text-xs font-mono"
                        placeholder="[0,1]"
                        value={newOutput}
                        onChange={(e) => setNewOutput(e.target.value)}
                      />
                    </div>
                    <button 
                      className="xp-button text-xs" 
                      onClick={handleAddTestCase}
                      disabled={!newInput.trim() || !newOutput.trim()}
                    >
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
          <div className="max-w-lg">
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
                className="xp-input w-full h-20 resize-none"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Problem description..."
              />
            </div>
            <div className="mb-2">
              <label className="text-xs block mb-1">Examples JSON:</label>
              <textarea
                className="xp-input w-full h-16 resize-none font-mono text-xs"
                value={newExamples}
                onChange={(e) => setNewExamples(e.target.value)}
                placeholder='[{"input": {"nums": [2,7], "target": 9}, "output": [0,1]}]'
              />
            </div>
            <div className="mb-2">
              <label className="text-xs block mb-1">Constraints:</label>
              <textarea
                className="xp-input w-full h-12 resize-none text-xs"
                value={newConstraints}
                onChange={(e) => setNewConstraints(e.target.value)}
                placeholder="1 <= nums.length <= 10^4"
              />
            </div>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-xs block mb-1">Difficulty:</label>
                <select
                  className="xp-input w-full"
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs block mb-1">Tags (comma-separated):</label>
                <input
                  type="text"
                  className="xp-input w-full"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="array, hashmap"
                />
              </div>
            </div>
            <button 
              className="xp-button-primary px-4" 
              onClick={handleAddProblem}
              disabled={isLoading || !newTitle.trim() || !newDescription.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Problem'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
