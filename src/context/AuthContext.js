import React, { createContext, useState, useContext, useEffect } from "react";
import { getAuthToken, setAuthToken, removeAuthToken } from "../config/api";
import { getUserById } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
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
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData = null) => {
    setAuthToken(token);
    if (userData) {
      // Check if user type is agent before setting user
      if (userData.UserType !== "agent") {
        console.warn("User is not an agent. Access denied.");
        removeAuthToken();
        return;
      }
      setUser(userData);
    }
    setIsAuthenticated(true);
    fetchUser();
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
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
