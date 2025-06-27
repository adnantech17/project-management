"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, FC } from "react";
import { getMe } from "@/service/auth";
import { User } from "@/types/models";
import { clearAllDrafts } from "@/utils/draft";
import { logout as logoutService } from "@/service/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem("user");
      
      if (!userData) {
        setUser(null);
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      
      const response = await getMe();
      const userData = response.data;
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error during login:", error);
      localStorage.removeItem("user");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("user");
    
    try {
      await logoutService();
      clearAllDrafts();
    } catch (error) {
      console.error("Failed to clear drafts on logout:", error);
    }
    
    setUser(null);
  };

  const refetchUser = async () => {
    await login();
  };

  useEffect(() => {
    login();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext; 