// Demo Code Execution Service
// Replace this with real API calls (e.g., Judge0, Piston) in the future

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  status: "success" | "error" | "timeout";
}

// Demo responses - replace with actual API integration
const demoResponses: Record<string, (code: string) => ExecutionResult> = {
  java: (code: string) => {
    if (code.includes("System.out.println")) {
      const match = code.match(/System\.out\.println\s*\(\s*["'](.*)["']\s*\)/);
      const output = match ? match[1] : "Hello, World!";
      return {
        output: `${output}\n\nProcess finished with exit code 0`,
        error: null,
        executionTime: Math.random() * 500 + 100,
        status: "success",
      };
    }
    if (code.includes("class") && code.includes("main")) {
      return {
        output:
          "Program executed successfully.\n\nProcess finished with exit code 0",
        error: null,
        executionTime: Math.random() * 500 + 200,
        status: "success",
      };
    }
    return {
      output: "",
      error: "Error: Main method not found in class",
      executionTime: 50,
      status: "error",
    };
  },
  cpp: (code: string) => {
    if (code.includes("cout")) {
      const match = code.match(/cout\s*<<\s*["'](.*)["']/);
      const output = match ? match[1] : "Hello, World!";
      return {
        output: `${output}\n\nProcess exited with code 0`,
        error: null,
        executionTime: Math.random() * 300 + 50,
        status: "success",
      };
    }
    if (code.includes("printf")) {
      const match = code.match(/printf\s*\(\s*["'](.*)["']/);
      const output = match ? match[1].replace("\\n", "\n") : "Hello, World!";
      return {
        output: `${output}\n\nProcess exited with code 0`,
        error: null,
        executionTime: Math.random() * 300 + 50,
        status: "success",
      };
    }
    if (code.includes("int main")) {
      return {
        output: "Program executed successfully.\n\nProcess exited with code 0",
        error: null,
        executionTime: Math.random() * 300 + 100,
        status: "success",
      };
    }
    return {
      output: "",
      error: "error: 'main' must return 'int'",
      executionTime: 30,
      status: "error",
    };
  },
};

export async function executeCode(
  code: string,
  language: "java" | "cpp"
): Promise<ExecutionResult> {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );

  const handler = demoResponses[language];
  if (!handler) {
    return {
      output: "",
      error: `Language '${language}' not supported`,
      executionTime: 0,
      status: "error",
    };
  }

  return handler(code);
}

// Configuration for future API integration
export const API_CONFIG = {
  // Judge0 API (https://judge0.com/)
  JUDGE0_URL: "https://judge0-ce.p.rapidapi.com",
  JUDGE0_API_KEY: "", // Add your API key here

  // Piston API (https://github.com/engineer-man/piston)
  PISTON_URL: "https://emkc.org/api/v2/piston",

  // Language IDs for Judge0
  LANGUAGE_IDS: {
    java: 62,
    cpp: 54,
  },
};

// Example of how to integrate with Judge0 API
export async function executeCodeWithJudge0(
  code: string,
  language: "java" | "cpp"
): Promise<ExecutionResult> {
  // Uncomment and configure when ready to use real API
  /*
  const response = await fetch(`${API_CONFIG.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': API_CONFIG.JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    body: JSON.stringify({
      source_code: code,
      language_id: API_CONFIG.LANGUAGE_IDS[language],
    }),
  });

  const result = await response.json();
  
  return {
    output: result.stdout || '',
    error: result.stderr || result.compile_output || null,
    executionTime: parseFloat(result.time) * 1000,
    status: result.status.id === 3 ? 'success' : 'error',
  };
  */

  // For now, use demo execution
  return executeCode(code, language);
}
