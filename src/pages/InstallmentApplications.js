import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getAllApplications, updateApplicationStatus } from '../services/installmentService';
import Navbar from '../components/Navbar';

const InstallmentApplications = () => {
    const { user } = useAuth();
    // const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingApplication, setViewingApplication] = useState(null);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllApplications({
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: 1,
                limit: 1000
            });
            if (response.success) {
                setApplications(response.data || []);
            } else {
                setError(response.message || 'Failed to fetch applications');
                toast.error(response.message || 'Failed to fetch applications');
            }
        } catch (err) {
            setError("Failed to connect to server");
            toast.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleUpdateStatus = async () => {
        if (!selectedApplication || !newStatus) {
            toast.error("Please select a status");
            return;
        }

        setUpdatingStatus(selectedApplication.applicationId);
        try {
            const response = await updateApplicationStatus(
                selectedApplication.applicationId,
                newStatus,
                user?.userId
            );
            if (response.success) {
                toast.success("Application status updated successfully");
                setShowStatusModal(false);
                setSelectedApplication(null);
                setNewStatus('');
                fetchApplications();
            } else {
                toast.error(response.message || "Failed to update status");
            }
        } catch (err) {
            toast.error(err.message || "Failed to update status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    const openStatusModal = (application) => {
        setSelectedApplication(application);
        setNewStatus(application.status);
        setShowStatusModal(true);
    };

    const openViewModal = (application) => {
        setViewingApplication(application);
        setShowViewModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'cancelled': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredApplications = applications.filter(app => {
        const userInfo = app.UserInfo?.[0] || {};
        const matchesSearch =
            (userInfo.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (userInfo.phone?.includes(searchTerm)) ||
            (app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const validStatuses = ['pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'];

    if (loading && applications.length === 0) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="text-sm font-medium text-gray-600">Loading applications...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <Navbar />
            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Installment Applications</h1>
                                <p className="text-red-100 text-sm font-medium mt-0.5">Manage user applications for installment plans</p>
                            </div>
                        </div>
                        <button 
                            onClick={fetchApplications} 
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
                    {/* Status Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {['all', 'pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                                    statusFilter === status 
                                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-200 scale-105' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                }`}
                            >
                                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by applicant name, phone, or application ID..."
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
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-5 rounded-xl shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-red-700 font-bold text-sm">{error}</p>
                    </div>
                )}

                {/* Applications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredApplications.map((app) => {
                        const userInfo = app.UserInfo?.[0] || {};
                        const plan = app.PlanInfo?.[0] || {};
                        const fin = app.PlanInfo?.[1] || {};

                        return (
                            <div key={app._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                                            {app.status.replace('_', ' ')}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">{app.applicationId || 'NO_ID'}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 line-clamp-1">{userInfo.name || 'Anonymous Applicant'}</h3>
                                            <p className="text-sm text-gray-600 mt-1 font-medium">{userInfo.city || 'N/A'} • {userInfo.phone || 'N/A'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Plan</p>
                                                <p className="text-sm font-black text-gray-900 line-clamp-1">{plan.planType || 'Standard'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Income</p>
                                                <p className="text-sm font-black text-gray-900">{userInfo.monthlyIncome ? `PKR ${userInfo.monthlyIncome.toLocaleString()}` : 'N/A'}</p>
                                            </div>
                                        </div>

                                        {fin.monthlyInstallment && (
                                            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm space-y-2">
                                                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                                                    <span>Monthly Payment</span>
                                                    <span className="text-red-600">PKR {fin.monthlyInstallment.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                                    <span>Tenure: {fin.tenureMonths || '0'}M</span>
                                                    <span>Downpayment: PKR {fin.downPayment?.toLocaleString() || '0'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 flex gap-2">
                                        <button
                                            onClick={() => openViewModal(app)}
                                            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </button>
                                        <button
                                            onClick={() => openStatusModal(app)}
                                            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-bold hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-200 active:scale-95"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredApplications.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Applications Found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters' 
                                : 'No installment applications found'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {showViewModal && viewingApplication && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-scaleIn max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Application Details</h3>
                                    <p className="text-blue-100 text-sm">Complete application information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingApplication(null);
                                }}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Application Overview */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                                <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Application Overview
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Application ID</p>
                                        <p className="text-base font-black text-gray-900">{viewingApplication.applicationId || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getStatusColor(viewingApplication.status)}`}>
                                            {viewingApplication.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Applied On</p>
                                        <p className="text-base font-semibold text-gray-900">{formatDate(viewingApplication.createdAt)}</p>
                                    </div>
                                    {viewingApplication.updatedAt && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                                            <p className="text-base font-semibold text-gray-900">{formatDate(viewingApplication.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Applicant Information */}
                            {viewingApplication.UserInfo?.[0] && (
                                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
                                    <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Applicant Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                                            <p className="text-base font-black text-gray-900">{viewingApplication.UserInfo[0].name || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                                            <p className="text-base font-black text-gray-900">{viewingApplication.UserInfo[0].phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-base font-black text-gray-900 break-all">{viewingApplication.UserInfo[0].email || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</p>
                                            <p className="text-base font-black text-gray-900">{viewingApplication.UserInfo[0].city || 'N/A'}</p>
                                        </div>
                                        {viewingApplication.UserInfo[0].address && (
                                            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</p>
                                                <p className="text-base font-semibold text-gray-900">{viewingApplication.UserInfo[0].address}</p>
                                            </div>
                                        )}
                                        {viewingApplication.UserInfo[0].occupation && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Occupation</p>
                                                <p className="text-base font-black text-gray-900">{viewingApplication.UserInfo[0].occupation}</p>
                                            </div>
                                        )}
                                        {viewingApplication.UserInfo[0].employerName && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Employer</p>
                                                <p className="text-base font-black text-gray-900">{viewingApplication.UserInfo[0].employerName}</p>
                                            </div>
                                        )}
                                        {viewingApplication.UserInfo[0].monthlyIncome && (
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly Income</p>
                                                <p className="text-xl font-black text-green-700">PKR {viewingApplication.UserInfo[0].monthlyIncome.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Plan Information */}
                            {((viewingApplication.PlanInfo && viewingApplication.PlanInfo.length > 0) || viewingApplication.planDetails) && (
                                <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-lg">
                                    <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Plan Information
                                    </h4>
                                    <div className="space-y-4">
                                        {/* Plan Type/Name */}
                                        {(viewingApplication.PlanInfo?.[0]?.planType || viewingApplication.PlanInfo?.[0]?.planName || viewingApplication.planDetails?.productName) && (
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plan Type / Product Name</p>
                                                <p className="text-base font-black text-gray-900">
                                                    {viewingApplication.PlanInfo?.[0]?.planType || 
                                                     viewingApplication.PlanInfo?.[0]?.planName || 
                                                     viewingApplication.planDetails?.productName || 
                                                     'Standard Plan'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Plan Price */}
                                        {(viewingApplication.PlanInfo?.[0]?.planPrice || viewingApplication.planDetails?.price) && (
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Price</p>
                                                <p className="text-2xl font-black text-blue-700">
                                                    PKR {(viewingApplication.PlanInfo?.[0]?.planPrice || viewingApplication.planDetails?.price || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        {/* Payment Details - Same Format as Creation */}
                                        {(viewingApplication.PlanInfo?.[1] || (viewingApplication.PlanInfo?.[0] && (viewingApplication.PlanInfo[0].monthlyInstallment || viewingApplication.PlanInfo[0].downPayment))) && (
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                                <h5 className="text-base font-black text-gray-900 mb-4">Payment Plan Summary</h5>
                                                
                                                {/* Summary Section - Same as Creation Form */}
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white/50 p-4 rounded-2xl border border-gray-200 mb-4">
                                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border-2 border-red-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly Installment (EMI)</p>
                                                        <p className="text-lg font-black text-red-700">
                                                            PKR {(viewingApplication.PlanInfo?.[1]?.monthlyInstallment || viewingApplication.PlanInfo?.[0]?.monthlyInstallment || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Markup Amount</p>
                                                        <p className="text-base font-black text-gray-900">
                                                            PKR {(viewingApplication.PlanInfo?.[1]?.markup || viewingApplication.PlanInfo?.[0]?.markup || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Payable</p>
                                                        <p className="text-base font-black text-gray-900">
                                                            PKR {(viewingApplication.PlanInfo?.[1]?.installmentPrice || viewingApplication.PlanInfo?.[0]?.planPrice || viewingApplication.PlanInfo?.[0]?.totalAmount || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Cost to Customer</p>
                                                        <p className="text-lg font-black text-green-700">
                                                            PKR {(viewingApplication.PlanInfo?.[1]?.totalCostToCustomer || viewingApplication.PlanInfo?.[1]?.totalCost || viewingApplication.PlanInfo?.[0]?.planPrice || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Financed Amount</p>
                                                        <p className="text-base font-black text-gray-900">
                                                            PKR {Math.max(0, ((viewingApplication.PlanInfo?.[0]?.planPrice || viewingApplication.planDetails?.price || 0) - (viewingApplication.PlanInfo?.[1]?.downPayment || viewingApplication.PlanInfo?.[0]?.downPayment || 0))).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Detailed Information */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {(viewingApplication.PlanInfo?.[1]?.downPayment || viewingApplication.PlanInfo?.[0]?.downPayment) && (
                                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Down Payment</p>
                                                            <p className="text-lg font-black text-gray-900">
                                                                PKR {(viewingApplication.PlanInfo?.[1]?.downPayment || viewingApplication.PlanInfo?.[0]?.downPayment || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(viewingApplication.PlanInfo?.[1]?.tenureMonths || viewingApplication.PlanInfo?.[0]?.tenureMonths) && (
                                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tenure</p>
                                                            <p className="text-lg font-black text-gray-900">
                                                                {viewingApplication.PlanInfo?.[1]?.tenureMonths || viewingApplication.PlanInfo?.[0]?.tenureMonths || 0} months
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(viewingApplication.PlanInfo?.[1]?.interestRatePercent || viewingApplication.PlanInfo?.[0]?.interestRatePercent) && (
                                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Interest Rate</p>
                                                            <p className="text-lg font-black text-gray-900">
                                                                {viewingApplication.PlanInfo?.[1]?.interestRatePercent || viewingApplication.PlanInfo?.[0]?.interestRatePercent || 0}%
                                                                {(viewingApplication.PlanInfo?.[1]?.interestType || viewingApplication.PlanInfo?.[0]?.interestType) && (
                                                                    <span className="text-sm font-normal text-gray-600">
                                                                        {' '}({viewingApplication.PlanInfo?.[1]?.interestType || viewingApplication.PlanInfo?.[0]?.interestType})
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Show message if no plan info available */}
                                        {!viewingApplication.PlanInfo && !viewingApplication.planDetails && (
                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-yellow-800">Plan information not available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Application Note */}
                            {viewingApplication.applicationNote && (
                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6">
                                    <h4 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Application Note
                                    </h4>
                                    <p className="text-gray-800 leading-relaxed font-medium">{viewingApplication.applicationNote}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingApplication(null);
                                }}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-all active:scale-95"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingApplication(null);
                                    openStatusModal(viewingApplication);
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-sm hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-gray-900">Update Application Status</h3>
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedApplication(null);
                                    setNewStatus('');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-bold text-gray-600 mb-1">Application ID</p>
                                <p className="text-sm text-gray-900 font-medium">{selectedApplication.applicationId}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-600 mb-1">Applicant</p>
                                <p className="text-sm text-gray-900 font-medium">{selectedApplication.UserInfo?.[0]?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">New Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm font-bold text-gray-700"
                                >
                                    {validStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedApplication(null);
                                    setNewStatus('');
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={updatingStatus === selectedApplication.applicationId}
                                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-sm hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingStatus === selectedApplication.applicationId ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstallmentApplications;
