// src/pages/admin/ReportBuilderPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// This is the read-only preview component for the right-hand column
const ReportPreview = ({ reportData }) => {
    if (!reportData) return null;
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
        <div className="report-preview">
            <h2>{reportData.title}</h2>
            <p className="report-preview-subtitle">Performance Report: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
            
            <div className="report-preview-section">
                <p>{reportData.openingRemarks}</p>
            </div>
            
            <div className="report-preview-section">
                <p>You deposited a total of <strong>{reportData.summary.totalDeposits.toFixed(2)} USDC</strong>, which corresponds to <strong>{reportData.summary.totalTradable.toFixed(2)} USDC</strong> in tradable capital.</p>
            </div>

            {reportData.events.map((event, index) => (
                <div key={index} className="report-preview-section event-block">
                    <h4>{event.index}. {event.title} <span className="event-date">{event.dateRange}</span></h4>
                    {event.type === 'ALLOCATION' && (
                        <>
                            <p className="event-calculation">{event.calculationString}</p>
                            <div className="event-details"><span>Tradable Capital:</span> <span>{event.tradableCapital.toFixed(2)} USDC</span></div>
                            <div className="event-details"><span>Position Open:</span> <span className={event.unrealizedPnl >= 0 ? 'text-positive' : 'text-negative'}>~ {event.unrealizedPnl.toFixed(2)} USDC</span></div>
                        </>
                    )}
                    {event.type === 'MANUAL_PNL' && (
                        <div className="event-details"><span>{event.label}:</span> <span className={event.amount >= 0 ? 'text-positive' : 'text-negative'}>{event.amount >= 0 ? '+' : ''}{event.amount.toFixed(2)} USDC</span></div>
                    )}
                </div>
            ))}
            
            <div className="report-preview-section final-summary">
                <p>Your tradable capital (as of {formatDate(reportData.endDate)}) is: <strong>~ {reportData.summary.endingCapital.toFixed(2)} USDC</strong></p>
            </div>
            
            <div className="report-preview-section">
                <p>{reportData.closingRemarks}</p>
            </div>
        </div>
    );
};


const ReportBuilderPage = () => {
  const [vaultUsers, setVaultUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftData, setDraftData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState(new Set());

  const [manualEntry, setManualEntry] = useState({ date: '', label: '', amount: '' });

  useEffect(() => {
    setIsLoading(true);
    api.get('/admin/vault-users')
      .then(res => setVaultUsers(res.data))
      .catch(err => setError("Could not load users."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDraftData(null);
    setReportData(null);
    setSelectedTransactionIds(new Set());
    try {
      const response = await api.get(`/admin/reports/draft?userId=${selectedUserId}&startDate=${startDate}&endDate=${endDate}`);
      const rawData = response.data;
      setDraftData(rawData);
      
      setReportData({
        title: `Performance Report for ${rawData.userInfo.username}`,
        startDate: rawData.reportStartDate,
        endDate: rawData.reportEndDate,
        openingRemarks: `Good morning and welcome to your personal Hyper-Strategies performance report! First of all, we would like to thank you for using our service during this early phase as we continue to optimize our platform and system.`,
        closingRemarks: `Thank you very much for your participation and for your constructive feedback! If there is anything you would like to withdraw sooner, you can contact us at any time.\n\nKage & Tora\nHyper-Strategies`,
        summary: { totalDeposits: 0, totalTradable: 0, endingCapital: rawData.startingCapital },
        events: [],
      });
    } catch (err) { setError(err.response?.data?.error || 'Failed to generate draft.'); } finally { setIsLoading(false); }
  };

  const handleTransactionSelect = (id) => {
    setSelectedTransactionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) { newSet.delete(id); } else { newSet.add(id); }
      return newSet;
    });
  };

  const handleGroupAsAllocation = () => {
    const selectedTxs = draftData.periodTransactions.filter(tx => selectedTransactionIds.has(tx.entry_id) && tx.entry_type === 'DEPOSIT');
    if (selectedTxs.length === 0) return;

    const totalDeposit = selectedTxs.reduce((sum, tx) => sum + tx.amount + tx.fee_amount, 0);
    const tradableCapital = selectedTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const calculationString = selectedTxs.map(tx => `${(tx.amount + tx.fee_amount).toFixed(2)}`).join(' + ') + ` = ${totalDeposit.toFixed(2)} USDC`;
    
    const unrealizedPnlStr = prompt("Enter the 'Position offen' (Unrealized PNL) amount for this block (e.g., -77.56 or 20.04):", "0.00");
    const unrealizedPnl = parseFloat(unrealizedPnlStr) || 0;

    const newEvent = {
        type: 'ALLOCATION',
        index: reportData.events.length + 1,
        title: 'Allocation',
        dateRange: `${new Date(selectedTxs[0].created_at).toLocaleDateString()} - ${new Date(selectedTxs[selectedTxs.length - 1].created_at).toLocaleDateString()}`,
        calculationString, totalDeposit, tradableCapital, unrealizedPnl,
        sourceTxIds: selectedTxs.map(tx => tx.entry_id)
    };
    
    setReportData(prev => ({
        ...prev,
        events: [...prev.events, newEvent].sort((a, b) => new Date(a.dateRange.split(' - ')[0]) - new Date(b.dateRange.split(' - ')[0])),
        summary: {
            ...prev.summary,
            totalDeposits: prev.summary.totalDeposits + totalDeposit,
            totalTradable: prev.summary.totalTradable + tradableCapital,
            endingCapital: prev.summary.endingCapital + tradableCapital + unrealizedPnl
        }
    }));
    
    setDraftData(prev => ({...prev, periodTransactions: prev.periodTransactions.filter(tx => !selectedTransactionIds.has(tx.entry_id)) }));
    setSelectedTransactionIds(new Set());
  };

  const handleAddManualPnl = () => {
    const selectedTxs = draftData.periodTransactions.filter(tx => selectedTransactionIds.has(tx.entry_id) && tx.entry_type === 'PNL_DISTRIBUTION');
    if (selectedTxs.length === 0) return;

    const pnlAmount = selectedTxs.reduce((sum, tx) => sum + tx.amount, 0);

    const newEvent = {
        type: 'REALIZED_PNL',
        index: reportData.events.length + 1,
        title: 'Realized P&L',
        dateRange: new Date(selectedTxs[0].created_at).toLocaleDateString(),
        amount: pnlAmount,
        sourceTxIds: selectedTxs.map(tx => tx.entry_id)
    };

    setReportData(prev => ({
        ...prev,
        events: [...prev.events, newEvent].sort((a, b) => new Date(a.dateRange.split(' - ')[0]) - new Date(b.dateRange.split(' - ')[0])),
        summary: { ...prev.summary, endingCapital: prev.summary.endingCapital + pnlAmount }
    }));
    
    setDraftData(prev => ({...prev, periodTransactions: prev.periodTransactions.filter(tx => !selectedTransactionIds.has(tx.entry_id)) }));
    setSelectedTransactionIds(new Set());
  };
  
  const handleSave = async (status) => {
    if (!reportData) return;
    setIsLoading(true);
    try {
      const finalReportData = {
        ...reportData,
        events: reportData.events.map((e, i) => ({ ...e, index: i + 1 })) // Re-index events before saving
      };

      await api.post('/admin/reports/publish', {
          userId: selectedUserId,
          title: finalReportData.title,
          reportDate: finalReportData.startDate,
          reportData: finalReportData,
          status: status
      });
      alert(`Report saved with status: ${status}`);
      setDraftData(null);
      setReportData(null);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save report.'); } finally { setIsLoading(false); }
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Report Builder</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

        <div className="admin-actions-card">
          <h3>Step 1: Report Setup</h3>
          {isLoading && !draftData ? <LoadingSpinner /> : (
            <form onSubmit={handleGenerateDraft} className="admin-form">
              <div className="form-group">
                <label htmlFor="userSelect">Select User</label>
                <select id="userSelect" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                  <option value="" disabled>-- Choose a user --</option>
                  {vaultUsers.map(user => <option key={user.user_id} value={user.user_id}>{user.username}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}><label htmlFor="startDate">Start Date</label><input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
                <div style={{ flex: 1 }}><label htmlFor="endDate">End Date</label><input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Draft Data'}
              </button>
            </form>
          )}
          {error && <p className="error-message" style={{ marginTop: '16px' }}>{error}</p>}
        </div>
        
        {draftData && reportData && (
          <div className="report-builder-grid">
            <div className="admin-card">
              <h3>Data Workbench</h3>
              <div className="workbench-section">
                <h4>Available Transactions ({draftData.periodTransactions.length})</h4>
                <div className="transaction-list">
                    {draftData.periodTransactions.map(tx => (
                        <div key={tx.entry_id} className="transaction-item">
                            <input type="checkbox" checked={selectedTransactionIds.has(tx.entry_id)} onChange={() => handleTransactionSelect(tx.entry_id)} />
                            <span className="tx-date">{new Date(tx.created_at).toLocaleDateString()}</span>
                            <span className="tx-type">{tx.entry_type.replace(/_/g, ' ')}</span>
                            <span className={`tx-amount ${tx.amount >= 0 ? 'text-positive' : 'text-negative'}`}>{tx.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleGroupAsAllocation} disabled={selectedTransactionIds.size === 0} className="btn-secondary btn-sm">Group as Allocation</button>
                    <button onClick={handleAddManualPnl} disabled={selectedTransactionIds.size === 0} className="btn-secondary btn-sm">Mark as Realized P&L</button>
                </div>
              </div>
              {/* Manual Entry form can go here if needed */}
            </div>

            <div className="admin-card">
              <h3>Live Report Preview</h3>
              <div className="form-group">
                <label>Report Title</label>
                <input type="text" value={reportData.title} onChange={e => setReportData({...reportData, title: e.target.value})} className="input-field" />
              </div>
              <div className="form-group">
                  <label>Opening Remarks</label>
                  <textarea value={reportData.openingRemarks} onChange={e => setReportData({...reportData, openingRemarks: e.target.value})} className="input-field" rows="4" style={{ whiteSpace: 'pre-wrap' }}></textarea>
              </div>
              
              <ReportPreview reportData={reportData} />

              <div className="form-group">
                  <label>Closing Remarks</label>
                  <textarea value={reportData.closingRemarks} onChange={e => setReportData({...reportData, closingRemarks: e.target.value})} className="input-field" rows="4" style={{ whiteSpace: 'pre-wrap' }}></textarea>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '32px' }}>
                <button onClick={() => handleSave('DRAFT')} className="btn-secondary" disabled={isLoading}>{isLoading ? '...' : 'Save Draft'}</button>
                <button onClick={() => handleSave('PENDING_APPROVAL')} className="btn-primary" disabled={isLoading}>{isLoading ? '...' : 'Submit for Approval'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportBuilderPage;
