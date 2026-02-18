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

// Get Single Assignment by ID (can be assignment _id or applicationId)
export const getAgentAssignmentById = async (assignmentId) => {
  // First try to get assignment by _id (assignment ID)
  try {
    const result = await apiCall(`/getAgentAssignment/${assignmentId}`, "GET");
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.log("Assignment by ID failed, trying by applicationId...");
  }
  
  // Fallback: if assignmentId is actually an applicationId, find assignment first
  try {
    const allAssignments = await apiCall("/getRequestsByUserId", "GET");
    if (allAssignments.success && Array.isArray(allAssignments.data)) {
      // Find assignment by applicationId
      const assignment = allAssignments.data.find(
        (a) => a.applicationId === assignmentId || a._id === assignmentId
      );
      
      if (assignment && assignment._id) {
        // Now get full details using assignment _id
        const result = await apiCall(`/getAgentAssignment/${assignment._id}`, "GET");
        if (result.success) {
          return result;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching assignment:", error);
  }
  
  throw new Error("Assignment not found");
};

// Get Agent Performance Statistics
export const getAgentPerformance = async (period = "all") => {
  const endpoint = period ? `/getAgentPerformance?period=${period}` : "/getAgentPerformance";
  return apiCall(endpoint, "GET");
};

// Update Assignment Status
export const updateAssignmentStatus = async (applicationId, status) => {
  return apiCall("/updateRequestStatus", "POST", {
    applicationId,
    status,
  });
};

// Withdrawal: create request (amount, note?, bankAccountIndex or bankAccount: { accountName, accountNumber, bankName })
export const createWithdrawalRequest = async (payload) => {
  return apiCall("/agent/withdrawal/request", "POST", payload);
};

// Withdrawal: get my requests (?status=pending|approved|rejected)
export const getMyWithdrawalRequests = async (status = "") => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiCall(`/agent/withdrawal/requests${query}`, "GET");
};
