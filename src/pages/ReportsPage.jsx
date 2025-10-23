// src/pages/ReportsPage.jsx 

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ADDED
import Layout from '../components/Layout';
import api from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import html2canvas from 'html2canvas'; 
import jsPDF from 'jspdf';

const ReportPreview = ({ reportData }) => {
    const { t } = useTranslation();
    if (!reportData) return null;
    
    const { summary } = reportData;
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // Use fallbacks ( `|| 0` ) to prevent crashes if a field is missing from old reports.
    const hasPnl = typeof summary.pnlAmount === 'number';
    const hasBuybackGains = (summary.buybackGains || 0) > 0.001;
    const hasDeposits = (summary.periodDeposits || 0) > 0;
    const hasWithdrawals = (summary.periodWithdrawals || 0) > 0;
    const hasPerformanceFees = (summary.performanceFeesPaid || 0) < -0.001;
    const hasBonusPoints = (summary.endingBonusPointsBalance || 0) > 0;

    return (
        <div className="report-preview">
            <h2>{reportData.title}</h2>
            <p className="report-preview-subtitle">{t('reports.preview.subtitle', 'Performance Report')}: {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}</p>
            
            <div className="report-preview-section">
                <p>{reportData.openingRemarks}</p>
            </div>
            
            <div className="report-preview-section summary-grid">
                {/* --- Balance Components --- */}
                <div className="summary-item">
                    <span>{t('reports.preview.startingCapital', 'Starting Capital (as of {{date}})', { date: formatDate(reportData.startDate) })}</span>
                    {/* ADDED: Fallback to 0 to prevent crashes */}
                    <span>{(summary.startingCapital || 0).toFixed(2)} USDC</span>
                </div>

                {hasPnl && (
                    <div className="summary-item">
                        <span>{t('reports.preview.strategyPerformance', 'Strategy Performance ({{percentage}}%)', { percentage: summary.pnlPercentage >= 0 ? '+' + summary.pnlPercentage : summary.pnlPercentage })}</span>
                        <span className={summary.pnlAmount >= 0 ? 'text-positive' : 'text-negative'}>
                            {summary.pnlAmount >= 0 ? '+' : ''} {(summary.pnlAmount || 0).toFixed(2)} USDC
                        </span>
                    </div>
                )}
                
                {hasBuybackGains && (
                    <div className="summary-item">
                        <span>{t('reports.preview.buybackGains', 'Buyback Engine Gains')}</span>
                        <span className="text-positive">+ {(summary.buybackGains || 0).toFixed(2)} USDC</span>
                    </div>
                )}

                {hasDeposits && (
                    <div className="summary-item">
                        <span>{t('reports.preview.deposits', 'Deposits this period')}</span>
                        <span>+ {(summary.periodDeposits || 0).toFixed(2)} USDC</span>
                    </div>
                )}

                {hasWithdrawals && (
                     <div className="summary-item">
                        <span>{t('reports.preview.withdrawals', 'Withdrawals this period')}</span>
                        <span>- {(summary.periodWithdrawals || 0).toFixed(2)} USDC</span>
                    </div>
                )}

                {hasPerformanceFees && (
                     <div className="summary-item">
                        <span>{t('reports.preview.performanceFees', 'Performance Fees Paid')}</span>
                        <span className="text-negative">{(summary.performanceFeesPaid || 0).toFixed(2)} USDC</span>
                    </div>
                )}
                
                {/* --- Totals --- */}
                <div className="summary-item total">
                    <span>{t('reports.preview.endingCapital', 'Ending Capital (as of {{date}})', { date: formatDate(reportData.endDate) })}</span>
                    <span>{(summary.endingCapital || 0).toFixed(2)} USDC</span>
                </div>

                {hasBonusPoints && (
                    <div className="summary-item">
                        <span>{t('reports.preview.endingBonusPoints', 'Ending Bonus Points Balance')}</span>
                        <span>{(summary.endingBonusPointsBalance || 0).toFixed(2)}</span>
                    </div>
                )}
                
                <div className="summary-item total" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '10px' }}>
                    <span>{t('reports.preview.totalAccountValue', 'Total Account Value')}</span>
                    {/* ADDED: Fallback for the most likely crash point */}
                    <span>{(summary.totalAccountValue || summary.endingCapital || 0).toFixed(2)} USDC</span>
                </div>
            </div>
            
            <div className="report-preview-section">
                <p>{reportData.closingRemarks}</p>
            </div>
        </div>
    );
};

const ReportsPage = () => {
    const { t } = useTranslation(); // MOVED
    const [availableReports, setAvailableReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState('');
    const [reportData, setReportData] = useState(null);
    
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [error, setError] = useState('');

    const reportPreviewRef = useRef(null);

    useEffect(() => {
        api.get('/user/reports/available')
            .then(res => {
                setAvailableReports(res.data);
                if (res.data.length > 0) {
                    setSelectedReportId(res.data[0].report_id);
                }
            })
            .catch(err => setError(t('reports.error.loadList', "Could not load available reports."))) // CHANGED
            .finally(() => setIsLoadingList(false));
    }, [t]); // ADDED t to dependency array

    useEffect(() => {
        if (!selectedReportId) return;
        setIsLoadingReport(true);
        setReportData(null);
        api.get(`/user/reports/${selectedReportId}`)
            .then(res => setReportData(res.data))
            .catch(err => setError(t('reports.error.loadSingle', "Could not load the selected report."))) // CHANGED
            .finally(() => setIsLoadingReport(false));
    }, [selectedReportId, t]); // ADDED t to dependency array

    const handleDownloadPdf = () => {
        if (!reportPreviewRef.current || isDownloadingPdf) return;
        setIsDownloadingPdf(true);
        html2canvas(reportPreviewRef.current, { scale: 2 })
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
                alert(t('reports.error.pdf', "Sorry, there was an error creating the PDF. Please try again.")); // CHANGED
            })
            .finally(() => {
                setIsDownloadingPdf(false);
            });
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    {/* CHANGED */}
                    <h1>{t('reports.title', 'My Reports')}</h1>
                    <Link to="/profile" className="btn-secondary btn-sm">{t('reports.backToProfile', '← Back to Profile')}</Link>
                </div>

                {isLoadingList ? <LoadingSpinner /> : error ? <p className="error-message">{error}</p> :
                availableReports.length === 0 ? (
                    <div className="profile-card text-center">
                        {/* CHANGED */}
                        <h2>{t('reports.noReports.title', 'No Reports Available')}</h2>
                        <p>{t('reports.noReports.body', 'Your monthly performance reports will appear here once they have been generated and approved. Please check back later.')}</p>
                    </div>
                ) : (
                    <>
                        <div className="admin-card report-selector-card">
                            {/* CHANGED */}
                            <h3>{t('reports.availablePeriods', 'Available Periods')}</h3>
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
                                    {/* CHANGED */}
                                    <h3>{t('reports.reportDetails', 'Report Details')}</h3>
                                    <button className="btn-primary" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                                        {/* CHANGED */}
                                        {t(isDownloadingPdf ? 'reports.downloading' : 'reports.downloadPdf', isDownloadingPdf ? 'Downloading...' : 'Download as PDF')}
                                    </button>
                                </div>
                                
                                <div ref={reportPreviewRef}>
                                    <ReportPreview reportData={reportData.report_data} />
                                </div>

                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    {/* CHANGED */}
                                    <Link to="/tax-support" className="btn-secondary">{t('reports.taxSupport', 'Tax Support (Coming Soon)')}</Link>
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
