// src/pages/ReportsPage.jsx 

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import api from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import html2canvas from 'html2canvas'; 
import jsPDF from 'jspdf';

// --- ReportPreview Component ---
// This component now handles the new 'buybackGains' field.
const ReportPreview = ({ reportData }) => {
    if (!reportData) return null;
    
    const { summary } = reportData;
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const hasBuybackGains = summary.buybackGains && summary.buybackGains > 0.001;

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
                    <span>Strategy Performance ({summary.pnlPercentage >= 0 ? '+' : ''}{summary.pnlPercentage}%)</span>
                    <span className={summary.pnlAmount >= 0 ? 'text-positive' : 'text-negative'}>
                        {summary.pnlAmount >= 0 ? '+' : ''} {summary.pnlAmount.toFixed(2)} USDC
                    </span>
                </div>
                {/* --- NEW: Display for Buyback Gains --- */}
                {hasBuybackGains && (
                    <div className="summary-item">
                        <span>Buyback Engine Gains</span>
                        <span className="text-positive">
                            + {summary.buybackGains.toFixed(2)} USDC
                        </span>
                    </div>
                )}
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


// --- Main ReportsPage Component ---
// This has been updated with a better UX for selecting reports and functional PDF download.
const ReportsPage = () => {
    const { t } = useTranslation();
    const [availableReports, setAvailableReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState('');
    const [reportData, setReportData] = useState(null);
    
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [error, setError] = useState('');

    const reportPreviewRef = useRef(null); // Ref for the PDF download target

    useEffect(() => {
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
        setReportData(null); // Clear previous report while loading
        api.get(`/user/reports/${selectedReportId}`)
            .then(res => setReportData(res.data))
            .catch(err => setError("Could not load the selected report."))
            .finally(() => setIsLoadingReport(false));
    }, [selectedReportId]);

    const handleDownloadPdf = () => {
        if (!reportPreviewRef.current || isDownloadingPdf) return;

        setIsDownloadingPdf(true);
        
        // Use html2canvas to render the component to a canvas
        html2canvas(reportPreviewRef.current, { scale: 2 }) // Increase scale for better quality
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                
                const fileName = `HyperStrategies_Report_${reportData.report_data.startDate}.pdf`;
                pdf.save(fileName);
            })
            .catch(err => {
                console.error("PDF generation failed:", err);
                alert("Sorry, there was an error creating the PDF. Please try again.");
            })
            .finally(() => {
                setIsDownloadingPdf(false);
            });
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
                    <>
                        {/* --- NEW: Improved UX for Report Selection --- */}
                        <div className="admin-card report-selector-card">
                            <h3>Available Periods</h3>
                            <div className="report-period-list">
                                {availableReports.map(report => (
                                    <button 
                                        key={report.report_id}
                                        className={`report-period-item ${report.report_id === selectedReportId ? 'active' : ''}`}
                                        onClick={() => setSelectedReportId(report.report_id)}
                                        disabled={isLoadingReport}
                                    >
                                        {new Date(report.report_date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoadingReport ? <LoadingSpinner /> : reportData ? (
                            <div className="admin-card" style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>Report Details</h3>
                                    <button className="btn-primary" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                                        {isDownloadingPdf ? 'Downloading...' : 'Download as PDF'}
                                    </button>
                                </div>
                                
                                {/* Ref is attached to a wrapper for the canvas capture */}
                                <div ref={reportPreviewRef}>
                                    <ReportPreview reportData={reportData.report_data} />
                                </div>

                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    {/* This remains a simple link, as requested */}
                                    <Link to="/tax-support" className="btn-secondary">Tax Support (Coming Soon)</Link>
                                </div>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ReportsPage;
