import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAgentAssignmentById } from "../services/agentService";
import Navbar from "../components/Navbar";

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Assignment Details</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                statusColors[assignmentData.status] || statusColors.pending
              }`}
            >
              {assignmentData.status?.replace("_", " ").toUpperCase() || "PENDING"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Assignment ID</p>
              <p className="font-semibold text-gray-800">{assignmentData._id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Application ID</p>
              <p className="font-semibold text-gray-800">{assignmentData.applicationId || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold text-gray-800">{assignmentData.category || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-semibold text-gray-800">{assignmentData.city || "N/A"}</p>
            </div>
          </div>

          {assignmentData.note && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Note:</p>
              <p className="text-gray-800">{assignmentData.note}</p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">Assigned At:</span> {formatDate(assignmentData.assigenAt)}
            </p>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Application Information</h3>

          {applicationType === "loan" && applicationData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Application Type</p>
                  <p className="font-semibold text-gray-800">Loan Application</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.productName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.bankName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested Amount</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.loanRequirement?.requestedAmount
                      ? `PKR ${applicationData.loanRequirement.requestedAmount.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applicant Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.applicantInfo?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.status || "N/A"}
                  </p>
                </div>
              </div>

              {applicationData.contactInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Email:</span>{" "}
                      {applicationData.contactInfo.email || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Phone:</span>{" "}
                      {applicationData.contactInfo.mobileNumber || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {applicationType === "installment" && applicationData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Application Type</p>
                  <p className="font-semibold text-gray-800">Installment Application</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.PlanInfo?.[0]?.productName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.PlanInfo?.[0]?.totalAmount
                      ? `PKR ${applicationData.PlanInfo[0].totalAmount.toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applicant Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.UserInfo?.[0]?.name || "N/A"}
                  </p>
                </div>
              </div>

              {applicationData.UserInfo?.[0] && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Email:</span>{" "}
                      {applicationData.UserInfo[0].email || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Phone:</span>{" "}
                      {applicationData.UserInfo[0].phone || "N/A"}
                    </p>
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
      </div>
    </div>
  );
};

export default AssignmentDetail;