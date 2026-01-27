export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  testCases: TestCase[];
  createdAt: Date;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  code: string;
  language: string;
  status:
    | "Pending"
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error";
  submittedAt: Date;
}

export interface XPWindow {
  id: string;
  title: string;
  icon: string;
  component: React.ComponentType<any>;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
