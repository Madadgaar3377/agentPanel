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

// Create Installment Plan
export const createInstallmentPlan = async (planData) => {
  return apiCall("/createInstallmentPlan", "POST", planData);
};

// Get All Installments (with filters)
export const getAllInstallments = async (filters = {}) => {
  const { page = 1, limit = 20, status, city, category, search } = filters;
  
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (city) params.append("city", city);
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/getAllInstallments?${queryString}` : `/getAllInstallments`;
  
  return apiCall(endpoint, "GET");
};

// Get Installment by ID
export const getInstallmentById = async (id) => {
  return apiCall(`/getInstallment/${id}`, "GET");
};

// Update Installment Plan
export const updateInstallmentPlan = async (id, updateData) => {
  return apiCall(`/updateInstallment/${id}`, "PUT", updateData);
};

// Delete Installment Plan
export const deleteInstallmentPlan = async (id, permanent = false) => {
  const endpoint = permanent 
    ? `/deleteInstallment/${id}?permanent=true`
    : `/deleteInstallment/${id}`;
  return apiCall(endpoint, "DELETE");
};

// Get User's Installments
export const getUserInstallments = async (userId, filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", page);
  params.append("limit", limit);
  
  const queryString = params.toString();
  const endpoint = queryString 
    ? `/getUserInstallments/${userId}?${queryString}`
    : `/getUserInstallments/${userId}`;
  
  return apiCall(endpoint, "GET");
};

// Upload Image
export const uploadImage = async (file) => {
  const url = `${API_BASE_URL}/upload-image`;
  const token = getAuthToken();
  
  const formData = new FormData();
  formData.append("image", file);
  
  const options = {
    method: "POST",
    headers: {},
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  options.body = formData;

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    
    return data.url || data.imageUrl || data.data?.url;
  } catch (error) {
    throw error;
  }
};
