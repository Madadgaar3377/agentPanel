import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UnderReview() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your account is under review</h1>
        <p className="text-gray-600 mb-6">
          Thank you for signing up as an agent. Our team is reviewing your account. You’ll get full access to the agent panel once approved.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          In the meantime, you can complete your profile so we have your phone number, address, CNIC, ID card, and bank details ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/complete-profile")}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            Complete profile
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
