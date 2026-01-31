export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

export interface Problem {
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

export interface TestCase {
  id: number;
  problemId: number;
  inputData: string;
  expectedOutput: string;
}

export interface Submission {
  id: number;
  problemId: number;
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

export interface ProblemExample {
  input: Record<string, any>;
  output: any;
}