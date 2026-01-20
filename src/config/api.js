// API Configuration
export const API_BASE_URL = "https://api.madadgaar.com.pk/api";

// Helper function to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Helper function to remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
};
