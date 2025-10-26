// src/pages/admin/ReportReviewPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const ReportPreview = ({ reportData }) => {
    const { t } = useTranslation();
    if (!reportData) return null;

    const translateField = (field) => {
        if (typeof field === 'object' && field !== null && field.key) {
            return t(field.key, field.vars || {});
        }
        return field;
    };

    const { summary } = reportData;
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const hasPnl = typeof summary.pnlAmount === 'number';
    const hasBuybackGains = (summary.buybackGains || 0) > 0.001;
    const hasDeposits = (summary.periodDeposits || 0) > 0;
    const hasWithdrawals = (summary.periodWithdrawals || 0) > 0;
    const hasPerformanceFees = (summary.performanceFeesPaid || 0) < -0.001;
    const hasBonusPoints = (summary.endingBonusPointsBalance || 0) > 0;
    
    return (
        <div className="report-preview">
            <h2>{translateField(reportData.title)}</h2>
            <p className="report-preview-subtitle">{t('reports.preview.subtitle', 'Performance Report')}: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
            <div className="report-preview-section"><p>{translateField(reportData.openingRemarks)}</p></div>
            <div className="report-preview-section summary-grid">
                <div className="summary-item"><span>{t('reports.preview.startingCapital', 'Starting Capital (as of {{date}})', { date: formatDate(reportData.startDate) })}</span><span>{(summary.startingCapital || 0).toFixed(2)} USDC</span></div>
                {hasPnl && (<div className="summary-item"><span>{t('reports.preview.strategyPerformance', 'Strategy Performance ({{percentage}}%)', { percentage: summary.pnlPercentage >= 0 ? '+' + summary.pnlPercentage : summary.pnlPercentage })}</span><span className={summary.pnlAmount >= 0 ? 'text-positive' : 'text-negative'}>{summary.pnlAmount >= 0 ? '+' : ''} {(summary.pnlAmount || 0).toFixed(2)} USDC</span></div>)}
                {hasBuybackGains && (<div className="summary-item"><span>{t('reports.preview.buybackGains', 'Buyback Engine Gains')}</span><span className="text-positive">+ {(summary.buybackGains || 0).toFixed(2)} USDC</span></div>)}
                {hasDeposits && (<div className="summary-item"><span>{t('reports.preview.deposits', 'Deposits this period')}</span><span>+ {(summary.periodDeposits || 0).toFixed(2)} USDC</span></div>)}
                {hasWithdrawals && (<div className="summary-item"><span>{t('reports.preview.withdrawals', 'Withdrawals this period')}</span><span>- {(summary.periodWithdrawals || 0).toFixed(2)} USDC</span></div>)}
                {hasPerformanceFees && (<div className="summary-item"><span>{t('reports.preview.performanceFees', 'Performance Fees Paid')}</span><span className="text-negative">{(summary.performanceFeesPaid || 0).toFixed(2)} USDC</span></div>)}
                <div className="summary-item total"><span>{t('reports.preview.endingCapital', 'Ending Capital (as of {{date}})', { date: formatDate(reportData.endDate) })}</span><span>{(summary.endingCapital || 0).toFixed(2)} USDC</span></div>
                {hasBonusPoints && (<div className="summary-item"><span>{t('reports.preview.endingBonusPoints', 'Ending Bonus Points Balance')}</span><span>{(summary.endingBonusPointsBalance || 0).toFixed(2)}</span></div>)}
                <div className="summary-item total" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '10px' }}><span>{t('reports.preview.totalAccountValue', 'Total Account Value')}</span><span>{(summary.totalAccountValue || summary.endingCapital || 0).toFixed(2)} USDC</span></div>
            </div>
            <div className="report-preview-section"><p>{translateField(reportData.closingRemarks)}</p></div>
        </div>
    );
};


const ReportReviewPage = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [editableData, setEditableData] = useState(null);
    const [selectedReportIds, setSelectedReportIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('DRAFT');

    const fetchReports = useCallback(() => {
        setLoading(true);
        setError('');
        setReports([]);
        setSelectedReport(null);
        setEditableData(null);
        setSelectedReportIds(new Set());
        api.get(`/admin/reports/pending-approval?status=${filterStatus}`)
            .then(res => {
                setReports(res.data);
                if (res.data.length > 0) {
                    handleSelectReport(res.data[0]);
                }
            })
            .catch(err => setError(`Could not load reports with status: ${filterStatus}.`))
            .finally(() => setLoading(false));
    }, [filterStatus, t]); // Added 't' to dependency array for safety with handleSelectReport

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);
    
    const handleSelectReport = (report) => {
        setSelectedReport(report);
        const preTranslatedData = {
            ...report.report_data,
            openingRemarks: (typeof report.report_data.openingRemarks === 'object' && report.report_data.openingRemarks.key)
                ? t(report.report_data.openingRemarks.key, report.report_data.openingRemarks.vars)
                : report.report_data.openingRemarks,
            closingRemarks: (typeof report.report_data.closingRemarks === 'object' && report.report_data.closingRemarks.key)
                ? t(report.report_data.closingRemarks.key, report.report_data.closingRemarks.vars)
                : report.report_data.closingRemarks,
        };
        setEditableData(preTranslatedData); 
    };
    
    const handleDataChange = (field, value) => {
        setEditableData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectOne = (reportId) => {
        const newSelection = new Set(selectedReportIds);
        if (newSelection.has(reportId)) {
            newSelection.delete(reportId);
        } else {
            newSelection.add(reportId);
        }
        setSelectedReportIds(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedReportIds.size === reports.length) {
            setSelectedReportIds(new Set());
        } else {
            setSelectedReportIds(new Set(reports.map(r => r.report_id)));
        }
    };

    const handleDeleteSelected = async () => {
        const idsToDelete = Array.from(selectedReportIds);
        if (idsToDelete.length === 0 || !window.confirm(`Are you sure you want to permanently delete ${idsToDelete.length} selected reports?`)) {
            return;
        }
        setIsDeleting(true);
        setError('');
        try {
            await api.delete('/admin/reports', { data: { reportIds: idsToDelete } });
            fetchReports();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete reports.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async (newStatus) => {
        if (!selectedReport) return;
        setIsSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await api.post(`/admin/reports/${selectedReport.report_id}/publish`, {
                reportData: editableData,
                newStatus: newStatus
            });
            setSuccessMessage(response.data.message);
            fetchReports();
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
                    <h1>Report Management Suite</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                <div className="admin-card tabs" style={{ marginBottom: '24px' }}>
                    <button className={`tab-button ${filterStatus === 'DRAFT' ? 'active' : ''}`} onClick={() => setFilterStatus('DRAFT')}>Drafts</button>
                    <button className={`tab-button ${filterStatus === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilterStatus('APPROVED')}>Approved / Published</button>
                </div>
                
                {loading ? <LoadingSpinner /> : error ? <p className="error-message">{error}</p> :
                reports.length === 0 ? (
                    <div className="admin-card text-center"><p>No reports found with status: {filterStatus}.</p></div>
                ) : (
                    <div className="report-builder-grid">
                        <div className="admin-card">
                             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h3>{filterStatus} Reports ({reports.length})</h3>
                                {selectedReportIds.size > 0 && (
                                    <button onClick={handleDeleteSelected} className="btn-danger-outline btn-sm" disabled={isDeleting}>
                                        {isDeleting ? 'Deleting...' : `Delete Selected (${selectedReportIds.size})`}
                                    </button>
                                )}
                            </div>
                            <div className="draft-list">
                                <div className="draft-item select-all-item">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={reports.length > 0 && selectedReportIds.size === reports.length}
                                        title="Select All"
                                    />
                                    <span>Select All</span>
                                </div>
                                {reports.map(draft => (
                                    <div 
                                        key={draft.report_id} 
                                        className={`draft-item ${selectedReport?.report_id === draft.report_id ? 'active' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedReportIds.has(draft.report_id)}
                                            onChange={() => handleSelectOne(draft.report_id)}
                                        />
                                        <div className="draft-item-content" onClick={() => handleSelectReport(draft)}>
                                            <span>{draft.username}</span>
                                            <small>{new Date(draft.report_date).toLocaleDateString()}</small>
                                        </div>
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
                                <div className="modal-actions" style={{ marginTop: '24px', justifyContent: 'space-between' }}>
                                    <button onClick={() => {}} className="btn-danger-outline" disabled={true} style={{visibility: 'hidden'}}>
                                        Placeholder
                                    </button>
                                    <div>
                                        <button onClick={() => handleSave('DRAFT')} className="btn-secondary" disabled={isSaving}>{isSaving ? '...' : 'Save Changes'}</button>
                                        <button onClick={() => handleSave('APPROVED')} className="btn-primary" disabled={isSaving}>{isSaving ? '...' : 'Approve & Publish'}</button>
                                    </div>
                                </div>
                            </div>
                        ) : !loading && <p className="admin-card text-center">Select a report from the list to review.</p>}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReportReviewPage;
