import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAgentAssignments } from '../services/agentService';
import Navbar from '../components/Navbar';

const InsuranceApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAgentAssignments({
        category: 'Insurance',
        status: statusFilter || undefined,
        page: 1,
        limit: 500,
      });
      if (response.success) {
        const data = response.data || response.assignments || [];
        setApplications(Array.isArray(data) ? data : []);
      } else {
        setError(response.message || 'Failed to fetch insurance applications');
        toast.error(response.message || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
      toast.error('Failed to fetch insurance applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'cancelled': return 'bg-gray-50 text-gray-600 border-gray-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const filteredApplications = applications.filter((item) => {
    const appId = item.applicationId || item._id || '';
    const city = (item.city || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      String(appId).toLowerCase().includes(term) ||
      city.includes(term)
    );
  });

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Loading insurance applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Insurance Applications</h1>
                <p className="text-red-100 text-sm font-medium mt-0.5">User applications for insurance assigned to you</p>
              </div>
            </div>
            <button
              onClick={fetchApplications}
              className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-95"
              aria-label="Refresh"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {['', 'pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'].map((status) => (
              <button
                key={status || 'all'}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status ? status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1) : 'All'}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Application ID or City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredApplications.map((item) => {
            const assignmentId = item._id;
            const status = item.status || 'pending';
            const applicationId = item.applicationId || assignmentId?.toString().slice(-8) || 'N/A';
            const city = item.city || 'N/A';
            const assignedAt = item.assigenAt || item.createdAt;
            return (
              <div
                key={assignmentId}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusColor(status)}`}>
                      {(status || 'pending').replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase truncate max-w-[120px]" title={applicationId}>
                      {String(applicationId).slice(-10)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</p>
                    <p className="text-lg font-black text-gray-900">Insurance</p>
                    <p className="text-sm text-gray-600 font-medium">City: {city}</p>
                    <p className="text-xs text-gray-500">Assigned: {formatDate(assignedAt)}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/assignment/${assignmentId}`)}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApplications.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🛡️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Insurance Applications</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filters'
                : 'No insurance applications assigned to you yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceApplications;
