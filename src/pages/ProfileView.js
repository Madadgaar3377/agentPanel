import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/authService";
import { getAgentDashboard } from "../services/agentService";
import Navbar from "../components/Navbar";

// Icons as SVG components
const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const MailIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const PhoneIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BuildingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const WalletIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const EditIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const CreditCardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const ProfileView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchProfileData();
    fetchWalletBalance();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await getUserById();
      if (response.success) {
        const data = response.user || response.data || user;
        setUserData(data);
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await getAgentDashboard();
      if (response.success && response.data?.agentInfo?.walletBalance !== undefined) {
        setWalletBalance(response.data.agentInfo.walletBalance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-6">Unable to load profile data</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-600 mt-1">View your complete account information</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 shadow-lg"
          >
            <EditIcon className="w-5 h-5" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center sticky top-24">
              {/* Profile Picture */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center border-4 border-white shadow-lg mx-auto">
                  {userData.profilePic ? (
                    <img
                      src={userData.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-red-600" />
                  )}
                </div>
                {/* Verification Badge */}
                <div className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                  userData.isVerified ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {userData.isVerified ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <ClockIcon className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              {/* Name and Email */}
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{userData.name || "Agent"}</h3>
              <p className="text-sm text-gray-500 mb-1">{userData.userName || "Username"}</p>
              <p className="text-sm text-gray-600 mb-4">{userData.email}</p>

              {/* Status Badges */}
              <div className="flex flex-col gap-2 mb-6">
                <div className={`px-4 py-2 rounded-lg ${
                  userData.isVerified
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-xs font-semibold uppercase ${
                    userData.isVerified ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {userData.isVerified ? '✓ Verified Account' : '⏳ Pending Verification'}
                  </p>
                </div>

                <div className={`px-4 py-2 rounded-lg ${
                  userData.isActive !== false
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold uppercase ${
                    userData.isActive !== false ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {userData.isActive !== false ? '● Active' : '○ Inactive'}
                  </p>
                </div>

                {userData.emailVerify && (
                  <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-semibold uppercase text-emerald-700">
                      ✓ Email Verified
                    </p>
                  </div>
                )}
              </div>

              {/* Wallet Balance */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <WalletIcon className="w-5 h-5" />
                  <p className="text-sm font-medium">Wallet Balance</p>
                </div>
                <h4 className="text-2xl font-bold">
                  PKR {walletBalance.toLocaleString() || userData.walletBalance?.toLocaleString() || '0'}
                </h4>
                <p className="text-xs text-red-100 mt-1">Available for withdrawal</p>
              </div>

              {/* User ID */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">User ID</p>
                <p className="text-sm font-mono text-gray-700">{userData.userId || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-red-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Full Name</label>
                  <p className="text-base text-gray-900">{userData.name || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Username</label>
                  <p className="text-base text-gray-900">{userData.userName || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="text-base text-gray-900">{userData.email || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    Phone Number
                  </label>
                  <p className="text-base text-gray-900">{userData.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    WhatsApp Number
                  </label>
                  <p className="text-base text-gray-900">{userData.WhatsappNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">CNIC Number</label>
                  <p className="text-base text-gray-900">{userData.cnicNumber || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    Address
                  </label>
                  <p className="text-base text-gray-900">{userData.Address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShieldIcon className="w-6 h-6 text-red-600" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">User Type</label>
                  <p className="text-base text-gray-900 capitalize">{userData.UserType || "Agent"}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Account Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    userData.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userData.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Email Verification</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    userData.emailVerify ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userData.emailVerify ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Account Verification</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    userData.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userData.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {userData.createdAt && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Account Created
                    </label>
                    <p className="text-base text-gray-900">
                      {new Date(userData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Account Information */}
            {userData.BankAccountinfo && userData.BankAccountinfo.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BuildingIcon className="w-6 h-6 text-red-600" />
                  Bank Account Information
                </h3>
                <div className="space-y-4">
                  {userData.BankAccountinfo.map((account, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCardIcon className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-gray-800">Account #{index + 1}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bank Name</label>
                          <p className="text-sm text-gray-900 font-medium">{account.bankName || "N/A"}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Account Name</label>
                          <p className="text-sm text-gray-900 font-medium">{account.accountName || "N/A"}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Account Number</label>
                          <p className="text-sm text-gray-900 font-mono">{account.accountNumber || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Bank Accounts Message */}
            {(!userData.BankAccountinfo || userData.BankAccountinfo.length === 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BuildingIcon className="w-6 h-6 text-red-600" />
                  Bank Account Information
                </h3>
                <div className="text-center py-8">
                  <BuildingIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No bank accounts added yet</p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                  >
                    Add Bank Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
