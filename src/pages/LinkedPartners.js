import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthToken } from "../config/api";
import Navbar from "../components/Navbar";

const LinkedPartners = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchLinkedPartners();
  }, [navigate]);

  const fetchLinkedPartners = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/agent/linkedPartners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setList(data.data);
      } else {
        setError(data.message || "Failed to load linked partners");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🤝</span> Linked Partners & Companies
          </h1>
          <p className="text-gray-600 mt-1">
            Partners and companies that have added you as their agent. Orders from them may be auto-assigned to you.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
            <p className="text-gray-600">No partners or companies have linked you yet.</p>
            <p className="text-sm text-gray-500 mt-2">When a partner adds you in their &quot;My Agents&quot; list, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.companyName}</p>
                  {item.partnerName && item.partnerName !== item.companyName && (
                    <p className="text-sm text-gray-600 mt-0.5">Contact: {item.partnerName}</p>
                  )}
                  {item.email && (
                    <p className="text-sm text-gray-600">📧 {item.email}</p>
                  )}
                  {item.phoneNumber && (
                    <p className="text-sm text-gray-600">📞 {item.phoneNumber}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Linked on {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  Connected
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedPartners;
