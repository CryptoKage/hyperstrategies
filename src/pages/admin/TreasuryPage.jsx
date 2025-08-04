// src/pages/admin/TreasuryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const StatCard = ({ label, value, note, variant = '' }) => (
  <div className={`stat-card ${variant}`}>
    <span className="stat-label">{label}</span>
    <span className="stat-value">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    {note && <p className="stat-note">{note}</p>}
  </div>
);


const TreasuryPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/treasury-report');
      setReport(response.data);
    } catch (err) {
      setError('Failed to fetch treasury report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const renderContent = () => {
    if (loading) return <p>Loading Treasury Report...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!report) return <p>No data available.</p>;

    return (
      <>
        {/* Revenue Section */}
        <h2>Platform Revenue</h2>
        <div className="stats-grid">
          <StatCard label="From Deposit Fees" value={report.revenue.depositFees} note="Represents the value of all Bonus Points issued." />
          <StatCard label="From Performance Fees" value={report.revenue.performanceFees} note="The platform's share of trading profits." />
          <StatCard label="Total Revenue" value={report.revenue.total} variant="highlight" />
        </div>

        {/* Liabilities Section */}
        <h2 style={{ marginTop: '48px' }}>Platform Liabilities</h2>
        <div className="stats-grid">
          <StatCard label="User Capital in Vaults" value={report.liabilities.userCapitalInVaults} note="Total user funds currently under management." variant="warning" />
          <StatCard label="Outstanding Bonus Points" value={report.liabilities.bonusPoints} note="Represents a future liability to be bought back." variant="warning" />
        </div>

        {/* Net Position Section */}
        <h2 style={{ marginTop: '48px' }}>Summary</h2>
        <div className="stats-grid">
           <StatCard label="Net Position" value={report.netPosition} note="Total Revenue minus Bonus Point Liability. A measure of platform profitability before operational costs." variant={report.netPosition >= 0 ? 'highlight' : 'warning'} />
        </div>
      </>
    );
  }

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Treasury & Business Report</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>
        
        <div className="admin-card">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default TreasuryPage;