import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'pilot' | 'crew' | 'admin';
  avatar?: string;
  certifications?: string[];
  flightHours?: number;
  bio?: string;
  phone?: string;
  username?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock user data with credentials for testing
  const mockUser: User = {
    id: '1',
    name: 'Josh Dalbey',
    email: 'jdalbey@freesun.com',
    role: 'pilot',
    avatar: 'https://assets.codepen.io/97621/img-josh-pilot.png?width=459&height=431&format=webp',
    certifications: ['Commercial Pilot', 'BFA Certified', 'Safety Officer'],
    flightHours: 1250,
    bio: 'Experienced hot air balloon pilot with over 10 years of flying in Colorado.',
    phone: '+1 (555) 123-4567',
    username: 'FlyHard',
    password: 'Password123'
  };

  // Set user as logged in on page load for testing
  // const [user, setUser] = useState<User | null>(() => {
  //   const { password: _, ...userWithoutPassword } = mockUser;
  //   return userWithoutPassword;
  // });

   const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials against mock user
    const isValidEmail = email === mockUser.email || email === mockUser.username;
    const isValidPassword = password === mockUser.password;
    
    if (isValidEmail && isValidPassword) {
      // Successful login - set user without password
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
    } else {
      // Failed login - throw error
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};