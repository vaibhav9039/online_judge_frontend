import { API_CONFIG } from "../config/environment";
import { tokenService } from "./authService";
// API Types matching backend response
export interface ApiProblem {
  id: number;
  title: string;
  description: string;
  examplesJson: string;
  constraints: string;
  tags: string[];
  timeLimitMs?: number;
  memoryLimitKb?: number;
  difficulty: "Easy" | "Medium" | "Hard";
  createdByUserId: number;
}
export interface ApiTestCase {
  id: number;
  problemId: number;
  inputData: string;
  expectedOutput: string;
}
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
export interface CreateProblemRequest {
  title: string;
  description: string;
  examplesJson: string;
  constraints: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  createdByUserId: number;
}
export interface UpdateProblemRequest {
  title?: string;
  description?: string;
  examplesJson?: string;
  constraints?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags?: string[];
  createdByUserId?: number;
}
export interface CreateTestCaseRequest {
  problemId: number;
  inputData: string;
  expectedOutput: string;
}
export interface UpdateTestCaseRequest {
  problemId: number;
  inputData: string;
  expectedOutput: string;
}
const getAuthHeaders = (): HeadersInit => {
  const token = tokenService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
// Problems API
export const problemsApi = {
  // Get paginated list of problems
  async getProblems(
    page: number = 0,
    size: number = 10,
    title?: string
  ): Promise<PaginatedResponse<ApiProblem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (title) {
      params.append("title", title);
    }
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/problems/page/list?${params}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch problems: ${response.status}`);
    }
    return response.json();
  },
  // Get single problem by ID
  async getProblem(id: number): Promise<ApiProblem> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/problems/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch problem: ${response.status}`);
    }
    return response.json();
  },
  // Create new problem (Admin only)
  async createProblem(data: CreateProblemRequest): Promise<ApiProblem> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/problems/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create problem: ${response.status}`);
    }
    return response.json();
  },
  // Update problem (Admin only)
  async updateProblem(
    id: number,
    data: UpdateProblemRequest
  ): Promise<ApiProblem> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/problems/update/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to update problem: ${response.status}`);
    }
    return response.json();
  },
  // Delete problem (Admin only)
  async deleteProblem(id: number): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/problems/delete/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete problem: ${response.status}`);
    }
  },
};
// Test Cases API
export const testCasesApi = {
  // Get test cases for a problem
  async getTestCases(problemId: number): Promise<ApiTestCase[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/testcases/problem/${problemId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch test cases: ${response.status}`);
    }
    return response.json();
  },
  // Get single test case
  async getTestCase(id: number): Promise<ApiTestCase> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/testcases/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch test case: ${response.status}`);
    }
    return response.json();
  },
  // Create test case (Admin only)
  async createTestCase(data: CreateTestCaseRequest): Promise<ApiTestCase> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/testcases/create`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to create test case: ${response.status}`);
    }
    return response.json();
  },
  // Update test case (Admin only)
  async updateTestCase(
    id: number,
    data: UpdateTestCaseRequest
  ): Promise<ApiTestCase> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/testcases/update/${id}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to update test case: ${response.status}`);
    }
    return response.json();
  },
  // Delete test case (Admin only)
  async deleteTestCase(id: number): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/testcases/delete/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete test case: ${response.status}`);
    }
  },
};
