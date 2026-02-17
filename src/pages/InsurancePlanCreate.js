import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { API_BASE_URL, getAuthToken } from '../config/api';

const POLICY_TYPES = ['Life', 'Health', 'Motor', 'Travel', 'Property', 'Takaful'];

const defaultPolicyBlock = (policyType) => {
  const base = { paymentFrequency: 'Monthly' };
  switch (policyType) {
    case 'Life':
      return { ...base, planSubType: 'Term', sumAssured: '', premiumAmount: '', premiumPaymentTerm: '' };
    case 'Health':
      return { ...base, annualPremium: '', annualCoverageLimit: '' };
    case 'Motor':
      return { ...base, motorType: 'Car', annualPremium: '' };
    case 'Travel':
      return { ...base, premiumAmount: '', tripDurationDays: '' };
    case 'Property':
      return { ...base, premiumAmount: '', coverageAmount: '' };
    case 'Takaful':
      return { ...base, contributionAmount: '', sumCovered: '' };
    default:
      return base;
  }
};

const InsurancePlanCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({ productBrochure: false, policyWording: false });
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    policyType: 'Life',
    planStatus: 'Active',
    planImage: '',
    policyTerm: '',
    eligibleAge: { min: '', max: '' },
    lifeInsurancePlan: defaultPolicyBlock('Life'),
    healthInsurancePlan: defaultPolicyBlock('Health'),
    motorInsurancePlan: defaultPolicyBlock('Motor'),
    travelInsurancePlan: defaultPolicyBlock('Travel'),
    propertyInsurancePlan: defaultPolicyBlock('Property'),
    takafulPlan: defaultPolicyBlock('Takaful'),
    planDocuments: {
      productBrochure: '',
      policyWording: '',
    },
    authorization: {
      authorizationToList: false,
      confirmationOfAccuracy: false,
      consentForLeadSharing: false,
    },
    tags: [],
  });

  const policyKey = formData.policyType === 'Takaful'
    ? 'takafulPlan'
    : `${formData.policyType.charAt(0).toLowerCase() + formData.policyType.slice(1)}InsurancePlan`;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    const num = e.target.type === 'number' && value !== '' ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      [policyKey]: {
        ...prev[policyKey],
        [name]: num,
      },
    }));
  };

  const handleAuthChange = (key) => (e) => {
    setFormData((prev) => ({
      ...prev,
      authorization: { ...prev.authorization, [key]: e.target.checked },
    }));
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setUploadingDoc((prev) => ({ ...prev, [docType]: true }));
    try {
      const fd = new FormData();
      fd.append('document', file);
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/upload-document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          planDocuments: { ...prev.planDocuments, [docType]: data.url },
        }));
        toast.success('Document uploaded');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadingDoc((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const validate = () => {
    if (!formData.planName.trim()) {
      toast.error('Plan name is required');
      return false;
    }
    if (!formData.policyType) {
      toast.error('Policy type is required');
      return false;
    }
    if (!formData.planDocuments?.productBrochure) {
      toast.error('Product brochure document is required');
      return false;
    }
    if (!formData.planDocuments?.policyWording) {
      toast.error('Policy wording document is required');
      return false;
    }
    const auth = formData.authorization;
    if (!auth?.authorizationToList || !auth?.confirmationOfAccuracy || !auth?.consentForLeadSharing) {
      toast.error('Please accept all authorizations');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const payload = {
        planName: formData.planName.trim(),
        description: formData.description.trim() || undefined,
        policyType: formData.policyType,
        planStatus: formData.planStatus,
        planImage: formData.planImage || undefined,
        policyTerm: formData.policyTerm || undefined,
        eligibleAge: formData.eligibleAge,
        planDocuments: formData.planDocuments,
        authorization: formData.authorization,
        tags: formData.tags || [],
        [policyKey]: formData[policyKey],
      };
      const res = await fetch(`${API_BASE_URL}/createInsurancePlan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Insurance plan created successfully');
        navigate('/insurance/list');
      } else {
        toast.error(data.message || 'Failed to create plan');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;
  const canNext = step < totalSteps;
  const canPrev = step > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/insurance/list')}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
          >
            ← Back to plans
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Insurance Plan</h1>
          <p className="text-gray-600 text-sm mt-1">Step {step} of {totalSteps}</p>
        </div>

        <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); setStep((s) => s + 1); }} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Name *</label>
                <input
                  name="planName"
                  value={formData.planName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. Family Protection Plan"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Brief description of the plan"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Policy Type *</label>
                <select
                  name="policyType"
                  value={formData.policyType}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      [policyKey]: defaultPolicyBlock(e.target.value),
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {POLICY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Status</label>
                <select
                  name="planStatus"
                  value={formData.planStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Limited">Limited</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900">{formData.policyType} plan details</h3>
              {formData.policyType === 'Life' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan sub-type</label>
                    <select
                      name="planSubType"
                      value={formData.lifeInsurancePlan?.planSubType}
                      onChange={handlePolicyChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Term">Term</option>
                      <option value="Endowment">Endowment</option>
                      <option value="Whole Life">Whole Life</option>
                      <option value="ULIP">ULIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sum assured (PKR)</label>
                    <input type="number" name="sumAssured" value={formData.lifeInsurancePlan?.sumAssured || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. 5000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Premium amount (PKR)</label>
                    <input type="number" name="premiumAmount" value={formData.lifeInsurancePlan?.premiumAmount || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. 5000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Premium payment term (years)</label>
                    <input type="number" name="premiumPaymentTerm" value={formData.lifeInsurancePlan?.premiumPaymentTerm || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g. 10" />
                  </div>
                </div>
              )}
              {(formData.policyType === 'Health' || formData.policyType === 'Motor') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual premium (PKR)</label>
                    <input type="number" name="annualPremium" value={formData[policyKey]?.annualPremium || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  {formData.policyType === 'Health' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual coverage limit (PKR)</label>
                      <input type="number" name="annualCoverageLimit" value={formData.healthInsurancePlan?.annualCoverageLimit || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  )}
                </div>
              )}
              {(formData.policyType === 'Travel' || formData.policyType === 'Property') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Premium amount (PKR)</label>
                    <input type="number" name="premiumAmount" value={formData[policyKey]?.premiumAmount || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  {formData.policyType === 'Property' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coverage amount (PKR)</label>
                      <input type="number" name="coverageAmount" value={formData.propertyInsurancePlan?.coverageAmount || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  )}
                </div>
              )}
              {formData.policyType === 'Takaful' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contribution amount (PKR)</label>
                    <input type="number" name="contributionAmount" value={formData.takafulPlan?.contributionAmount || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sum covered (PKR)</label>
                    <input type="number" name="sumCovered" value={formData.takafulPlan?.sumCovered || ''} onChange={handlePolicyChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900">Required documents</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product brochure (PDF) *</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleDocUpload(e, 'productBrochure')} className="w-full text-sm text-gray-600" />
                  {uploadingDoc.productBrochure && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                  {formData.planDocuments?.productBrochure && <p className="text-sm text-green-600 mt-1">Uploaded</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy wording (PDF) *</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleDocUpload(e, 'policyWording')} className="w-full text-sm text-gray-600" />
                  {uploadingDoc.policyWording && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                  {formData.planDocuments?.policyWording && <p className="text-sm text-green-600 mt-1">Uploaded</p>}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900">Authorization</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.authorization?.authorizationToList || false} onChange={handleAuthChange('authorizationToList')} className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">I authorize Madadgaar to list this plan on the platform.</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.authorization?.confirmationOfAccuracy || false} onChange={handleAuthChange('confirmationOfAccuracy')} className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">I confirm the information provided is accurate.</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.authorization?.consentForLeadSharing || false} onChange={handleAuthChange('consentForLeadSharing')} className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">I consent to lead sharing as per platform terms.</span>
                </label>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={!canPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {canNext ? (
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                Next
              </button>
            ) : (
              <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create plan'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsurancePlanCreate;
