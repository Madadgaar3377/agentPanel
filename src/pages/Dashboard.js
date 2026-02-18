import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAgentDashboard, getAgentAssignments } from "../services/agentService";
import StatCard from "../components/StatCard";
import AssignmentCard from "../components/AssignmentCard";
import AssignmentFilters from "../components/AssignmentFilters";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");
      const response = await getAgentDashboard();
      console.log("Dashboard Response:", response); // Debug log
      if (response && response.success) {
        setDashboardData(response.data || response);
        // Show stats in console for debugging
        if (response.data?.statistics) {
          console.log("Dashboard Statistics:", response.data.statistics);
        }
      } else {
        const errorMsg = response?.message || "Failed to load dashboard data";
        console.error("Dashboard API error:", errorMsg);
        toast.error(errorMsg);
        // Set empty dashboard data to prevent infinite loading
        setDashboardData({
          statistics: {},
          agentInfo: {},
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error); // Debug log
      const errorMsg = error.message || "An error occurred while loading dashboard";
      toast.error(errorMsg);
      // Set empty dashboard data to prevent infinite loading
      setDashboardData({
        statistics: {},
        agentInfo: {},
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setAssignmentsLoading(true);
      const response = await getAgentAssignments(filters);
      console.log("Assignments Response:", response); // Debug log
      if (response.success) {
        const assignmentsData = response.data || response.assignments || [];
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        setPagination(response.pagination || {
          total: assignmentsData.length,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil((assignmentsData.length || 0) / filters.limit)
        });
        
        // Show toast if no assignments found
        if (assignmentsData.length === 0 && !Object.values(filters).some((f) => f && f !== filters.page && f !== filters.limit)) {
          toast.info("No assignments found. You'll see assignments here once they are assigned to you.");
        }
      } else {
        toast.error(response.message || "Failed to load assignments");
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error); // Debug log
      toast.error(error.message || "An error occurred while loading assignments");
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Only fetch data if auth is not loading and user is available
    if (!authLoading && user) {
      console.log("Fetching dashboard data...", { authLoading, hasUser: !!user });
      fetchDashboardData();
      fetchAssignments();
    } else {
      console.log("Waiting for auth...", { authLoading, hasUser: !!user });
    }
  }, [authLoading, user, fetchDashboardData, fetchAssignments]);

  useEffect(() => {
    // Only fetch assignments when filters change (if auth is not loading and user is available)
    if (!authLoading && user) {
      fetchAssignments();
    }
  }, [filters.status, filters.category, filters.city, filters.type, filters.page, fetchAssignments, authLoading, user]);

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

  // const handleLogout = () => {
  //   logout();
  //   toast.info("Logged out successfully");
  //   navigate("/login");
  // };

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading if user is not available (shouldn't happen due to ProtectedRoute, but just in case)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show loading if dashboard data is still loading (but user is authenticated)
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Initialize with defaults if dashboardData is not available
  const stats = dashboardData?.statistics || {
    total: 0,
    byStatus: {
      pending: 0,
      inProgress: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    },
    recent: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    },
    performance: {
      completionRate: 0,
      totalCompleted: 0,
      totalRejected: 0,
    },
  };
  const agentInfo = dashboardData?.agentInfo || {
    name: user?.name || "Agent",
    walletBalance: user?.walletBalance ?? 0,
  };
  const rawWallet = agentInfo.walletBalance ?? user?.walletBalance ?? 0;
  const walletNum = Number(rawWallet);
  const walletBalance = Number.isFinite(walletNum) ? walletNum : 0;
  const walletDisplay = String(walletBalance.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            Welcome back, {agentInfo.name || user?.name || "Agent"}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Here's your dashboard overview</p>
        </div>


        {/* Wallet Balance Card */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-red-100 text-xs sm:text-sm font-medium mb-1">Wallet Balance</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" title={`PKR ${walletDisplay}`}>
                  PKR {walletDisplay}
                </h3>
                <p className="text-red-100 text-xs mt-2">Available for withdrawal</p>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Assignments"
            value={stats.total || 0}
            icon={<span className="text-2xl">📋</span>}
            color="primary"
            subtitle={stats.total > 0 ? `${assignments.length} currently visible` : "No assignments yet"}
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
            subtitle="Active work"
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
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">My Assignments</h3>
            <button
              onClick={fetchAssignments}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm sm:text-base font-semibold whitespace-nowrap self-start sm:self-auto"
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-semibold">No assignments found</p>
              <p className="text-gray-500 text-sm mt-2">
                {Object.values(filters).some((f) => f && f !== filters.page && f !== filters.limit)
                  ? "Try adjusting your filters or click Refresh to reload"
                  : "You don't have any assignments yet. Assignments will appear here once users apply and admin assigns them to you."}
              </p>
              <button
                onClick={fetchAssignments}
                className="mt-4 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition font-semibold"
              >
                Refresh Assignments
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-600">
                  Showing <strong>{assignments.length}</strong> assignment{assignments.length !== 1 ? 's' : ''}
                  {pagination && pagination.total > assignments.length && (
                    <span> of <strong>{pagination.total}</strong> total</span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {assignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.assignmentId || assignment._id || Math.random()} 
                    assignment={assignment} 
                  />
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
