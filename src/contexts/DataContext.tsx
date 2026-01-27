import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Problem, Submission, TestCase } from '../types';

interface DataContextType {
  problems: Problem[];
  submissions: Submission[];
  addProblem: (problem: Omit<Problem, 'id' | 'createdAt'>) => void;
  updateProblem: (id: string, problem: Partial<Problem>) => void;
  deleteProblem: (id: string) => void;
  addTestCase: (problemId: string, testCase: Omit<TestCase, 'id'>) => void;
  deleteTestCase: (problemId: string, testCaseId: string) => void;
  submitSolution: (problemId: string, code: string, language: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial mock data
const initialProblems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    testCases: [
      { id: '1', input: '[2,7,11,15], target=9', expectedOutput: '[0,1]' },
      { id: '2', input: '[3,2,4], target=6', expectedOutput: '[1,2]' },
    ],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    difficulty: 'Easy',
    testCases: [
      { id: '1', input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
    ],
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    title: 'Binary Tree Maximum Path Sum',
    description: 'Given a non-empty binary tree, find the maximum path sum.',
    difficulty: 'Hard',
    testCases: [
      { id: '1', input: '[1,2,3]', expectedOutput: '6' },
    ],
    createdAt: new Date('2024-01-17'),
  },
];

const initialSubmissions: Submission[] = [
  {
    id: '1',
    problemId: '1',
    problemTitle: 'Two Sum',
    code: 'function twoSum(nums, target) { ... }',
    language: 'JavaScript',
    status: 'Accepted',
    submittedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    problemId: '2',
    problemTitle: 'Reverse String',
    code: 'function reverseString(s) { ... }',
    language: 'JavaScript',
    status: 'Wrong Answer',
    submittedAt: new Date('2024-01-21'),
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>(initialProblems);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

  const addProblem = (problem: Omit<Problem, 'id' | 'createdAt'>) => {
    const newProblem: Problem = {
      ...problem,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setProblems((prev) => [...prev, newProblem]);
  };

  const updateProblem = (id: string, updates: Partial<Problem>) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProblem = (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const addTestCase = (problemId: string, testCase: Omit<TestCase, 'id'>) => {
    const newTestCase: TestCase = {
      ...testCase,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId
          ? { ...p, testCases: [...p.testCases, newTestCase] }
          : p
      )
    );
  };

  const deleteTestCase = (problemId: string, testCaseId: string) => {
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId
          ? { ...p, testCases: p.testCases.filter((tc) => tc.id !== testCaseId) }
          : p
      )
    );
  };

  const submitSolution = (problemId: string, code: string, language: string) => {
    const problem = problems.find((p) => p.id === problemId);
    if (!problem) return;

    const statuses: Submission['status'][] = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      problemId,
      problemTitle: problem.title,
      code,
      language,
      status: randomStatus,
      submittedAt: new Date(),
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  return (
    <DataContext.Provider
      value={{
        problems,
        submissions,
        addProblem,
        updateProblem,
        deleteProblem,
        addTestCase,
        deleteTestCase,
        submitSolution,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
