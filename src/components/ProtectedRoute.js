import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAgentProfileComplete } from "../utils/agentProfile";
import UnderReview from "../pages/UnderReview";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const location = useLocation();
  const pathname = location.pathname || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.emailVerify === false) {
    return <Navigate to="/verify-account" state={{ email: user.email }} replace />;
  }

  if (user?.UserType !== "agent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-primary mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This panel is only accessible to agents. Your account type is: <strong>{user?.UserType || "Unknown"}</strong>
          </p>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user && user.isVerified === false) {
    return <UnderReview />;
  }

  if (user && !isAgentProfileComplete(user)) {
    if (pathname === "/complete-profile" || pathname === "/profile") {
      return children;
    }
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
