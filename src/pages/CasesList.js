import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

const CasesList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axios.get(
        `${API_BASE_URL}/getAgentAssignments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCases(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchPerformanceStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_BASE_URL}/getAgentPerformanceStats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    fetchPerformanceStats();
  }, [fetchCases, fetchPerformanceStats]);

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      approved: 'bg-purple-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500',
      cancelled: 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Property: '🏢',
      Installment: '🛒',
      Loan: '💰',
      Insurance: '🛡',
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your assigned applications
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Total Assignments</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.totalAssignments || stats.totalCases || cases.length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Completed</div>
                <div className="mt-1 text-2xl font-semibold text-green-600">
                  {stats.completedAssignments || stats.closedCases || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">
                  {stats.conversionRate?.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">Total Commission</div>
                <div className="mt-1 text-2xl font-semibold text-purple-600">
                  PKR {stats.commissionStats?.[0]?.totalCommission?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Property">Property</option>
                  <option value="Installment">Installment</option>
                  <option value="Loan">Loan</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {cases.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No assignments found</p>
              </div>
            ) : (
              cases.map((caseItem) => (
                <div
                  key={caseItem._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getCategoryIcon(caseItem.category)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {caseItem.applicationId}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{caseItem.applicationData?.planName || caseItem.applicationData?.productName || 'N/A'}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadgeColor(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status}
                      </span>
                    </div>

                    {/* Client Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Client:</strong> {caseItem.applicationData?.applicantName || caseItem.applicationData?.contactInfo?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {caseItem.applicationData?.contactInfo?.email || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Phone:</strong> {caseItem.applicationData?.contactInfo?.phone || 'N/A'}
                      </p>
                    </div>

                    {/* Commission Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Commission:</span>
                        <span className="text-lg font-semibold text-green-600">
                          PKR {caseItem.commissionInfo?.eligibleCommission?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Status:</span>
                        <span
                          className={`text-xs font-medium ${
                            caseItem.commissionInfo?.commissionPayable === 'Paid'
                              ? 'text-green-600'
                              : caseItem.commissionInfo?.commissionPayable === 'Pending'
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {caseItem.commissionInfo?.commissionPayable || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="text-xs text-gray-500 mb-4">
                      <p>Assigned: {new Date(caseItem.assignedAt || caseItem.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/dashboard/assignment/${caseItem.assignmentId || caseItem._id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems}{' '}
                total)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CasesList;
