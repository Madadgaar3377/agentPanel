import React from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/login");
  };

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
              <span className="text-gray-700">{user?.name || user?.email}</span>
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Dashboard</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">User Information</h3>
              <div className="mt-2 space-y-2 text-gray-600">
                <p><strong>Name:</strong> {user?.name || "N/A"}</p>
                <p><strong>Email:</strong> {user?.email || "N/A"}</p>
                <p><strong>User Type:</strong> {user?.UserType || "N/A"}</p>
                <p><strong>User ID:</strong> {user?.userId || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
