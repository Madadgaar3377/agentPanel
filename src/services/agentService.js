import { API_BASE_URL, getAuthToken } from "../config/api";

// Helper function for API calls
const apiCall = async (endpoint, method = "GET", body = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
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

// Get Agent Dashboard
export const getAgentDashboard = async () => {
  return apiCall("/agentDashboard", "GET");
};

// Get Agent Assignments with filters
export const getAgentAssignments = async (filters = {}) => {
  const { status, category, city, type, page = 1, limit = 20 } = filters;
  
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (category) params.append("category", category);
  if (city) params.append("city", city);
  if (type) params.append("type", type);
  params.append("page", page);
  params.append("limit", limit);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/getAgentAssignments?${queryString}` : `/getAgentAssignments`;
  
  return apiCall(endpoint, "GET");
};

// Get Single Assignment by ID
export const getAgentAssignmentById = async (assignmentId) => {
  return apiCall(`/getAgentAssignment/${assignmentId}`, "GET");
};

// Get Agent Performance Statistics
export const getAgentPerformance = async (period = "all") => {
  const endpoint = period ? `/getAgentPerformance?period=${period}` : "/getAgentPerformance";
  return apiCall(endpoint, "GET");
};
