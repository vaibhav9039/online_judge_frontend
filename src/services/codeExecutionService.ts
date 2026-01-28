
import { API_CONFIG } from '../config/environment';
import { tokenService } from '../services/authService';
export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  status: "success" | "error" | "timeout";
}
export interface CodeRunRequest {
  language: 'JAVA' | 'CPP';
  code: string;
  input: string;
}

export async function executeCode(
  code: string,
  language: 'java' | 'cpp',
  input: string = ''
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const accessToken = tokenService.getAccessToken();
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/guest/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({
        language: language.toUpperCase(),
        code,
        input,
      }),
    });
    const executionTime = Date.now() - startTime;
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        output: '',
        error: errorData.message || errorData.error || `Execution failed with status ${response.status}`,
        executionTime,
        status: 'error',
      };
    }
    const result = await response.json();
    const output = result.output || result.stdout || '';
    const error = result.error || result.stderr || null;
    
    return {
      output: output || (error ? '' : 'Program executed successfully with no output.'),
      error,
      executionTime: result.executionTime || executionTime,
      status: error ? 'error' : 'success',
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Network error - could not connect to server',
      executionTime,
      status: 'error',
    };
  }
}

export const CODE_TEMPLATES = {
  java: {
    'Hello World': `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    'Read Input': `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}`,
    'Sum Two Numbers': `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println("Sum: " + (a + b));
        scanner.close();
    }
}`,
    'Fibonacci': `public class Main {
    public static void main(String[] args) {
        int n = 10;
        int a = 0, b = 1;
        System.out.print("Fibonacci: ");
        for (int i = 0; i < n; i++) {
            System.out.print(a + " ");
            int temp = a + b;
            a = b;
            b = temp;
        }
    }
}`,
    'Array Operations': `import java.util.Arrays;
public class Main {
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Original: " + Arrays.toString(arr));
        Arrays.sort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
  },
  cpp: {
    'Hello World': `#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    'Read Input': `#include <iostream>
#include <string>
using namespace std;
int main() {
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;
    return 0;
}`,
    'Sum Two Numbers': `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum: " << (a + b) << endl;
    return 0;
}`,
    'Fibonacci': `#include <iostream>
using namespace std;
int main() {
    int n = 10, a = 0, b = 1;
    cout << "Fibonacci: ";
    for (int i = 0; i < n; i++) {
        cout << a << " ";
        int temp = a + b;
        a = b;
        b = temp;
    }
    return 0;
}`,
    'Vector Operations': `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    cout << "Original: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    
    sort(arr.begin(), arr.end());
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}`,
  },
};

export interface HistoryItem {
  id: string;
  code: string;
  language: 'java' | 'cpp';
  input: string;
  result: ExecutionResult;
  timestamp: Date;
}
const HISTORY_KEY = 'code_runner_history';
const MAX_HISTORY = 10;
export const historyService = {
  getHistory: (): HistoryItem[] => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) return [];
      return JSON.parse(stored).map((item: HistoryItem) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch {
      return [];
    }
  },
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>): void => {
    const history = historyService.getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const updated = [newItem, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  },
  clearHistory: (): void => {
    localStorage.removeItem(HISTORY_KEY);
  },
};