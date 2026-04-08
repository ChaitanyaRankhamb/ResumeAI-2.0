"use client";

import { getMe, logoutApi } from "@/components/api/authApi";
import { fetchapi } from "@/lib/refresh-user";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  isLogged: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user
  const fetchUser = async () => {
    try {
      const response = await fetchapi("http://localhost:5000/auth/me", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        setIsLogged(true);
      } else {
        setUser(null);
        setIsLogged(false);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setIsLogged(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Run once on app load
  useEffect(() => {
    fetchUser();
  }, []);

  // Login (after OAuth redirect)
  const login = async () => {
    await fetchUser();
  };

  // Logout
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setIsLogged(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLogged, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
