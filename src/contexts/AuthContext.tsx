import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { authApi, tokenService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract user from JWT token
  const getUserFromToken = useCallback((accessToken: string): User | null => {
    const decoded = tokenService.decodeToken(accessToken);
    if (!decoded) return null;

    // Determine role from JWT roles array
    const roles = decoded.roles || [];
    const role: 'admin' | 'user' = roles.includes('ADMIN') ? 'admin' : 'user';

    return {
      id: decoded.sub,
      username: decoded.sub,
      role,
    };
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = tokenService.getRefreshToken();
    if (!storedRefreshToken) return false;

    try {
      const response = await authApi.refresh(storedRefreshToken);
      tokenService.setTokens({ accessToken: response.accessToken });
      
      const newUser = getUserFromToken(response.accessToken);
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      tokenService.clearTokens();
      setUser(null);
      return false;
    }
  }, [getUserFromToken]);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenService.getAccessToken();
      
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (tokenService.isTokenExpired(accessToken)) {
        // Try to refresh
        const refreshed = await refreshToken();
        if (!refreshed) {
          tokenService.clearTokens();
        }
      } else {
        // Token is valid, extract user
        const extractedUser = getUserFromToken(accessToken);
        if (extractedUser) {
          setUser(extractedUser);
        } else {
          tokenService.clearTokens();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [getUserFromToken, refreshToken]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    const checkAndRefresh = async () => {
      const accessToken = tokenService.getAccessToken();
      if (accessToken && tokenService.isTokenExpired(accessToken)) {
        await refreshToken();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkAndRefresh, 30000);
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ username, password });
      tokenService.setTokens(response);
      
      const extractedUser = getUserFromToken(response.accessToken);
      if (extractedUser) {
        setUser(extractedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      await authApi.register({ username, password });
      // After successful registration, automatically log in
      return await login(username, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with local logout even if API fails
    } finally {
      tokenService.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
