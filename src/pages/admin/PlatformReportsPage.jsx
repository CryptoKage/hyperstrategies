// src/pages/admin/PlatformReportsPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// A small helper component to keep the UI clean
const StatItem = ({ label, value, isCurrency = true, highlight = false }) => {
    let formattedValue = value;
    if (typeof value === 'number') {
        if (isCurrency) {
            formattedValue = `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            formattedValue = value.toLocaleString('en-US');
        }
    }

    let valueClassName = 'stat-value';
    if (highlight) {
        valueClassName += typeof value === 'number' && value >= 0 ? ' text-positive' : ' text-negative';
    }

    return (
        <div className="stat-item">
            <span className="stat-label">{label}</span>
            <span className={valueClassName}>{formattedValue}</span>
        </div>
    );
};

const PlatformReportsPage = () => {
    // Default to the last 30 days for better UX
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
    
    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState(null);

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setReportData(null);
        try {
            const response = await api.get(`/admin/reports/aggregate?startDate=${startDate}&endDate=${endDate}`);
            setReportData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate aggregate report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Internal Platform Report</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                <div className="admin-card">
                    <h3>Generate Aggregate Report</h3>
                    <p>Select a date range to generate a comprehensive internal report on capital flow and platform revenue.</p>
                    <form onSubmit={handleGenerateReport} className="admin-form">
                        <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="startDate">Start Date</label>
                                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="endDate">End Date</label>
                                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </form>
                </div>

                {loading && <LoadingSpinner />}
                {error && <p className="error-message admin-card">{error}</p>}
                
                {reportData && (
                    <div className="admin-grid" style={{ marginTop: '24px' }}>
                        <div className="admin-card">
                            <h4>Capital Flow Summary</h4>
                            <div className="details-grid">
                                <StatItem label="Total Deposits" value={reportData.capitalFlow.totalDeposits} />
                                <StatItem label="Number of Deposits" value={reportData.capitalFlow.depositCount} isCurrency={false} />
                                <StatItem label="Total Withdrawals" value={reportData.capitalFlow.totalWithdrawals} />
                                <StatItem label="Number of Withdrawals" value={reportData.capitalFlow.withdrawalCount} isCurrency={false} />
                                <StatItem label="Net Capital Flow" value={reportData.capitalFlow.netFlow} highlight={true} />
                            </div>
                        </div>
                        <div className="admin-card">
                            <h4>Revenue & Distribution</h4>
                             <div className="details-grid">
                                <StatItem label="Total Strategy P&L Distributed" value={reportData.revenueAndDistribution.totalPnlDistributed} />
                                <StatItem label="Total Bonus Point Buybacks Paid" value={reportData.revenueAndDistribution.totalBuybacksPaid} />
                                <StatItem label="Deposit Fees Collected" value={reportData.revenueAndDistribution.fees.depositFees} />
                                <StatItem label="Performance Fees Collected" value={reportData.revenueAndDistribution.fees.performanceFees} />
                                <StatItem label="Total Fees Collected" value={reportData.revenueAndDistribution.fees.totalFees} />
                                <StatItem label="Platform Net (Fees - Buybacks)" value={reportData.revenueAndDistribution.platformNet} highlight={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PlatformReportsPage;
