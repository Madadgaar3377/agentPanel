import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAgentDashboard, getAgentAssignments } from "../services/agentService";
import StatCard from "../components/StatCard";
import AssignmentCard from "../components/AssignmentCard";
import AssignmentFilters from "../components/AssignmentFilters";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    city: "",
    type: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAssignments();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [filters.status, filters.category, filters.city, filters.type, filters.page]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAgentDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error(response.message || "Failed to load dashboard data");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await getAgentAssignments(filters);
      if (response.success) {
        setAssignments(response.data || []);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || "Failed to load assignments");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      category: "",
      city: "",
      type: "",
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.statistics || {};
  const agentInfo = dashboardData?.agentInfo || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <nav className="bg-white shadow-md border-b-2 border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">MADADGAAR</h1>
              <span className="ml-4 text-gray-600">Agent Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{agentInfo.name || user?.name}</p>
                <p className="text-xs text-gray-500">{agentInfo.email || user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, {agentInfo.name || user?.name || "Agent"}!
          </h2>
          <p className="text-gray-600 mt-1">Here's your dashboard overview</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Assignments"
            value={stats.total || 0}
            icon={<span className="text-2xl">📋</span>}
            color="primary"
          />
          <StatCard
            title="Pending"
            value={stats.byStatus?.pending || 0}
            icon={<span className="text-2xl">⏳</span>}
            color="yellow"
            subtitle="Requires attention"
          />
          <StatCard
            title="In Progress"
            value={stats.byStatus?.inProgress || 0}
            icon={<span className="text-2xl">🔄</span>}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.byStatus?.completed || 0}
            icon={<span className="text-2xl">✅</span>}
            color="green"
            subtitle={`${stats.performance?.completionRate || 0}% completion rate`}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Approved"
            value={stats.byStatus?.approved || 0}
            icon={<span className="text-2xl">✓</span>}
            color="green"
          />
          <StatCard
            title="Rejected"
            value={stats.byStatus?.rejected || 0}
            icon={<span className="text-2xl">✗</span>}
            color="red"
          />
          <StatCard
            title="This Month"
            value={stats.recent?.thisMonth || 0}
            icon={<span className="text-2xl">📅</span>}
            color="purple"
            subtitle="New assignments"
          />
        </div>

        {/* Assignments Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">My Assignments</h3>
            <button
              onClick={fetchAssignments}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
            >
              Refresh
            </button>
          </div>

          <AssignmentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {assignmentsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No assignments found</p>
              <p className="text-gray-500 text-sm mt-2">
                {Object.values(filters).some((f) => f && f !== filters.page && f !== filters.limit)
                  ? "Try adjusting your filters"
                  : "You don't have any assignments yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((assignment) => (
                  <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
