import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/authService";
import { getAgentDashboard } from "../services/agentService";
import { getWithdrawalPreview, createWithdrawalRequest, getMyWithdrawalRequests } from "../services/agentService";
import { openWithdrawalInvoice, openWithdrawalInvoicesAll } from "../utils/withdrawalInvoice";
import Navbar from "../components/Navbar";

const Wallet = () => {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  // Fetch deduction preview when amount is valid
  useEffect(() => {
    const amount = Number(form.amount);
    if (!amount || amount < 1) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    getWithdrawalPreview(amount)
      .then((res) => {
        if (!cancelled && res?.success && res?.data) setPreview(res.data);
        else if (!cancelled) setPreview(null);
      })
      .catch(() => { if (!cancelled) setPreview(null); })
      .finally(() => { if (!cancelled) setPreviewLoading(false); });
    return () => { cancelled = true; };
  }, [form.amount]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <Navbar />
      <div className="page-container max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="section-title">Wallet & Withdraw</h1>
          <p className="section-subtitle">Request withdrawal to your bank account. Approved payments can be downloaded as an invoice.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="spinner h-10 w-10" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance card */}
            <div className="card mb-6 overflow-visible">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 sm:p-6 text-white rounded-t-xl">
                <p className="text-red-100 text-sm font-medium mb-1">Available Balance</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">PKR {walletDisplay}</p>
                <p className="text-red-100/90 text-xs mt-2">Available for withdrawal</p>
              </div>
            </div>

            {/* Request form */}
            <div className="card mb-6">
              <div className="card-body">
                <h2 className="section-title mb-4">New withdrawal request</h2>
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
                    <label className="input-label">Amount (PKR)</label>
                    <input
                      type="number"
                      min="1"
                      max={walletBalance}
                      step="1"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      className="input-field"
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max: PKR {walletDisplay}</p>
                    {previewLoading && (
                      <p className="text-xs text-gray-500 mt-1">Calculating deductions...</p>
                    )}
                    {preview && !previewLoading && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Deductions (taxes applied)</p>
                        {preview.deductions && preview.deductions.length > 0 ? (
                          <>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {preview.deductions.map((d, i) => (
                                <li key={i} className="flex justify-between">
                                  <span>{d.name}{d.percent ? ` (${d.percent}%)` : ""}</span>
                                  <span>{preview.currencyCode || "PKR"} {Number(d.amount).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-medium text-gray-800">
                              <span>Total deductions</span>
                              <span>{preview.currencyCode || "PKR"} {Number(preview.totalDeductions).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900">
                              <span>You will receive</span>
                              <span>{preview.currencyCode || "PKR"} {Number(preview.finalPayAmount).toLocaleString()}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600">No deductions. You will receive {preview.currencyCode || "PKR"} {Number(preview.requestedAmount).toLocaleString()}.</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="input-label">Bank account</label>
                    <select
                      value={form.bankAccountIndex}
                      onChange={(e) => setForm((f) => ({ ...f, bankAccountIndex: Number(e.target.value) }))}
                      className="input-field"
                    >
                      {bankAccounts.map((acc, idx) => (
                        <option key={idx} value={idx}>
                          {acc.bankName || "Bank"} - {acc.accountName || "Account"} (***{String(acc.accountNumber || "").slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Note (optional)</label>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. Urgent"
                    />
                  </div>
                  {pendingRequest && (
                    <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">You have a pending request (PKR {Number(pendingRequest.amount).toLocaleString()}). Wait for admin to approve or reject.</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !!pendingRequest || balanceNum < 1}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {submitting ? "Submitting..." : "Submit request"}
                  </button>
                </form>
              )}
              </div>
            </div>

            {/* My requests */}
            <div className="card">
              <div className="card-body">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="section-title mb-0">My withdrawal requests</h2>
                  {requests.filter((r) => r.status === "approved").length > 0 && (
                    <button
                      type="button"
                      onClick={() => openWithdrawalInvoicesAll(requests, { name: user?.name, email: user?.email, userId: user?.userId })}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white transition shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Download all invoices
                    </button>
                  )}
                </div>
                {requests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No withdrawal requests yet.</p>
                ) : (
                  <ul className="space-y-4">
                  {requests.map((r) => {
                    const b = r.deductionBreakdown;
                    const currency = b?.currencyCode || "PKR";
                    return (
                      <li
                        key={r._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap justify-between items-start gap-3 shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800">{currency} {Number(r.amount).toLocaleString()} requested</p>
                          {b && (
                            <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                              {b.deductions && b.deductions.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  Deductions: {b.deductions.map((d) => `${d.name} ${currency} ${Number(d.amount).toLocaleString()}`).join(", ")} → Total: {currency} {Number(b.totalDeductions).toLocaleString()}
                                </p>
                              )}
                              <p className="font-medium text-gray-800">
                                Final pay: {currency} {Number(b?.finalPayAmount ?? r.amount).toLocaleString()}
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {r.bankName && `${r.bankName}`}
                            {r.bankAccountName && ` · ${r.bankAccountName}`}
                            {r.bankAccountNumber && ` · ***${String(r.bankAccountNumber).slice(-4)}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
                          {r.status === "approved" && (
                            <button
                              type="button"
                              onClick={() => openWithdrawalInvoice(r, { name: user?.name, email: user?.email, userId: user?.userId })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white transition shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Download Invoice
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
