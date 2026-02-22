import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateUser } from "../services/authService";
import { API_BASE_URL, getAuthToken } from "../config/api";
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
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const SaveIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    phoneNumber: "",
    WhatsappNumber: "",
    Address: "",
    profilePic: "",
    cnicNumber: "",
    idCardPic: "",
    BankAccountinfo: [],
  });

  const [newBankAccount, setNewBankAccount] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserById();
      if (response.success) {
        const userData = response.user || response.data || user;
        setFormData({
          name: userData.name || "",
          userName: userData.userName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          WhatsappNumber: userData.WhatsappNumber || "",
          Address: userData.Address || "",
          profilePic: userData.profilePic || "",
          cnicNumber: userData.cnicNumber || "",
          idCardPic: userData.idCardPic || "",
          BankAccountinfo: userData.BankAccountinfo || [],
        });
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (res.ok && (data.imageUrl || data.url || data.data?.url || data.data)) {
        const imageUrl = data.imageUrl || data.url || data.data?.url || data.data;
        setFormData((prev) => ({ ...prev, profilePic: imageUrl }));
        toast.success("Profile picture uploaded successfully");
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch (err) {
      toast.error("Failed to upload image");
      console.error("Image upload error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBankAccountChange = (e) => {
    const { name, value } = e.target;
    setNewBankAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBankAccount = () => {
    if (!newBankAccount.accountNumber || !newBankAccount.accountName || !newBankAccount.bankName) {
      toast.error("Please fill in all bank account fields");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      BankAccountinfo: [...prev.BankAccountinfo, { ...newBankAccount }],
    }));

    setNewBankAccount({
      accountNumber: "",
      accountName: "",
      bankName: "",
    });

    toast.success("Bank account added");
  };

  const handleRemoveBankAccount = (index) => {
    setFormData((prev) => ({
      ...prev,
      BankAccountinfo: prev.BankAccountinfo.filter((_, i) => i !== index),
    }));
    toast.success("Bank account removed");
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploadingIdCard(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (res.ok && (data.imageUrl || data.url || data.data?.url || data.data)) {
        const url = data.imageUrl || data.url || data.data?.url || data.data;
        setFormData((prev) => ({ ...prev, idCardPic: url }));
        toast.success("ID card image uploaded");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Failed to upload");
    } finally {
      setUploadingIdCard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        name: formData.name,
        userName: formData.userName,
        phoneNumber: formData.phoneNumber,
        WhatsappNumber: formData.WhatsappNumber,
        Address: formData.Address,
        profilePic: formData.profilePic,
        cnicNumber: formData.cnicNumber,
        idCardPic: formData.idCardPic,
        BankAccountinfo: formData.BankAccountinfo,
      };

      const response = await updateUser(user?.userId, updates);
      if (response.success) {
        toast.success("Profile updated successfully");
        await fetchUser(); // Refresh user data in context
        setTimeout(() => {
          navigate("/profile/view");
        }, 1500);
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="text-gray-600 mt-1">Update your information and add bank account details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Picture</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {formData.profilePic ? (
                  <img
                    src={formData.profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-red-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 border-4 border-red-100 flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-red-600" />
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <div className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : formData.profilePic ? "Change Photo" : "Upload Photo"}
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="03XX-XXXXXXX"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="WhatsappNumber"
                    value={formData.WhatsappNumber}
                    onChange={handleInputChange}
                    placeholder="03XX-XXXXXXX"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC Number</label>
                <input
                  type="text"
                  name="cnicNumber"
                  value={formData.cnicNumber}
                  onChange={handleInputChange}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter your complete address"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">ID card picture</label>
                <div className="flex items-center gap-4">
                  {formData.idCardPic ? (
                    <div className="relative">
                      <img src={formData.idCardPic} alt="ID card" className="h-20 w-auto rounded-lg border-2 border-gray-200 object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, idCardPic: "" }))}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleIdCardUpload} className="hidden" disabled={uploadingIdCard} />
                    <div className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium inline-flex items-center gap-2">
                      {uploadingIdCard ? "Uploading..." : formData.idCardPic ? "Change ID card" : "Upload ID card"}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for agent verification. JPG/PNG, max 5MB</p>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BuildingIcon className="w-6 h-6 text-red-600" />
              Bank Account Information
            </h3>

            {/* Existing Bank Accounts */}
            {formData.BankAccountinfo.length > 0 && (
              <div className="space-y-4 mb-6">
                {formData.BankAccountinfo.map((account, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{account.bankName}</p>
                      <p className="text-sm text-gray-600">{account.accountName}</p>
                      <p className="text-xs text-gray-500 font-mono">{account.accountNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBankAccount(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Bank Account */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Bank Account</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={newBankAccount.bankName}
                    onChange={handleBankAccountChange}
                    placeholder="e.g., HBL, UBL"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Name</label>
                  <input
                    type="text"
                    name="accountName"
                    value={newBankAccount.accountName}
                    onChange={handleBankAccountChange}
                    placeholder="Account holder name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={newBankAccount.accountNumber}
                    onChange={handleBankAccountChange}
                    placeholder="Account number"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddBankAccount}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
              >
                    <PlusIcon className="w-5 h-5" />
                Add Bank Account
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile/view")}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
