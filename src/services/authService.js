import { API_BASE_URL, getAuthToken } from "../config/api";

// Helper function for API calls
const apiCall = async (endpoint, method = "GET", body = null, requiresAuth = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Signup
export const signup = async (userData) => {
  return apiCall("/signup", "POST", userData);
};

// Verify Account
export const verifyAccount = async (otpData) => {
  return apiCall("/verifyAccount", "POST", otpData);
};

// Login
export const login = async (credentials) => {
  return apiCall("/login", "POST", credentials);
};

// Forget Password
export const forgetPassword = async (email) => {
  return apiCall("/forgetPassword", "POST", { email });
};

// New Password
export const newPassword = async (passwordData) => {
  return apiCall("/newPassword", "POST", passwordData);
};

// Resend OTP for Password
export const reSendOtpForPassword = async (email) => {
  return apiCall("/reSendOtpForPassword", "POST", { email });
};

// Get User By ID (requires auth)
export const getUserById = async () => {
  return apiCall("/getUserById", "GET", null, true);
};

// Update User (requires auth)
export const updateUser = async (userId, updates) => {
  return apiCall("/updateUser", "PUT", { userId, updates }, true);
};

// Update Password (requires auth)
export const updatePassword = async (passwordData) => {
  return apiCall("/updatePassword", "PUT", passwordData, true);
};
