import React, { useState } from 'react';
import { startAgentExport, getAgentExportJobStatus, downloadAgentJobFile, AGENT_EXPORT_TYPES, CASE_CATEGORY_OPTIONS } from '../../services/madaDataApi';

const AgentExportModal = ({ onClose, defaultExportType = 'cases' }) => {
  const [exportType, setExportType] = useState(defaultExportType);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }
    setLoading(true);
    setError('');
    setStatus('Starting export…');

    try {
      const filters = { startDate, endDate };
      if (category) filters.category = category;

      const { jobId } = await startAgentExport(exportType, filters);
      setStatus('Generating xlsx…');

      const interval = setInterval(async () => {
        try {
          const job = await getAgentExportJobStatus(jobId);
          if (job.status === 'completed') {
            clearInterval(interval);
            setLoading(false);
            setStatus('Downloading…');
            if (job.hasDownload) {
              await downloadAgentJobFile(jobId, `madadgaar-${exportType}-export.xlsx`);
              setStatus('Download complete (removed from server storage)');
            }
          } else if (job.status === 'failed') {
            clearInterval(interval);
            setLoading(false);
            setError(job.errorMessage || 'Export failed');
            setStatus('');
          }
        } catch (pollErr) {
          clearInterval(interval);
          setLoading(false);
          setError(pollErr.message);
          setStatus('');
        }
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.message);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Download Records</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {AGENT_EXPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {CASE_CATEGORY_OPTIONS.map((c) => (
                <option key={c.value || 'all'} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {status && <p className="text-sm text-gray-600">{status}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={handleExport}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Exporting…' : 'Export xlsx'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentExportModal;
