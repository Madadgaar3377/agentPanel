import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getAllInstallments, deleteInstallmentPlan } from '../services/installmentService';
import Navbar from '../components/Navbar';

const InstallmentsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingInstallment, setViewingInstallment] = useState(null);

    useEffect(() => {
        fetchInstallments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInstallments = async () => {
        setLoading(true);
        try {
            // Get all installments and filter by createdBy (for agents who created them)
            const response = await getAllInstallments({
                page: 1,
                limit: 1000 // Get a large number to filter on frontend
            });
            if (response.success) {
                // Filter installments created by this agent
                const agentInstallments = (response.data || []).filter(item => {
                    // Check if createdBy array contains this agent's userId
                    if (item.createdBy && Array.isArray(item.createdBy)) {
                        return item.createdBy.some(creator => creator.userId === user?.userId);
                    }
                    // Fallback: check if createdBy is a string (old format)
                    return item.createdBy === user?.userId;
                });
                setInstallments(agentInstallments);
            } else {
                setError(response.message);
                toast.error(response.message || "Failed to load installments");
            }
        } catch (err) {
            setError("Failed to connect to server");
            toast.error("Failed to load installments");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this installment plan?")) {
            return;
        }
        try {
            const response = await deleteInstallmentPlan(id, false);
            if (response.success) {
                toast.success("Installment plan deleted successfully");
                fetchInstallments();
            } else {
                toast.error(response.message || "Failed to delete");
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete");
        }
    };

    const openViewModal = (installment) => {
        setViewingInstallment(installment);
        setShowViewModal(true);
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

    const filteredData = installments.filter(item => {
        const matchesSearch = item.productName?.toLowerCase().includes(search.toLowerCase()) ||
            item.companyName?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = ["All", ...new Set(installments.map(i => i.category).filter(Boolean))];
    const statuses = ["All", "pending", "approved", "active", "inactive"];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 space-y-4">
            <Navbar />
            <div className="relative">
                <div className="w-16 h-16 border-4 border-red-600/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">Loading installment plans...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <Navbar />
            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-3xl shadow-2xl p-8">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">My Installment Plans</h1>
                            <p className="text-red-100 text-sm font-medium mt-0.5">Manage your installment plans</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate('/installments/create')} 
                            className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Plan
                        </button>
                        <button 
                            onClick={fetchInstallments} 
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search by product or brand..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-2 border-gray-200 focus:border-red-500 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent focus:border-red-500 outline-none"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent focus:border-red-500 outline-none"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-5 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
            )}

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {filteredData.map((item) => (
                    <div key={item._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105">
                        {/* Image */}
                        <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                            {item.productImages?.[0] ? (
                                <img src={item.productImages[0]} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-xs font-bold text-gray-900 shadow-lg border border-gray-200">
                                {item.category || "Uncategorized"}
                            </div>
                            <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                                item.status === 'approved' 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                    : item.status === 'pending'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                            }`}>
                                {item.status === 'approved' ? '✓ Approved' : item.status === 'pending' ? '⏳ Pending' : item.status || 'Unknown'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 line-clamp-1">{item.productName}</h3>
                                <p className="text-sm text-gray-600 mt-1 font-medium">{item.companyName} • {item.city}</p>
                            </div>

                            <div className="flex justify-between items-end pb-4 border-b-2 border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wide">Price</p>
                                    <p className="text-xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">PKR {item.price?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wide">Plans</p>
                                    <p className="text-xl font-black text-gray-900">{item.paymentPlans?.length || 0}</p>
                                </div>
                            </div>

                            {/* Plan Preview */}
                            {item.paymentPlans?.length > 0 && (
                                <div className="space-y-2">
                                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm">
                                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                                            <span className="font-bold">{item.paymentPlans[0].planName}</span>
                                            <span className="font-bold text-red-600">{item.paymentPlans[0].tenureMonths} months</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Monthly</span>
                                            <span className="text-base font-black text-gray-900">PKR {item.paymentPlans[0].monthlyInstallment?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {item.paymentPlans.length > 1 && (
                                        <p className="text-xs text-gray-500 text-center font-bold">+ {item.paymentPlans.length - 1} more plan{item.paymentPlans.length > 2 ? 's' : ''}</p>
                                    )}
                                </div>
                            )}

                            <div className="pt-3 flex gap-2">
                                <button 
                                    onClick={() => openViewModal(item)}
                                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                </button>
                                <button 
                                    onClick={() => navigate(`/installments/edit/${item._id}`)}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-200 active:scale-95"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(item._id || item.installmentPlanId)}
                                    className="px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-red-600 active:scale-95 shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredData.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Plans Found</h3>
                    <p className="text-sm text-gray-500 mt-1">No installment plans match your search criteria.</p>
                    <button 
                        onClick={() => navigate('/installments/create')}
                        className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all"
                    >
                        Create Your First Plan
                    </button>
                </div>
            )}

            {/* View Details Modal */}
            {showViewModal && viewingInstallment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 animate-scaleIn max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">Installment Plan Details</h3>
                                    <p className="text-red-100 text-sm">Complete plan information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingInstallment(null);
                                }}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Product Overview */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                                <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Product Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name</p>
                                        <p className="text-base font-black text-gray-900">{viewingInstallment.productName || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</p>
                                        <p className="text-base font-black text-gray-900">{viewingInstallment.companyName || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                                        <p className="text-base font-black text-gray-900 capitalize">{viewingInstallment.category || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Price</p>
                                        <p className="text-2xl font-black text-red-700">
                                            PKR {(viewingInstallment.price || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</p>
                                        <p className="text-base font-black text-gray-900">{viewingInstallment.city || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                                            viewingInstallment.status === 'approved' 
                                                ? 'bg-green-100 text-green-800' 
                                                : viewingInstallment.status === 'pending'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {viewingInstallment.status?.toUpperCase() || 'N/A'}
                                        </span>
                                    </div>
                                    {viewingInstallment.description && (
                                        <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                                            <p className="text-sm font-medium text-gray-900 leading-relaxed">{viewingInstallment.description}</p>
                                        </div>
                                    )}
                                    {viewingInstallment.productImages && viewingInstallment.productImages.length > 0 && (
                                        <div className="md:col-span-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Product Images</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {viewingInstallment.productImages.map((img, idx) => (
                                                    <img key={idx} src={img} alt={`Product ${idx + 1}`} className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 shadow-md" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* All Payment Plans */}
                            {viewingInstallment.paymentPlans && viewingInstallment.paymentPlans.length > 0 && (
                                <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                                            <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-gray-900">All Payment Plans</h4>
                                            <p className="text-sm text-gray-500 mt-1">Complete pricing breakdown for each plan</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {viewingInstallment.paymentPlans.map((plan, idx) => (
                                            <div 
                                                key={idx} 
                                                className="rounded-2xl p-6 border-2 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                                            >
                                                <div className="mb-4">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Plan Name</p>
                                                    <p className="text-xl font-black text-gray-900">{plan.planName || `Plan ${idx + 1}`}</p>
                                                </div>

                                                {/* Summary Section - Same as Creation Form */}
                                                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 bg-white/50 p-4 rounded-2xl border border-gray-200">
                                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 border-2 border-red-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly Installment (EMI)</p>
                                                        <p className="text-lg font-black text-red-700">
                                                            PKR {(plan.monthlyInstallment || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Markup Amount</p>
                                                        <p className="text-base font-black text-gray-900">
                                                            PKR {(plan.markup || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Payable</p>
                                                        <p className="text-base font-black text-gray-900">
                                                            PKR {(plan.installmentPrice || plan.totalPayable || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Cost to Customer</p>
                                                        <p className="text-lg font-black text-green-700">
                                                            PKR {(plan.totalCostToCustomer || plan.totalCost || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-gray-200">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Financed Amount</p>
                                                        <p className="text-base font-black text-gray-900">
                                                            PKR {Math.max(0, ((viewingInstallment.price || 0) - (plan.downPayment || 0))).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Detailed Information */}
                                                <div className="mt-4 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Down Payment</p>
                                                            <p className="text-lg font-black text-gray-900">
                                                                PKR {(plan.downPayment || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tenure</p>
                                                            <p className="text-lg font-black text-gray-900">{(plan.tenureMonths || plan.tenure || 0)} months</p>
                                                        </div>
                                                        {(plan.interestRatePercent || plan.interestRate) && (
                                                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Interest Rate</p>
                                                                <p className="text-lg font-black text-gray-900">
                                                                    {plan.interestRatePercent || plan.interestRate || "0"}%
                                                                    {plan.interestType && <span className="text-sm font-normal text-gray-600"> ({plan.interestType})</span>}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {plan.finance && (plan.finance.bankName || plan.finance.financeInfo) && (
                                                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 mt-3">
                                                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                Finance Information
                                                            </p>
                                                            {plan.finance.bankName && (
                                                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                                                    Bank: <span className="font-normal">{plan.finance.bankName}</span>
                                                                </p>
                                                            )}
                                                            {plan.finance.financeInfo && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Details</p>
                                                                    <div 
                                                                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                                                                        dangerouslySetInnerHTML={{ __html: plan.finance.financeInfo }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {plan.otherChargesNote && (
                                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Other Charges</p>
                                                            <p className="text-sm font-medium text-gray-700">{plan.otherChargesNote}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Plan Information */}
                            {(!viewingInstallment.paymentPlans || viewingInstallment.paymentPlans.length === 0) && (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                                    <p className="text-sm font-medium text-yellow-800">No payment plans available for this installment plan.</p>
                                </div>
                            )}

                            {/* Additional Information */}
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Additional Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {viewingInstallment.installmentPlanId && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Plan ID</p>
                                            <p className="text-sm font-mono font-black text-gray-900">{viewingInstallment.installmentPlanId}</p>
                                        </div>
                                    )}
                                    {viewingInstallment.createdAt && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                                            <p className="text-sm font-semibold text-gray-900">{formatDate(viewingInstallment.createdAt)}</p>
                                        </div>
                                    )}
                                    {viewingInstallment.updatedAt && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                                            <p className="text-sm font-semibold text-gray-900">{formatDate(viewingInstallment.updatedAt)}</p>
                                        </div>
                                    )}
                                    {viewingInstallment.postedBy && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Posted By</p>
                                            <p className="text-sm font-semibold text-gray-900">{viewingInstallment.postedBy}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingInstallment(null);
                                }}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-all active:scale-95"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setViewingInstallment(null);
                                    navigate(`/installments/edit/${viewingInstallment._id}`);
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-sm hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                            >
                                Edit Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default InstallmentsList;
