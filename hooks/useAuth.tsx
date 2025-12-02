import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await api.getToken();
      if (token) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      await api.removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const deviceName = `TradeMate Mobile - ${new Date().toISOString()}`;
    const response = await apiService.login(email, password, deviceName);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

