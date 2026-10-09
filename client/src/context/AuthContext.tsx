import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aquasense_user');
    return saved ? JSON.parse(saved) : {
      id: 'demo-admin-id',
      email: 'admin@aquasense.demo',
      name: 'Dr. Evelyn Reed (EVS Facility Lead)',
      role: 'Environmental Facility Director',
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('aquasense_token');
    if (token) {
      authService.getCurrentUser()
        .then(u => {
          setUser(u);
          localStorage.setItem('aquasense_user', JSON.stringify(u));
        })
        .catch(() => {
          // Keep existing demo user fallback
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      localStorage.setItem('aquasense_token', res.token);
      localStorage.setItem('aquasense_user', JSON.stringify(res.user));
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aquasense_token');
    localStorage.removeItem('aquasense_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
