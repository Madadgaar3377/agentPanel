// API Configuration
export const API_BASE_URL = "https://api.madadgaar.com.pk/api";

// Session: store login for 15 days
const SESSION_DURATION_DAYS = 15;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token) => {
  localStorage.setItem("authToken", token);
  const loginTime = new Date();
  const expirationTime = new Date(loginTime.getTime() + SESSION_DURATION_MS);
  localStorage.setItem("agentLoginTime", loginTime.toISOString());
  localStorage.setItem("agentLoginExpiration", expirationTime.toISOString());
};

export const removeAuthToken = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("agentLoginTime");
  localStorage.removeItem("agentLoginExpiration");
  localStorage.removeItem("agentUserData");
};

export const isSessionExpired = () => {
  const exp = localStorage.getItem("agentLoginExpiration");
  if (!exp) return true;
  return new Date() > new Date(exp);
};

export const getSessionExpiration = () => localStorage.getItem("agentLoginExpiration");
export const getLoginTime = () => localStorage.getItem("agentLoginTime");
