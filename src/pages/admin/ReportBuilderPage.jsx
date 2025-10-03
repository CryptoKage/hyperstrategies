// src/pages/admin/ReportBuilderPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportBuilderPage = () => {
  const { t } = useTranslation();
  
  // --- State for the Setup Form ---
  const [vaultUsers, setVaultUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportTitle, setReportTitle] = useState('');

  // --- State for the Draft Data and UI ---
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [draftData, setDraftData] = useState(null);

  // 1. Fetch the list of vault users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/vault-users');
        setVaultUsers(response.data);
      } catch (err) {
        console.error("Failed to fetch vault users:", err);
        setError("Could not load the list of users.");
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Handler for the "Generate Draft" button
  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setDraftData(null); // Clear any previous draft

    try {
      const response = await api.get(`/admin/reports/draft?userId=${selectedUserId}&startDate=${startDate}&endDate=${endDate}`);
      setDraftData(response.data);
      // Pre-fill a default title if one isn't set
      if (!reportTitle) {
        setReportTitle(`Performance Report: ${draftData?.userInfo.username} (${startDate} - ${endDate})`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate draft report.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Handlers for the "Save/Publish" buttons (Placeholders for now)
  const handleSaveDraft = () => {
    alert('Save Draft functionality coming in Phase 2!');
    // Logic will go here to send 'DRAFT' status to backend
  };

  const handleSubmitForApproval = () => {
    alert('Submit for Approval functionality coming in Phase 2!');
    // Logic will go here to send 'PENDING_APPROVAL' status to backend
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Report Builder (MVP)</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

        {/* --- SETUP CARD --- */}
        <div className="admin-actions-card">
          <h3>Step 1: Report Setup</h3>
          <p>Select a user and a date range to pull all relevant transaction data. The end date is exclusive (e.g., for all of August, select Sep 1st as the end date).</p>
          
          {isLoadingUsers ? (
            <LoadingSpinner size="small" />
          ) : (
            <form onSubmit={handleGenerateDraft} className="admin-form">
              
              {/* User Dropdown */}
              <div className="form-group">
                <label htmlFor="userSelect">Select User</label>
                <select id="userSelect" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                  <option value="" disabled>-- Choose a user --</option>
                  {vaultUsers.map(user => (
                    <option key={user.user_id} value={user.user_id}>{user.username}</option>
                  ))}
                </select>
              </div>
              
              {/* Date Range */}
              <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="startDate">Start Date (YYYY-MM-DD)</label>
                  <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="endDate">End Date (YYYY-MM-DD)</label>
                  <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isGenerating}>
                {isGenerating ? 'Generating Draft...' : 'Generate Draft Data'}
              </button>
            </form>
          )}
          {error && <p className="error-message" style={{ marginTop: '16px' }}>{error}</p>}
        </div>

        {/* --- DRAFT PREVIEW & EDITOR CARD --- */}
        {draftData && (
          <div className="admin-card" style={{ marginTop: '24px' }}>
            <h3>Step 2: Report Editor (Preview)</h3>
            
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--color-background)', borderRadius: '8px' }}>
              <p><strong>User:</strong> {draftData.userInfo.username}</p>
              <p><strong>Active Vaults:</strong> {draftData.userVaults.map(v => `${v.vault_name} (${v.vault_type})`).join(', ')}</p>
              <p><strong>Period:</strong> {draftData.reportStartDate} to {draftData.reportEndDate}</p>
              <p><strong>Starting Capital:</strong> ${draftData.startingCapital.toFixed(2)}</p>
            </div>

            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="reportTitle">Report Title (Visible to User)</label>
              <input type="text" id="reportTitle" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g., August 2024 Monthly Report" className="input-field" />
            </div>

            <hr style={{ borderColor: 'var(--color-border)', margin: '24px 0' }} />

            <h4>Raw Transaction Data (Found {draftData.periodTransactions.length} entries)</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>In the next phase, this raw data will be replaced by an interactive grouping tool.</p>
            
            {/* Temporary RAW JSON display */}
            <pre style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', color: '#fff', overflowX: 'auto', fontSize: '0.8rem' }}>
              {JSON.stringify(draftData.periodTransactions, null, 2)}
            </pre>

            {/* Action Buttons */}
            <div className="modal-actions" style={{ marginTop: '32px' }}>
              <button type="button" onClick={handleSaveDraft} className="btn-secondary">Save as Draft</button>
              <button type="button" onClick={handleSubmitForApproval} className="btn-primary">Submit for Approval</button>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportBuilderPage;
