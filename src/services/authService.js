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

const fetchClientIp = async () => {
  try {
    const r = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
    const d = await r.json();
    return d?.ip || null;
  } catch {
    return null;
  }
};

// Login (returns full response so caller can check code e.g. EMAIL_NOT_VERIFIED)
export const login = async (credentials) => {
  const url = `${API_BASE_URL}/login`;
  const token = getAuthToken();
  const clientIp = await fetchClientIp();
  const payload = { ...credentials, ...(clientIp && { clientIp }) };
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || "Request failed");
    err.data = data;
    throw err;
  }
  return data;
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

// Resend verification OTP (email verify). Pass email string.
export const reSendVerificationOtp = async (emailOrPayload) => {
  const email = typeof emailOrPayload === "string" ? emailOrPayload : emailOrPayload?.email;
  return apiCall("/reSendOtp", "POST", { email });
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
