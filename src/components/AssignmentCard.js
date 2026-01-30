import React from "react";
import { useNavigate } from "react-router-dom";

const AssignmentCard = ({ assignment }) => {
  const navigate = useNavigate();

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    in_progress: "bg-blue-100 text-blue-800 border-blue-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    completed: "bg-purple-100 text-purple-800 border-purple-300",
  };

  const typeColors = {
    loan: "bg-indigo-100 text-indigo-800",
    installment: "bg-pink-100 text-pink-800",
    property: "bg-teal-100 text-teal-800",
    unknown: "bg-gray-100 text-gray-800",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = () => {
    navigate(`/dashboard/assignment/${assignment.assignmentId}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold border ${
                statusColors[assignment.status] || statusColors.pending
              }`}
            >
              {assignment.status?.replace("_", " ").toUpperCase() || "PENDING"}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                typeColors[assignment.applicationType] || 
                typeColors[assignment.applicationData?.type] || 
                typeColors.unknown
              }`}
            >
              {(assignment.applicationType || assignment.applicationData?.type || "UNKNOWN").toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {assignment.applicationData?.applicantName || 
             assignment.applicationData?.userDetails?.name ||
             assignment.applicationData?.UserInfo?.[0]?.name ||
             assignment.applicationData?.applicantInfo?.name ||
             "N/A"}
          </h3>
          {assignment.category && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Category:</span> {assignment.category}
            </p>
          )}
          {assignment.city && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">City:</span> {assignment.city}
            </p>
          )}
        </div>
      </div>

      {assignment.applicationData && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(assignment.applicationData.type === "loan" || assignment.applicationType === "loan") && (
              <>
                <div>
                  <span className="text-gray-600">Product:</span>{" "}
                  <span className="font-medium">
                    {assignment.applicationData.productName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>{" "}
                  <span className="font-medium">
                    {assignment.applicationData.requestedAmount
                      ? `PKR ${assignment.applicationData.requestedAmount.toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
              </>
            )}
            {(assignment.applicationData?.type === "installment" || assignment.applicationType === "installment") && (
              <>
                <div>
                  <span className="text-gray-600">Plan:</span>{" "}
                  <span className="font-medium">
                    {assignment.applicationData.planName || 
                     assignment.applicationData.planDetails?.productName ||
                     assignment.applicationData.PlanInfo?.[0]?.productName ||
                     "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>{" "}
                  <span className="font-medium">
                    {assignment.applicationData.totalAmount
                      ? `PKR ${assignment.applicationData.totalAmount.toLocaleString()}`
                      : assignment.applicationData.planDetails?.price
                      ? `PKR ${assignment.applicationData.planDetails.price.toLocaleString()}`
                      : assignment.applicationData.PlanInfo?.[0]?.totalAmount
                      ? `PKR ${assignment.applicationData.PlanInfo[0].totalAmount.toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
              </>
            )}
            {(assignment.applicationData.type === "property" || assignment.applicationType === "property") && (
              <div>
                <span className="text-gray-600">Type:</span>{" "}
                <span className="font-medium">
                  {assignment.applicationData.propertyType || "N/A"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commission Info */}
      {assignment.commissionInfo && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 font-medium">Commission:</span>
            <span className="text-sm font-bold text-green-600">
              PKR {assignment.commissionInfo?.eligibleCommission?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Status:</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              assignment.commissionInfo?.commissionStatus === "Paid" 
                ? "bg-green-100 text-green-800"
                : assignment.commissionInfo?.commissionStatus === "Earned"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {assignment.commissionInfo?.commissionStatus || "Not Earned"}
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Assigned: {formatDate(assignment.assignedAt || assignment.assigenAt)}
        </p>
        <button
          className="text-primary hover:text-primary-dark text-sm font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
