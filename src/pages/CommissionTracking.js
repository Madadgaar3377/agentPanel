import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE_URL = "https://api.madadgaar.com.pk/api";

const CommissionTracking = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    commissionStatus: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  const fetchAssignments = useCallback(async () => {
    // Calculate totals
    let earned = 0;
    let pending = 0;
    let paid = 0;

    assignments.forEach((item) => {
      const commission = item.commissionInfo?.eligibleCommission || 0;
      const status = item.commissionInfo?.commissionStatus || "Not Earned";

      if (status === "Earned" || status === "Pending" || status === "Paid") {
        earned += commission;
      }
      if (status === "Pending") {
        pending += commission;
      }
      if (status === "Paid") {
        paid += commission;
      }
    });

    setTotalEarned(earned);
    setTotalPending(pending);
    setTotalPaid(paid);
  }, [assignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("agentToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/getRequestsByUserId`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      let allAssignments = [];
      if (Array.isArray(data)) {
        allAssignments = data;
      } else if (data.success || data.data) {
        allAssignments = Array.isArray(data.data) ? data.data : [];
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      alert("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getCommissionStatusColor = (status) => {
    const colors = {
      "Not Earned": "bg-gray-100 text-gray-800",
      "Earned": "bg-blue-100 text-blue-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Paid": "bg-green-100 text-green-800",
      "Reversed": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesCommissionStatus =
      !filters.commissionStatus ||
      item.commissionInfo?.commissionStatus === filters.commissionStatus;
    return matchesSearch && matchesStatus && matchesCategory && matchesCommissionStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navbar />
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Commission Tracking
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">View your commission earnings and status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Earned</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
                  PKR {totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Pending Payment</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
                PKR {totalPending.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
                PKR {totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Application ID, Category..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              <option value="Property">Property</option>
              <option value="Installment">Installment</option>
              <option value="Loan">Loan</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Commission Status
            </label>
            <select
              value={filters.commissionStatus}
              onChange={(e) =>
                setFilters({ ...filters, commissionStatus: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Commission Statuses</option>
              <option value="Not Earned">Not Earned</option>
              <option value="Earned">Earned</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto -mx-3 xs:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 xs:px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Application
                </th>
                <th className="px-3 xs:px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                  Category
                </th>
                <th className="px-3 xs:px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Commission
                </th>
                <th className="px-3 xs:px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-3 xs:px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 xs:px-4 sm:px-6 py-8 text-center text-gray-500 text-sm">
                    No assignments found
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {item.applicationId || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden mt-1">
                        <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {item.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        PKR{" "}
                        {item.commissionInfo?.eligibleCommission?.toLocaleString() || "0"}
                      </div>
                      <div className="text-xs text-gray-500 hidden md:block">
                        {item.commissionInfo?.commissionBasis || "N/A"}
                      </div>
                    </td>
                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getCommissionStatusColor(
                          item.commissionInfo?.commissionStatus || "Not Earned"
                        )}`}
                      >
                        {item.commissionInfo?.commissionStatus || "Not Earned"}
                      </span>
                    </td>
                    <td className="px-3 xs:px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      <div className="text-xs text-gray-500">
                        {item.commissionInfo?.commissionEarnedAt
                          ? `Earned: ${new Date(
                              item.commissionInfo.commissionEarnedAt
                            ).toLocaleDateString()}`
                          : "Not earned yet"}
                      </div>
                      {item.commissionInfo?.commissionPaidAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Paid: {new Date(item.commissionInfo.commissionPaidAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CommissionTracking;
