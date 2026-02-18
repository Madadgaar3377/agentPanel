import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/authService";
import { getAgentDashboard } from "../services/agentService";
import { createWithdrawalRequest, getMyWithdrawalRequests } from "../services/agentService";
import Navbar from "../components/Navbar";

const Wallet = () => {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    bankAccountIndex: 0,
    note: "",
  });

  const bankAccounts = profile?.BankAccountinfo || user?.BankAccountinfo || [];
  const hasBankAccounts = Array.isArray(bankAccounts) && bankAccounts.length > 0;

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [profileRes, dashboardRes, requestsRes] = await Promise.all([
        getUserById(),
        getAgentDashboard(),
        getMyWithdrawalRequests(),
      ]);
      if (profileRes?.success && profileRes?.user) {
        setProfile(profileRes.user);
      }
      if (dashboardRes?.success && dashboardRes?.data) {
        const info = dashboardRes.data?.agentInfo || dashboardRes.data;
        const raw = info?.walletBalance ?? user?.walletBalance ?? 0;
        setWalletBalance(Number(raw) || 0);
      }
      if (requestsRes?.success && Array.isArray(requestsRes.data)) {
        setRequests(requestsRes.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load wallet data");
      setWalletBalance(Number(user?.walletBalance) || 0);
      if (user?.BankAccountinfo) setProfile(user);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasBankAccounts) {
      toast.error("Add a bank account in Profile first.");
      return;
    }
    const amount = Number(form.amount);
    if (!amount || amount < 1) {
      toast.error("Enter a valid amount (min 1).");
      return;
    }
    if (amount > walletBalance) {
      toast.error(`Insufficient balance. Available: PKR ${walletBalance.toLocaleString()}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await createWithdrawalRequest({
        amount,
        note: form.note.trim() || undefined,
        bankAccountIndex: form.bankAccountIndex,
      });
      if (res?.success) {
        toast.success(res.message || "Withdrawal request submitted.");
        setForm({ amount: "", bankAccountIndex: 0, note: "" });
        fetchData();
        fetchUser(true);
      } else {
        toast.error(res?.message || "Request failed.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequest = requests.find((r) => r.status === "pending");
  const balanceNum = Number(walletBalance);
  const walletDisplay = Number.isFinite(balanceNum) ? balanceNum.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0";

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Wallet & Withdraw</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-6">Request withdrawal to your bank account. Admin will review and approve.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600" />
          </div>
        ) : (
          <>
            {/* Balance card */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-6">
              <p className="text-red-100 text-sm font-medium mb-1">Available Balance</p>
              <p className="text-2xl sm:text-3xl font-bold">PKR {walletDisplay}</p>
            </div>

            {/* Request form */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">New withdrawal request</h3>
              {!hasBankAccounts ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800">
                  <p className="font-medium">No bank account added</p>
                  <p className="text-sm mt-1">Add at least one bank account in your Profile to request withdrawals.</p>
                  <Link to="/profile" className="inline-block mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition">
                    Go to Profile
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                    <input
                      type="number"
                      min="1"
                      max={walletBalance}
                      step="1"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max: PKR {walletDisplay}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank account</label>
                    <select
                      value={form.bankAccountIndex}
                      onChange={(e) => setForm((f) => ({ ...f, bankAccountIndex: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {bankAccounts.map((acc, idx) => (
                        <option key={idx} value={idx}>
                          {acc.bankName || "Bank"} - {acc.accountName || "Account"} (***{String(acc.accountNumber || "").slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g. Urgent"
                    />
                  </div>
                  {pendingRequest && (
                    <p className="text-amber-600 text-sm">You have a pending request (PKR {Number(pendingRequest.amount).toLocaleString()}). Wait for admin to approve or reject.</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !!pendingRequest || balanceNum < 1}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                  >
                    {submitting ? "Submitting..." : "Submit request"}
                  </button>
                </form>
              )}
            </div>

            {/* My requests */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My withdrawal requests</h3>
              {requests.length === 0 ? (
                <p className="text-gray-500 text-sm">No withdrawal requests yet.</p>
              ) : (
                <ul className="space-y-3">
                  {requests.map((r) => (
                    <li
                      key={r._id}
                      className="border border-gray-200 rounded-lg p-4 flex flex-wrap justify-between items-start gap-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">PKR {Number(r.amount).toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {r.bankName && `${r.bankName}`}
                          {r.bankAccountName && ` · ${r.bankAccountName}`}
                          {r.bankAccountNumber && ` · ***${String(r.bankAccountNumber).slice(-4)}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : r.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;
