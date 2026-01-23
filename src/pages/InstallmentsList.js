import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getUserInstallments, deleteInstallmentPlan } from '../services/installmentService';
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

    useEffect(() => {
        fetchInstallments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInstallments = async () => {
        setLoading(true);
        try {
            // Get installments created by this agent
            const response = await getUserInstallments(user?.userId || "", {
                page: 1,
                limit: 100
            });
            if (response.success) {
                setInstallments(response.data || []);
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-red-50 to-white space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">Loading installment plans...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
            <Navbar />
            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-primary-dark rounded-3xl shadow-2xl p-8">
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
                            className="px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-red-50 transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
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
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent focus:border-primary outline-none"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent focus:border-primary outline-none"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-primary p-5 rounded-xl shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    <p className="text-xl font-black bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">PKR {item.price?.toLocaleString()}</p>
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
                                            <span className="font-bold text-primary">{item.paymentPlans[0].tenureMonths} months</span>
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

                            <div className="pt-3 flex gap-3">
                                <button 
                                    onClick={() => navigate(`/installments/edit/${item._id}`)}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl text-sm font-bold hover:from-primary-dark hover:to-primary-darker transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(item._id || item.installmentPlanId)}
                                    className="px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:text-primary rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-primary active:scale-95 shadow-sm"
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
                        className="mt-4 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all"
                    >
                        Create Your First Plan
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};

export default InstallmentsList;
