import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAgentAssignmentById, updateAssignmentStatus } from "../services/agentService";
import Navbar from "../components/Navbar";

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await getAgentAssignmentById(assignmentId);
      if (response.success) {
        setAssignment(response.data);
      } else {
        toast.error(response.message || "Failed to load assignment details");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
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

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    in_progress: "bg-blue-100 text-blue-800 border-blue-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    completed: "bg-purple-100 text-purple-800 border-purple-300",
  };

  const validStatuses = [
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "in_progress", label: "In Progress", color: "blue" },
    { value: "approved", label: "Approved", color: "green" },
    { value: "rejected", label: "Rejected", color: "red" },
    { value: "cancelled", label: "Cancelled", color: "gray" },
    { value: "completed", label: "Completed", color: "purple" },
  ];

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    try {
      setUpdatingStatus(true);
      const applicationId = assignmentData.applicationId;
      const response = await updateAssignmentStatus(applicationId, selectedStatus);
      
      if (response.success) {
        toast.success("Status updated successfully!");
        setShowStatusModal(false);
        setSelectedStatus("");
        // Refresh assignment data
        fetchAssignmentDetails();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Assignment not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const assignmentData = assignment.assignment || {};
  const applicationData = assignment.applicationData || {};
  const applicationType = assignment.applicationType || "unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-semibold group"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* Assignment Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 overflow-hidden relative">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Assignment Details</h2>
                <p className="text-sm text-gray-500">Complete information about this assignment</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-sm ${
                    statusColors[assignmentData.status] || statusColors.pending
                  }`}
                >
                  {assignmentData.status?.replace("_", " ").toUpperCase() || "PENDING"}
                </span>
                <button
                  onClick={() => {
                    setSelectedStatus(assignmentData.status || "pending");
                    setShowStatusModal(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assignment ID</p>
                <p className="font-black text-gray-900 text-sm break-all">{assignmentData._id?.toString().slice(-8) || "N/A"}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Application ID</p>
                <p className="font-black text-gray-900 text-sm">{assignmentData.applicationId || "N/A"}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</p>
                <p className="font-black text-gray-900 capitalize">{assignmentData.category || "N/A"}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</p>
                <p className="font-black text-gray-900">{assignmentData.city || "N/A"}</p>
              </div>
            </div>

            {assignmentData.note && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">Note:</p>
                    <p className="text-gray-700">{assignmentData.note}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Assigned At:</span>
                <span>{formatDate(assignmentData.assigenAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900">Application Information</h3>
          </div>

          {applicationType === "loan" && applicationData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Application Type</p>
                  <p className="font-black text-gray-900 text-lg">Loan Application</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</p>
                  <p className="font-black text-gray-900 text-lg">
                    {applicationData.productName || "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name</p>
                  <p className="font-black text-gray-900 text-lg">
                    {applicationData.bankName || "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requested Amount</p>
                  <p className="font-black text-primary text-lg">
                    {applicationData.loanRequirement?.requestedAmount
                      ? `PKR ${applicationData.loanRequirement.requestedAmount.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applicant Name</p>
                  <p className="font-black text-gray-900 text-lg">
                    {applicationData.applicantInfo?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                  <p className="font-black text-gray-900 capitalize text-lg">
                    {applicationData.status || "N/A"}
                  </p>
                </div>
              </div>

              {applicationData.contactInfo && (
                <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{applicationData.contactInfo.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{applicationData.contactInfo.mobileNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {applicationType === "installment" && applicationData && (
            <div className="space-y-6">
              {/* Application Overview */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-primary/20 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-black text-gray-900 text-xl">Application Overview</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Application ID</p>
                    <p className="font-black text-gray-900 text-lg">{applicationData.applicationIdString || applicationData.applicationId || "N/A"}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                    <p className="font-black text-gray-900 capitalize text-lg">{applicationData.status || "N/A"}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Applied On</p>
                    <p className="font-black text-gray-900 text-lg">{formatDate(applicationData.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* User Who Ordered - Complete Details */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900">User Who Ordered</h4>
                    <p className="text-sm text-gray-500 mt-1">Complete customer information</p>
                  </div>
                </div>
                
                {(applicationData.userDetails || applicationData.UserInfo?.[0]) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</p>
                      <p className="font-black text-gray-900 text-lg">
                        {applicationData.userDetails?.name || applicationData.UserInfo?.[0]?.name || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</p>
                      <p className="font-black text-gray-900 text-sm break-all">
                        {applicationData.userDetails?.email || applicationData.UserInfo?.[0]?.email || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</p>
                      <p className="font-black text-gray-900 text-lg">
                        {applicationData.userDetails?.phoneNumber || applicationData.UserInfo?.[0]?.phone || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</p>
                      <p className="font-black text-gray-900 text-lg">
                        {applicationData.userDetails?.city || applicationData.UserInfo?.[0]?.city || "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</p>
                      <p className="font-black text-gray-900">
                        {applicationData.userDetails?.address || applicationData.UserInfo?.[0]?.address || "N/A"}
                      </p>
                    </div>
                    {applicationData.UserInfo?.[0]?.occupation && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Occupation</p>
                        <p className="font-black text-gray-900 text-lg">{applicationData.UserInfo[0].occupation}</p>
                      </div>
                    )}
                    {applicationData.UserInfo?.[0]?.employerName && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Employer</p>
                        <p className="font-black text-gray-900 text-lg">{applicationData.UserInfo[0].employerName}</p>
                      </div>
                    )}
                    {applicationData.UserInfo?.[0]?.monthlyIncome && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Income</p>
                        <p className="font-black text-primary text-lg">PKR {applicationData.UserInfo[0].monthlyIncome}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Partner/Creator Who Posted Order */}
              {applicationData.creatorDetails && (
                <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 md:p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900">Partner/Creator Who Posted Order</h4>
                      <p className="text-sm text-gray-500 capitalize">{applicationData.creatorDetails.userType || "Creator"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</p>
                      <p className="font-black text-gray-900 text-lg">{applicationData.creatorDetails.name || "N/A"}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</p>
                      <p className="font-black text-gray-900 text-sm break-all">{applicationData.creatorDetails.email || "N/A"}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</p>
                      <p className="font-black text-gray-900 text-lg">{applicationData.creatorDetails.phoneNumber || "N/A"}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User Type</p>
                      <p className="font-black text-gray-900 capitalize text-lg">{applicationData.creatorDetails.userType || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* How Order Was Posted */}
              {applicationData.applicationNote && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 md:p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-black text-gray-900">How Order Was Posted</h4>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
                    <p className="text-gray-800 leading-relaxed font-medium">{applicationData.applicationNote}</p>
                  </div>
                </div>
              )}

              {/* Plan Details */}
              {applicationData.planDetails && (
                <div className="bg-white border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800">Installment Plan Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Product Name</p>
                      <p className="font-semibold text-gray-900">{applicationData.planDetails.productName || applicationData.planName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Company Name</p>
                      <p className="font-semibold text-gray-900">{applicationData.planDetails.companyName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-semibold text-gray-900 capitalize">{applicationData.planDetails.category || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price</p>
                      <p className="font-semibold text-gray-900">
                        {applicationData.planDetails.price
                          ? `PKR ${applicationData.planDetails.price.toLocaleString()}`
                          : applicationData.PlanInfo?.[0]?.totalAmount
                          ? `PKR ${applicationData.PlanInfo[0].totalAmount.toLocaleString()}`
                          : "N/A"}
                      </p>
                    </div>
                    {applicationData.planDetails.description && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="font-semibold text-gray-900">{applicationData.planDetails.description}</p>
                      </div>
                    )}
                    {applicationData.planDetails.productImages && applicationData.planDetails.productImages.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-2">Product Images</p>
                        <div className="grid grid-cols-3 gap-2">
                          {applicationData.planDetails.productImages.slice(0, 3).map((img, idx) => (
                            <img key={idx} src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Plan Details */}
              {applicationData.PlanInfo && applicationData.PlanInfo.length > 0 && (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Selected Payment Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {applicationData.PlanInfo.map((plan, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Plan {idx + 1}</p>
                        {plan.monthlyInstallment && (
                          <p className="text-lg font-bold text-gray-900">
                            PKR {plan.monthlyInstallment.toLocaleString()}/month
                          </p>
                        )}
                        {plan.tenureMonths && (
                          <p className="text-sm text-gray-600 mt-1">Tenure: {plan.tenureMonths} months</p>
                        )}
                        {plan.downPayment && (
                          <p className="text-sm text-gray-600 mt-1">Down Payment: PKR {plan.downPayment.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {applicationType === "property" && applicationData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Application Type</p>
                  <p className="font-semibold text-gray-800">Property Application</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Property Type</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.propertyType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applicant Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.commonForm?.[0]?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.status || "N/A"}
                  </p>
                </div>
              </div>

              {applicationData.commonForm?.[0] && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Email:</span>{" "}
                      {applicationData.commonForm[0].email || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Phone:</span>{" "}
                      {applicationData.commonForm[0].number || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {applicationType === "unknown" && (
            <div className="text-center py-8">
              <p className="text-gray-600">Application details not available</p>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <p>
              <span className="font-medium">Created At:</span>{" "}
              {formatDate(applicationData.createdAt || applicationData.applicationAt)}
            </p>
          </div>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 transform animate-scaleIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Update Assignment Status</h3>
                  <p className="text-sm text-gray-500 mt-1">Select the new status for this assignment</p>
                </div>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Select New Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {validStatuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
                      className={`px-4 py-4 rounded-xl font-bold text-sm transition-all border-2 transform hover:scale-105 active:scale-95 ${
                        selectedStatus === status.value
                          ? status.value === "pending"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-500 shadow-lg scale-105"
                            : status.value === "in_progress"
                            ? "bg-blue-100 text-blue-800 border-blue-500 shadow-lg scale-105"
                            : status.value === "approved"
                            ? "bg-green-100 text-green-800 border-green-500 shadow-lg scale-105"
                            : status.value === "rejected"
                            ? "bg-red-100 text-red-800 border-red-500 shadow-lg scale-105"
                            : status.value === "cancelled"
                            ? "bg-gray-100 text-gray-800 border-gray-500 shadow-lg scale-105"
                            : "bg-purple-100 text-purple-800 border-purple-500 shadow-lg scale-105"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatus("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || !selectedStatus}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {updatingStatus ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;