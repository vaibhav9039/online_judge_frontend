import { API_CONFIG, TOKEN_KEYS } from '../config/environment';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Token management
export const tokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  // Decode JWT to extract user info
  decodeToken: (token: string): { sub: string; roles: string[]; exp: number } | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    const decoded = tokenService.decodeToken(token);
    if (!decoded) return true;
    // Check if token expires in less than 60 seconds
    return decoded.exp * 1000 < Date.now() + 60000;
  },
};

// API calls
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || errorData.error || `Request failed with status ${response.status}`,
      status: response.status,
    } as ApiError;
  }
  return response.json();
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthTokens> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthTokens>(response);
  },

  register: async (data: RegisterRequest): Promise<{ username: string; password: string }> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ username: string; password: string }>(response);
  },

  logout: async (): Promise<{ message: string }> => {
    const accessToken = tokenService.getAccessToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });
    return handleResponse<{ message: string }>(response);
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const accessToken = tokenService.getAccessToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ accessToken: string }>(response);
  },
};
