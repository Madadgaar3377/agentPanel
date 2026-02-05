import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPropertyById } from '../services/propertyService';
import Navbar from '../components/Navbar';

const PropertyView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProperty = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPropertyById(id);
            if (response.success) {
                setProperty(response.property || response.data);
            } else {
                toast.error(response.message || 'Failed to load property');
            }
        } catch (err) {
            toast.error('Failed to load property');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProperty();
    }, [fetchProperty]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary/20 rounded-full mx-auto"></div>
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 -translate-x-1/2"></div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-gray-600">Loading property details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-gray-600 text-lg mb-4">Property not found</p>
                        <button
                            onClick={() => navigate('/property/list')}
                            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-bold"
                        >
                            Back to Properties
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const propertyData = property.type === 'Project' ? property.project : property.individualProperty;
    const propertyId = property.type === 'Project' 
        ? property.project?.propertyId 
        : property.individualProperty?.propertyId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/property/list')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-semibold group"
                >
                    <svg 
                        className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Properties</span>
                </button>

                {/* Property Header */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                {property.type === 'Project' 
                                    ? propertyData?.projectName 
                                    : propertyData?.title}
                            </h2>
                            <p className="text-gray-600">
                                {property.type === 'Project' 
                                    ? `${propertyData?.area || ''}, ${propertyData?.city || ''}`.trim()
                                    : `${propertyData?.location || ''}, ${propertyData?.city || ''}`.trim()}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                            property.type === 'Project' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                        }`}>
                            {property.type}
                        </span>
                    </div>
                </div>

                {/* Property Details */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 mb-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Property Details</h3>
                    
                    {property.type === 'Project' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Type</p>
                                <p className="font-black text-gray-900 text-lg">{propertyData?.projectType || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</p>
                                <p className="font-black text-gray-900 text-lg">{propertyData?.city || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Land Area</p>
                                <p className="font-black text-gray-900 text-lg">{propertyData?.totalLandArea || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Units</p>
                                <p className="font-black text-gray-900 text-lg">{propertyData?.totalUnits || 'N/A'}</p>
                            </div>
                            {propertyData?.transaction?.price && (
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 md:col-span-2">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Price</p>
                                    <p className="font-black text-primary text-2xl">PKR {propertyData.transaction.price.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 mt-1">For {propertyData.transaction.type || 'Sale'}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Property Type</p>
                                <p className="font-black text-gray-900 text-lg">{propertyData?.propertyType || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</p>
                                <p className="font-black text-gray-900 text-lg">{propertyData?.city || 'N/A'}</p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area Size</p>
                                <p className="font-black text-gray-900 text-lg">
                                    {propertyData?.areaSize || 'N/A'} {propertyData?.areaUnit || ''}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bedrooms & Bathrooms</p>
                                <p className="font-black text-gray-900 text-lg">
                                    {propertyData?.bedrooms || 0} Bed • {propertyData?.bathrooms || 0} Bath
                                </p>
                            </div>
                            {propertyData?.transaction?.price && (
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 md:col-span-2">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Price</p>
                                    <p className="font-black text-primary text-2xl">PKR {propertyData.transaction.price.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 mt-1">For {propertyData.transaction.type || 'Sale'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {propertyData?.description && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                            <p className="text-gray-800 leading-relaxed">{propertyData.description}</p>
                        </div>
                    )}
                </div>

                {/* Images */}
                {propertyData?.images && propertyData.images.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {propertyData.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                    <img 
                                        src={img} 
                                        alt={`Property ${idx + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => navigate(`/property/edit/${propertyId || id}`)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold hover:from-primary-dark hover:to-primary-darker transition-all shadow-lg"
                    >
                        Edit Property
                    </button>
                    <button
                        onClick={() => navigate('/property/list')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyView;
