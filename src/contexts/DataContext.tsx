import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Problem, Submission, TestCase } from '../types';
import { problemsApi, testCasesApi, CreateProblemRequest, UpdateProblemRequest } from '../services/problemService';
import { useToast } from '../hooks/use-toast';

interface DataContextType {
  problems: Problem[];
  submissions: Submission[];
  isLoading: boolean;
  error: string | null;
  // Problems
  fetchProblems: (page?: number, size?: number, title?: string) => Promise<void>;
  addProblem: (problem: CreateProblemRequest) => Promise<Problem | null>;
  updateProblem: (id: number, problem: UpdateProblemRequest) => Promise<Problem | null>;
  deleteProblem: (id: number) => Promise<boolean>;
  // Test Cases
  fetchTestCases: (problemId: number) => Promise<TestCase[]>;
  addTestCase: (problemId: number, inputData: string, expectedOutput: string) => Promise<TestCase | null>;
  updateTestCase: (id: number, problemId: number, inputData: string, expectedOutput: string) => Promise<TestCase | null>;
  deleteTestCase: (id: number) => Promise<boolean>;
  // Submissions (local for now)
  submitSolution: (problemId: number, code: string, language: string) => void;
  // Pagination info
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const { toast } = useToast();

  const fetchProblems = useCallback(async (page: number = 0, size: number = 10, title?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await problemsApi.getProblems(page, size, title);
      setProblems(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch problems';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addProblem = async (problemData: CreateProblemRequest): Promise<Problem | null> => {
    setIsLoading(true);
    try {
      const newProblem = await problemsApi.createProblem(problemData);
      setProblems((prev) => [...prev, newProblem]);
      toast({ title: 'Success', description: 'Problem created successfully' });
      return newProblem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create problem';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProblem = async (id: number, updates: UpdateProblemRequest): Promise<Problem | null> => {
    setIsLoading(true);
    try {
      const updatedProblem = await problemsApi.updateProblem(id, updates);
      setProblems((prev) => prev.map((p) => (p.id === id ? updatedProblem : p)));
      toast({ title: 'Success', description: 'Problem updated successfully' });
      return updatedProblem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update problem';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProblem = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      await problemsApi.deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Success', description: 'Problem deleted successfully' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete problem';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestCases = async (problemId: number): Promise<TestCase[]> => {
    try {
      return await testCasesApi.getTestCases(problemId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch test cases';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return [];
    }
  };

  const addTestCase = async (problemId: number, inputData: string, expectedOutput: string): Promise<TestCase | null> => {
    try {
      const newTestCase = await testCasesApi.createTestCase({ problemId, inputData, expectedOutput });
      toast({ title: 'Success', description: 'Test case created successfully' });
      return newTestCase;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create test case';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    }
  };

  const updateTestCase = async (id: number, problemId: number, inputData: string, expectedOutput: string): Promise<TestCase | null> => {
    try {
      const updatedTestCase = await testCasesApi.updateTestCase(id, { problemId, inputData, expectedOutput });
      toast({ title: 'Success', description: 'Test case updated successfully' });
      return updatedTestCase;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update test case';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    }
  };

  const deleteTestCase = async (id: number): Promise<boolean> => {
    try {
      await testCasesApi.deleteTestCase(id);
      toast({ title: 'Success', description: 'Test case deleted successfully' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete test case';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return false;
    }
  };

  const submitSolution = (problemId: number, code: string, language: string) => {
    // Placeholder for local submissions
    const problem = problems.find((p) => p.id === problemId);
    if (!problem) return;
    // const newSubmission: Submission = {
    //   id: Date.now(),
    //   problemId,
    //   code,
    //   language,
    //   status: 'Pending',
    //   submittedAt: new Date(),
    // };
    // setSubmissions((prev) => [...prev, newSubmission]);
  };

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return (
    <DataContext.Provider
      value={{
        problems,
        submissions,
        isLoading,
        error,
        fetchProblems,
        addProblem,
        updateProblem,
        deleteProblem,
        fetchTestCases,
        addTestCase,
        updateTestCase,
        deleteTestCase,
        submitSolution,
        pagination,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
