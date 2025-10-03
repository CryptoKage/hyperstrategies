// src/pages/admin/ReportBuilderPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// A new sub-component for the report preview
const ReportPreview = ({ reportData }) => {
    if (!reportData) return null;
    
    // A helper function to format dates consistently
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
        <div className="report-preview">
            <h2>{reportData.title}</h2>
            <p className="report-preview-subtitle">Performance Report {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
            
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
                            <div className="event-details"><span>Position Open:</span> <span className="text-negative">~ {event.unrealizedPnl.toFixed(2)} USDC</span></div>
                        </>
                    )}
                    {event.type === 'REALIZED_PNL' && (
                        <div className="event-details"><span>Position Closed:</span> <span className="text-positive">+ {event.amount.toFixed(2)} USDC</span></div>
                    )}
                    {event.type === 'MANUAL_ENTRY' && (
                        <div className="event-details"><span>{event.label}:</span> <span className={event.amount >= 0 ? 'text-positive' : 'text-negative'}>{event.amount.toFixed(2)} USDC</span></div>
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
  const { t } = useTranslation();
  
  // --- Setup State ---
  const [vaultUsers, setVaultUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // --- Data & UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftData, setDraftData] = useState(null); // Raw data from backend
  const [reportData, setReportData] = useState(null); // Curated data for the report
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]); // For checkboxes

  // --- Manual Entry State ---
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
    setSelectedTransactionIds([]);
    try {
      const response = await api.get(`/admin/reports/draft?userId=${selectedUserId}&startDate=${startDate}&endDate=${endDate}`);
      const rawData = response.data;
      setDraftData(rawData);
      
      // Initialize the editable report data structure
      setReportData({
        title: `Performance Report for ${rawData.userInfo.username}`,
        startDate: rawData.reportStartDate,
        endDate: rawData.reportEndDate,
        openingRemarks: `Good morning and welcome to your personal Hyper-Strategies performance report!`,
        closingRemarks: `Thank you very much for participating and for your constructive feedback!`,
        summary: {
            totalDeposits: 0,
            totalTradable: 0,
            endingCapital: rawData.startingCapital
        },
        events: [],
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate draft.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSelect = (id) => {
    setSelectedTransactionIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleGroupAsAllocation = () => {
    const selectedTxs = draftData.periodTransactions.filter(tx => selectedTransactionIds.includes(tx.entry_id) && tx.entry_type === 'DEPOSIT');
    if (selectedTxs.length === 0) return;

    const totalDeposit = selectedTxs.reduce((sum, tx) => sum + tx.amount + tx.fee_amount, 0);
    const tradableCapital = selectedTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const calculationString = selectedTxs.map(tx => `${(tx.amount + tx.fee_amount).toFixed(2)} USDC`).join(' + ') + ` = ${totalDeposit.toFixed(2)} USDC`;
    
    // Prompt admin for the crucial "unrealized PNL" number
    const unrealizedPnlStr = prompt("Enter the 'Position offen' (Unrealized PNL) amount for this allocation block:", "0.00");
    const unrealizedPnl = parseFloat(unrealizedPnlStr) || 0;

    const newEvent = {
        type: 'ALLOCATION',
        index: reportData.events.length + 1,
        title: 'Allocation',
        dateRange: `${formatDate(selectedTxs[0].created_at)} - ${formatDate(selectedTxs[selectedTxs.length - 1].created_at)}`,
        calculationString,
        totalDeposit,
        tradableCapital,
        unrealizedPnl,
        sourceTxIds: selectedTxs.map(tx => tx.entry_id)
    };
    
    setReportData(prev => ({
        ...prev,
        events: [...prev.events, newEvent].sort((a, b) => new Date(a.dateRange.split(' - ')[0]) - new Date(b.dateRange.split(' - ')[0])),
        summary: {
            ...prev.summary,
            totalDeposits: prev.summary.totalDeposits + totalDeposit,
            totalTradable: prev.summary.totalTradable + tradableCapital,
            endingCapital: prev.summary.endingCapital + tradableCapital // Update ending capital
        }
    }));
    
    // "Use up" the selected transactions
    setDraftData(prev => ({
        ...prev,
        periodTransactions: prev.periodTransactions.filter(tx => !selectedTransactionIds.includes(tx.entry_id))
    }));
    setSelectedTransactionIds([]);
  };
  
  const handleAddManualEntry = (e) => {
    e.preventDefault();
    if (!manualEntry.date || !manualEntry.label || !manualEntry.amount) return;

    const newTx = {
      entry_id: `manual-${Date.now()}`,
      created_at: manualEntry.date,
      entry_type: 'MANUAL_ENTRY',
      amount: parseFloat(manualEntry.amount),
      label: manualEntry.label,
    };

    setDraftData(prev => ({
      ...prev,
      periodTransactions: [...prev.periodTransactions, newTx].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    }));
    setManualEntry({ date: '', label: '', amount: '' });
  };
  
  const handleSave = async (status) => {
    if (!reportData) return;
    setIsLoading(true);
    try {
        await api.post('/admin/reports/publish', {
            userId: selectedUserId,
            title: reportData.title,
            reportDate: reportData.startDate,
            reportData: reportData, // Send the whole curated object
            status: status
        });
        alert(`Report saved with status: ${status}`);
        // Reset state
        setDraftData(null);
        setReportData(null);
    } catch (err) {
        setError(err.response?.data?.error || 'Failed to save report.');
    } finally {
        setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Report Builder</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

        {/* --- Step 1: Setup Form --- */}
        <div className="admin-actions-card">
            <h3>Step 1: Report Setup</h3>
            <form onSubmit={handleGenerateDraft} className="admin-form">
              {/* ... User Dropdown and Date Pickers ... */}
            </form>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && <p className="error-message">{error}</p>}
        
        {draftData && (
          <div className="report-builder-grid">
            {/* --- Left Column: Data Workbench --- */}
            <div className="admin-card">
              <h3>Data Workbench</h3>
              <div className="workbench-section">
                <h4>Available Transactions ({draftData.periodTransactions.length})</h4>
                <div className="transaction-list">
                    {draftData.periodTransactions.map(tx => (
                        <div key={tx.entry_id} className="transaction-item">
                            <input type="checkbox" checked={selectedTransactionIds.includes(tx.entry_id)} onChange={() => handleTransactionSelect(tx.entry_id)} />
                            <span className="tx-date">{formatDate(tx.created_at)}</span>
                            <span className="tx-type">{tx.entry_type}</span>
                            <span className={`tx-amount ${tx.amount >= 0 ? 'text-positive' : 'text-negative'}`}>{tx.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <button onClick={handleGroupAsAllocation} disabled={selectedTransactionIds.length === 0} className="btn-secondary btn-sm">Group as Allocation</button>
              </div>

              <div className="workbench-section">
                <h4>Add Manual Entry</h4>
                <form onSubmit={handleAddManualEntry} className="admin-form-inline">
                    <input type="date" value={manualEntry.date} onChange={e => setManualEntry({...manualEntry, date: e.target.value})} required />
                    <input type="text" value={manualEntry.label} onChange={e => setManualEntry({...manualEntry, label: e.target.value})} placeholder="Label (e.g., Staking Reward)" required />
                    <input type="number" step="any" value={manualEntry.amount} onChange={e => setManualEntry({...manualEntry, amount: e.target.value})} placeholder="Amount" required />
                    <button type="submit" className="btn-secondary btn-sm">Add</button>
                </form>
              </div>
            </div>

            {/* --- Right Column: Live Preview & Controls --- */}
            <div className="admin-card">
              <h3>Live Report Preview</h3>
              <div className="form-group">
                <label>Report Title</label>
                <input type="text" value={reportData?.title || ''} onChange={e => setReportData({...reportData, title: e.target.value})} className="input-field" />
              </div>
              <div className="form-group">
                  <label>Opening Remarks</label>
                  <textarea value={reportData?.openingRemarks || ''} onChange={e => setReportData({...reportData, openingRemarks: e.target.value})} className="input-field" rows="3"></textarea>
              </div>
              
              <ReportPreview reportData={reportData} />

              <div className="form-group">
                  <label>Closing Remarks</label>
                  <textarea value={reportData?.closingRemarks || ''} onChange={e => setReportData({...reportData, closingRemarks: e.target.value})} className="input-field" rows="3"></textarea>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '32px' }}>
                <button onClick={() => handleSave('DRAFT')} className="btn-secondary">Save Draft</button>
                <button onClick={() => handleSave('PENDING_APPROVAL')} className="btn-primary">Submit for Approval</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ReportBuilderPage;
