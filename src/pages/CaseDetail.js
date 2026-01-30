import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../config/api';
import axios from 'axios';

const CaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/getCase/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCaseData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching case details:', error);
      toast.error('Failed to fetch case details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.put(
        `${API_BASE_URL}/updateCaseStatus/${caseId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success('Case status updated successfully');
        fetchCaseDetails();
      }
    } catch (error) {
      console.error('Error updating case status:', error);
      toast.error('Failed to update case status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_BASE_URL}/addCaseNote/${caseId}`,
        { note, isInternal: false },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success('Note added successfully');
        setNote('');
        fetchCaseDetails();
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCase = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${API_BASE_URL}/rejectCase/${caseId}`,
        { rejectionReason: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success('Case rejected successfully');
        fetchCaseDetails();
      }
    } catch (error) {
      console.error('Error rejecting case:', error);
      toast.error('Failed to reject case');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Case not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/cases')}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Cases
            </button>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Case Details</h1>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium text-white ${
                  caseData.caseStatus === 'Closed'
                    ? 'bg-green-500'
                    : caseData.caseStatus === 'Rejected'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
              >
                {caseData.caseStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Case Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Case ID</p>
                    <p className="font-medium">{caseData.caseId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{caseData.caseCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sub-Category</p>
                    <p className="font-medium">{caseData.caseSubCategory || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="font-medium">{caseData.priority}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Product/Service</p>
                    <p className="font-medium">{caseData.productName}</p>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {caseData.clientName}</p>
                  <p><strong>Email:</strong> {caseData.clientEmail}</p>
                  <p><strong>Phone:</strong> {caseData.clientPhone || 'N/A'}</p>
                </div>
              </div>

              {/* Commission Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Commission Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Eligible Commission:</span>
                    <span className="text-xl font-bold text-green-600">
                      PKR {caseData.commissionInfo?.eligibleCommission?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium ${
                        caseData.commissionInfo?.commissionPayable === 'Paid'
                          ? 'text-green-600'
                          : caseData.commissionInfo?.commissionPayable === 'Pending'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {caseData.commissionInfo?.commissionPayable || 'N/A'}
                    </span>
                  </div>
                  {caseData.commissionInfo?.commissionBasis && (
                    <div className="pt-2 text-sm text-gray-600">
                      <p><strong>Basis:</strong> {caseData.commissionInfo.commissionBasis}</p>
                      <p><strong>Calculation:</strong> {caseData.commissionInfo.commissionCalculation}</p>
                    </div>
                  )}
                  {caseData.commissionInfo?.commissionLocked && (
                    <div className="bg-yellow-50 p-3 rounded-md text-sm">
                      <p className="font-medium text-yellow-800">Commission Locked</p>
                      <p className="text-yellow-700">
                        Locked at: {caseData.commissionInfo.lockStage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes & Activity</h2>
                
                {/* Add Note */}
                <div className="mb-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={actionLoading}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {caseData.notes && caseData.notes.length > 0 ? (
                    caseData.notes.map((noteItem, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-800">{noteItem.note}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>{noteItem.addedByName}</span> •{' '}
                          <span>{new Date(noteItem.addedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No notes yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="space-y-2">
                  {caseData.caseStatus === 'Received' && (
                    <button
                      onClick={() => handleUpdateStatus('In Progress')}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Start Working
                    </button>
                  )}
                  {caseData.caseStatus === 'In Progress' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('Verified')}
                        disabled={actionLoading}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                      >
                        Mark Verified
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('Closed')}
                        disabled={actionLoading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Close Case
                      </button>
                    </>
                  )}
                  {caseData.caseStatus === 'Verified' && (
                    <button
                      onClick={() => handleUpdateStatus('Closed')}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Close Case
                    </button>
                  )}
                  {!['Rejected', 'Closed'].includes(caseData.caseStatus) && (
                    <button
                      onClick={handleRejectCase}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Case
                    </button>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Assigned:</strong>{' '}
                    {new Date(caseData.assignedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Activity:</strong>{' '}
                    {new Date(caseData.lastActivityAt).toLocaleString()}
                  </p>
                  {caseData.closedAt && (
                    <p>
                      <strong>Closed:</strong>{' '}
                      {new Date(caseData.closedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner</h3>
                <p className="text-sm">{caseData.partnerName}</p>
              </div>

              {/* Client Feedback */}
              {caseData.clientFeedback && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Feedback</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-xl">
                        {'★'.repeat(caseData.clientFeedback.rating)}
                        {'☆'.repeat(5 - caseData.clientFeedback.rating)}
                      </span>
                    </div>
                    {caseData.clientFeedback.comment && (
                      <p className="text-sm text-gray-600">{caseData.clientFeedback.comment}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseDetail;
