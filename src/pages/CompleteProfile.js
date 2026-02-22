import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUserById, updateUser } from "../services/authService";
import { API_BASE_URL, getAuthToken } from "../config/api";

const CompleteProfile = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: "",
    WhatsappNumber: "",
    Address: "",
    cnicNumber: "",
    idCardPic: "",
    BankAccountinfo: [],
  });

  const [newBank, setNewBank] = useState({ accountNumber: "", accountName: "", bankName: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getUserById();
        if (mounted && res.success && res.user) {
          const u = res.user;
          setFormData({
            phoneNumber: u.phoneNumber || "",
            WhatsappNumber: u.WhatsappNumber || "",
            Address: u.Address || "",
            cnicNumber: u.cnicNumber && u.cnicNumber !== "123-456-789" ? u.cnicNumber : "",
            idCardPic: u.idCardPic || "",
            BankAccountinfo: Array.isArray(u.BankAccountinfo) ? u.BankAccountinfo : [],
          });
        }
      } catch (e) {
        toast.error("Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      toast.error("Upload failed");
    } finally {
      setUploadingIdCard(false);
    }
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setNewBank((prev) => ({ ...prev, [name]: value }));
  };

  const addBank = () => {
    if (!newBank.accountNumber?.trim() || !newBank.accountName?.trim() || !newBank.bankName?.trim()) {
      toast.error("Fill all bank fields");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      BankAccountinfo: [...prev.BankAccountinfo, { ...newBank }],
    }));
    setNewBank({ accountNumber: "", accountName: "", bankName: "" });
    toast.success("Bank account added");
  };

  const removeBank = (index) => {
    setFormData((prev) => ({
      ...prev,
      BankAccountinfo: prev.BankAccountinfo.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trim = (s) => (typeof s === "string" ? s.trim() : "");
    if (!trim(formData.phoneNumber)) {
      toast.error("Phone number is required");
      return;
    }
    if (!trim(formData.WhatsappNumber)) {
      toast.error("WhatsApp number is required");
      return;
    }
    if (!trim(formData.Address)) {
      toast.error("Address is required");
      return;
    }
    if (!trim(formData.cnicNumber)) {
      toast.error("CNIC number is required");
      return;
    }
    if (!trim(formData.idCardPic)) {
      toast.error("ID card image is required");
      return;
    }
    if (!formData.BankAccountinfo.length) {
      toast.error("Add at least one bank account");
      return;
    }
    setSaving(true);
    try {
      const updates = {
        phoneNumber: formData.phoneNumber,
        WhatsappNumber: formData.WhatsappNumber,
        Address: formData.Address,
        cnicNumber: formData.cnicNumber,
        idCardPic: formData.idCardPic,
        BankAccountinfo: formData.BankAccountinfo,
      };
      const res = await updateUser(user?.userId, updates);
      if (res.success) {
        toast.success("Profile completed");
        await fetchUser();
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(res.message || "Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-primary/10 px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Complete your profile</h1>
            <p className="text-sm text-gray-600 mt-1">
              Add your contact details, CNIC, ID card, and bank account so we can verify and activate your agent account.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="03XX-XXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="WhatsappNumber"
                value={formData.WhatsappNumber}
                onChange={handleChange}
                placeholder="03XX-XXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                rows={3}
                placeholder="Full address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">CNIC number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="cnicNumber"
                value={formData.cnicNumber}
                onChange={handleChange}
                placeholder="XXXXX-XXXXXXX-X"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ID card picture <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-4">
                {formData.idCardPic ? (
                  <div className="relative">
                    <img src={formData.idCardPic} alt="ID card" className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, idCardPic: "" }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleIdCardUpload} className="hidden" disabled={uploadingIdCard} />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90">
                    {uploadingIdCard ? "Uploading..." : formData.idCardPic ? "Change" : "Upload ID card"}
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank account <span className="text-red-500">*</span> (at least one)</label>
              {formData.BankAccountinfo.map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                  <span className="text-sm font-medium">{acc.bankName} – {acc.accountName}</span>
                  <button type="button" onClick={() => removeBank(i)} className="text-red-600 text-sm font-medium">Remove</button>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <input
                  type="text"
                  name="bankName"
                  value={newBank.bankName}
                  onChange={handleBankChange}
                  placeholder="Bank name"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  name="accountName"
                  value={newBank.accountName}
                  onChange={handleBankChange}
                  placeholder="Account name"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  name="accountNumber"
                  value={newBank.accountNumber}
                  onChange={handleBankChange}
                  placeholder="Account number"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button type="button" onClick={addBank} className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                Add bank account
              </button>
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save and continue"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Edit full profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
