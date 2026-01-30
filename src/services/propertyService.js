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

// Create Property
export const createProperty = async (propertyData) => {
  return apiCall("/createProperty", "POST", { data: propertyData });
};

// Get All Properties (with filters)
export const getAllProperties = async (filters = {}) => {
  const { page = 1, limit = 20, type, city, search } = filters;
  
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (city) params.append("city", city);
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/getAllProperties?${queryString}` : `/getAllProperties`;
  
  return apiCall(endpoint, "GET");
};

// Get Properties by User ID (agent's own properties)
export const getPropertiesByUserId = async (filters = {}) => {
  return apiCall("/getPropertiesByUserId", "GET");
};

// Get Property by ID
export const getPropertyById = async (id) => {
  return apiCall(`/getProperty/${id}`, "GET");
};

// Update Property
export const updateProperty = async (propertyData) => {
  return apiCall("/updateProperty", "PUT", { data: propertyData });
};

// Delete Property
export const deleteProperty = async (propertyId) => {
  return apiCall(`/deleteProperty/${propertyId}`, "DELETE");
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
