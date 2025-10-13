// src/pages/admin/ReportReviewPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// We reuse the same ReportPreview component. You should consider moving this
// to a shared component file, e.g., src/components/reports/ReportPreview.jsx
const ReportPreview = ({ reportData }) => {
    if (!reportData) return null;
    const { summary } = reportData;
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return (
        <div className="report-preview">
            <h2>{reportData.title}</h2>
            <p className="report-preview-subtitle">Performance Report: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
            <div className="report-preview-section"><p>{reportData.openingRemarks}</p></div>
            <div className="report-preview-section summary-grid">
                <div className="summary-item"><span>Starting Capital (as of {formatDate(reportData.startDate)})</span><span>{summary.startingCapital.toFixed(2)} USDC</span></div>
                <div className="summary-item"><span>Performance ({summary.pnlPercentage >= 0 ? '+' : ''}{summary.pnlPercentage}%)</span><span className={summary.pnlAmount >= 0 ? 'text-positive' : 'text-negative'}>{summary.pnlAmount >= 0 ? '+' : ''} {summary.pnlAmount.toFixed(2)} USDC</span></div>
                {summary.periodDeposits > 0 && (<div className="summary-item"><span>Deposits this period</span><span>+ {summary.periodDeposits.toFixed(2)} USDC</span></div>)}
                {summary.periodWithdrawals > 0 && (<div className="summary-item"><span>Withdrawals this period</span><span>- {summary.periodWithdrawals.toFixed(2)} USDC</span></div>)}
                <div className="summary-item total"><span>Ending Capital (as of {formatDate(reportData.endDate)})</span><span>{summary.endingCapital.toFixed(2)} USDC</span></div>
            </div>
            <div className="report-preview-section"><p>{reportData.closingRemarks}</p></div>
        </div>
    );
};


const ReportReviewPage = () => {
    const [draftReports, setDraftReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [editableData, setEditableData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = () => {
        setLoading(true);
        setError('');
        api.get('/admin/reports/pending-approval?status=DRAFT') // We need to update the backend for this
            .then(res => {
                setDraftReports(res.data);
                if (res.data.length > 0) {
                    handleSelectReport(res.data[0]);
                }
            })
            .catch(err => setError('Could not load draft reports.'))
            .finally(() => setLoading(false));
    };
    
    const handleSelectReport = (report) => {
        setSelectedReport(report);
        // The full data is already in the 'report_data' field from the list endpoint
        setEditableData(report.report_data); 
    };

    const handleDataChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (newStatus) => {
        if (!selectedReport) return;
        setIsSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            // This endpoint will save and update status
            const response = await api.post(`/admin/reports/${selectedReport.report_id}/publish`, {
                reportData: editableData,
                newStatus: newStatus
            });
            setSuccessMessage(response.data.message);
            // Refresh the list after saving
            fetchDrafts();
            setSelectedReport(null);
            setEditableData(null);
        } catch(err) {
            setError(err.response?.data?.error || 'Failed to save report.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Review & Publish Reports</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>
                
                {loading ? <LoadingSpinner /> : error ? <p className="error-message">{error}</p> :
                draftReports.length === 0 ? (
                    <div className="admin-card text-center"><p>No draft reports are currently awaiting review.</p></div>
                ) : (
                    <div className="report-builder-grid">
                        <div className="admin-card">
                            <h3>Draft Reports Queue ({draftReports.length})</h3>
                            <div className="draft-list">
                                {draftReports.map(draft => (
                                    <div 
                                        key={draft.report_id} 
                                        className={`draft-item ${selectedReport?.report_id === draft.report_id ? 'active' : ''}`}
                                        onClick={() => handleSelectReport(draft)}
                                    >
                                        <span>{draft.username}</span>
                                        <small>{new Date(draft.report_date).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedReport && editableData ? (
                            <div className="admin-card">
                                <h3>Editing Report for: {selectedReport.username}</h3>
                                <div className="form-group">
                                    <label>Opening Remarks</label>
                                    <textarea value={editableData.openingRemarks} onChange={e => handleDataChange('openingRemarks', e.target.value)} className="input-field" rows="4"></textarea>
                                </div>
                                
                                <ReportPreview reportData={editableData} />
                                
                                <div className="form-group">
                                    <label>Closing Remarks</label>
                                    <textarea value={editableData.closingRemarks} onChange={e => handleDataChange('closingRemarks', e.target.value)} className="input-field" rows="4"></textarea>
                                </div>

                                {successMessage && <p className="admin-message success">{successMessage}</p>}
                                <div className="modal-actions" style={{ marginTop: '24px' }}>
                                    <button onClick={() => handleSave('DRAFT')} className="btn-secondary" disabled={isSaving}>{isSaving ? '...' : 'Save Changes'}</button>
                                    <button onClick={() => handleSave('APPROVED')} className="btn-primary" disabled={isSaving}>{isSaving ? '...' : 'Approve & Publish'}</button>
                                </div>
                            </div>
                        ) : <p>Select a draft to review.</p>}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReportReviewPage;
