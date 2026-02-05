import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { getAuthToken, setAuthToken, removeAuthToken } from "../config/api";
import { getUserById } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserById();
      if (response.success) {
        const userData = response.user || response.data;
        
        // Check if user type is agent
        if (userData?.UserType !== "agent") {
          console.warn("User is not an agent. Access denied.");
          logout();
          return;
        }
        
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // If fetch fails, user might not be authenticated
        logout();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = (token, userData = null) => {
    setAuthToken(token);
    if (userData) {
      // Check if user type is agent before setting user
      if (userData.UserType !== "agent") {
        console.warn("User is not an agent. Access denied.");
        removeAuthToken();
        setLoading(false);
        return;
      }
      // Set user immediately without fetching again
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      // Optionally fetch fresh user data in background (non-blocking, doesn't affect loading state)
      setTimeout(() => {
        fetchUser().catch(err => console.error("Background user fetch failed:", err));
      }, 100);
    } else {
      // No userData provided, fetch it
      setIsAuthenticated(true);
      fetchUser();
    }
  };


  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
