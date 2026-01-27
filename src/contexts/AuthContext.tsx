import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: { username: string; password: string; role: 'admin' | 'user' }[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        username: foundUser.username,
        role: foundUser.role,
      });
      return true;
    }
    return false;
  };

  const register = async (
    username: string,
    password: string,
    role: 'admin' | 'user'
  ): Promise<boolean> => {
    const exists = mockUsers.find((u) => u.username === username);
    if (exists) return false;
    
    mockUsers.push({ username, password, role });
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      username,
      role,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
