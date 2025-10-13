// src/pages/ReportsPage.jsx - FINAL VERSION

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import api from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportPreview = ({ reportData }) => {
    if (!reportData) return null;
    
    const { summary } = reportData;
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

    return (
        <div className="report-preview">
            <h2>{reportData.title}</h2>
            <p className="report-preview-subtitle">Performance Report: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
            
            <div className="report-preview-section">
                <p>{reportData.openingRemarks}</p>
            </div>
            
            <div className="report-preview-section summary-grid">
                <div className="summary-item">
                    <span>Starting Capital (as of {formatDate(reportData.startDate)})</span>
                    <span>{summary.startingCapital.toFixed(2)} USDC</span>
                </div>
                <div className="summary-item">
                    <span>Performance ({summary.pnlPercentage >= 0 ? '+' : ''}{summary.pnlPercentage}%)</span>
                    <span className={summary.pnlAmount >= 0 ? 'text-positive' : 'text-negative'}>
                        {summary.pnlAmount >= 0 ? '+' : ''} {summary.pnlAmount.toFixed(2)} USDC
                    </span>
                </div>
                {summary.periodDeposits > 0 && (
                    <div className="summary-item">
                        <span>Deposits this period</span>
                        <span>+ {summary.periodDeposits.toFixed(2)} USDC</span>
                    </div>
                )}
                {summary.periodWithdrawals > 0 && (
                     <div className="summary-item">
                        <span>Withdrawals this period</span>
                        <span>- {summary.periodWithdrawals.toFixed(2)} USDC</span>
                    </div>
                )}
                <div className="summary-item total">
                    <span>Ending Capital (as of {formatDate(reportData.endDate)})</span>
                    <span>{summary.endingCapital.toFixed(2)} USDC</span>
                </div>
            </div>
            
            <div className="report-preview-section">
                <p>{reportData.closingRemarks}</p>
            </div>
        </div>
    );
};


const ReportsPage = () => {
    const { t } = useTranslation();
    const [availableReports, setAvailableReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState('');
    const [reportData, setReportData] = useState(null);
    
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch the list of available reports
        api.get('/user/reports/available')
            .then(res => {
                setAvailableReports(res.data);
                if (res.data.length > 0) {
                    setSelectedReportId(res.data[0].report_id);
                }
            })
            .catch(err => setError("Could not load available reports."))
            .finally(() => setIsLoadingList(false));
    }, []);

    useEffect(() => {
        if (!selectedReportId) return;
        setIsLoadingReport(true);
        api.get(`/user/reports/${selectedReportId}`)
            .then(res => setReportData(res.data))
            .catch(err => setError("Could not load the selected report."))
            .finally(() => setIsLoadingReport(false));
    }, [selectedReportId]);

    const handleDownloadPdf = () => {
        alert("PDF download functionality will be added in the next sprint using a library like react-to-print.");
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>My Reports</h1>
                    <Link to="/profile" className="btn-secondary btn-sm">← Back to Profile</Link>
                </div>

                {isLoadingList ? <LoadingSpinner /> : error ? <p className="error-message">{error}</p> :
                availableReports.length === 0 ? (
                    <div className="profile-card text-center">
                        <h2>No Reports Available</h2>
                        <p>Your monthly performance reports will appear here once they have been generated and approved. Please check back later.</p>
                    </div>
                ) : (
                    <div className="admin-actions-card">
                        <div className="form-group">
                            <label htmlFor="reportSelect">Select a Report to View</label>
                            <select id="reportSelect" value={selectedReportId} onChange={(e) => setSelectedReportId(e.target.value)} disabled={isLoadingReport}>
                                {availableReports.map(report => (
                                    <option key={report.report_id} value={report.report_id}>
                                        {report.title} ({new Date(report.report_date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {isLoadingReport ? <LoadingSpinner /> : reportData ? (
                    <div className="admin-card" style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Report Details</h3>
                            <button className="btn-primary" onClick={handleDownloadPdf}>Download as PDF</button>
                        </div>
                        
                        {/* Use the beautiful preview component */}
                        <ReportPreview reportData={reportData.report_data} />

                         {/* Add the "Tax Support Coming Soon" link */}
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Link to="/tax-support" className="btn-secondary">Tax Support (Coming Soon)</Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </Layout>
    );
};

export default ReportsPage;
