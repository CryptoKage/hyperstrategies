// src/pages/admin/TreasuryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const StatCard = ({ label, value, note, variant = '' }) => (
  <div className={`stat-card ${variant}`}>
    <span className="stat-label">{label}</span>
    <span className="stat-value">
      ${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
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
    } catch (err) { // This is the corrected line
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
        <h2>Platform Revenue Totals</h2>
        <div className="stats-grid">
          <StatCard label="Total From Deposit Fees" value={report.revenue.depositFees} />
          <StatCard label="Total From Performance Fees" value={report.revenue.performanceFees} />
          <StatCard label="Grand Total Revenue" value={report.revenue.total} variant="highlight" />
        </div>

        <h2 style={{ marginTop: '48px' }}>Deposit Fee Allocation</h2>
        <p className="admin-subtitle">Breakdown of how Deposit Fee revenue is allocated for TGE and growth.</p>
        <div className="stats-grid-small">
          <StatCard label="Initial LP Seeding (1%)" value={report.ledgers.DEPOSIT_FEES_LP_SEEDING || 0} />
          <StatCard label="LP Farming Rewards (15%)" value={report.ledgers.DEPOSIT_FEES_LP_REWARDS || 0} />
          <StatCard label="Team & Advisors (25%)" value={report.ledgers.DEPOSIT_FEES_TEAM || 0} />
          <StatCard label="Treasury & Growth (20%)" value={report.ledgers.DEPOSIT_FEES_TREASURY || 0} />
          <StatCard label="Community Reserve (20%)" value={report.ledgers.DEPOSIT_FEES_COMMUNITY || 0} />
          <StatCard label="Buyback Mechanic (10%)" value={report.ledgers.DEPOSIT_FEES_BUYBACK || 0} />
          <StatCard label="Strategic Reserve (9%)" value={report.ledgers.DEPOSIT_FEES_STRATEGIC || 0} />
        </div>

        <h2 style={{ marginTop: '48px' }}>Performance Fee Allocation</h2>
        <p className="admin-subtitle">Breakdown of how ongoing Performance Fee revenue is allocated.</p>
        <div className="stats-grid">
          <StatCard label="Treasury & Foundation (60%)" value={report.ledgers.TREASURY_FOUNDATION || 0} />
          <StatCard label="Operations & Dev (25%)" value={report.ledgers.OPERATIONS_DEVELOPMENT || 0} />
          <StatCard label="Trading Team Bonus (10%)" value={report.ledgers.TRADING_TEAM_BONUS || 0} />
          <StatCard label="Community Growth / Buybacks (5%)" value={report.ledgers.COMMUNITY_GROWTH_INCENTIVES || 0} />
        </div>

        <h2 style={{ marginTop: '48px' }}>Platform Liabilities</h2>
        <div className="stats-grid">
          <StatCard label="User Capital in Vaults" value={report.liabilities.userCapitalInVaults} note="Total user funds currently under management." variant="warning" />
          <StatCard label="Outstanding Bonus Points" value={report.liabilities.bonusPoints} note="Represents a future liability to be bought back." variant="warning" />
        </div>

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