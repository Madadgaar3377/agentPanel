import { API_BASE_URL } from "../config/api";

const API_BASE = API_BASE_URL;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getAgentToken = () => localStorage.getItem("agentToken") || localStorage.getItem("authToken");

export const startAgentExport = async (exportType, filters = {}) => {
  const token = getAgentToken();
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/mada-data/export/${exportType}?${params}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Export failed to start");
  }
  return data;
};

export const getAgentExportJobStatus = async (jobId) => {
  const token = getAgentToken();
  const res = await fetch(`${API_BASE}/mada-data/jobs/${jobId}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch job status");
  }
  return data.data;
};

export const AGENT_EXPORT_TYPES = [
  { value: "finance", label: "Finance & commissions" },
  { value: "cases", label: "Cases & track record" },
];

export const CASE_CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "Installment", label: "Installment" },
  { value: "Property", label: "Property" },
  { value: "Loan", label: "Loan" },
  { value: "Insurance", label: "Insurance" },
];
