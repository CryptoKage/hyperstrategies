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

  const [buybackAmount, setBuybackAmount] = useState('');
  const [isBuyingBack, setIsBuyingBack] = useState(false);
  const [buybackMessage, setBuybackMessage] = useState({ type: '', text: '' });

  const fetchReport = useCallback(async () => {
    if (!report) setLoading(true);
    try {
      const response = await api.get('/admin/treasury-report');
      setReport(response.data);
    } catch (err) {
      setError('Failed to fetch treasury report.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [report]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);
  
  const handleBuyback = async (e) => {
    e.preventDefault();
    setIsBuyingBack(true);
    setBuybackMessage({ type: '', text: '' });
    try {
      const response = await api.post('/admin/buyback-points', {
        buybackAmountUSD: buybackAmount,
      });
      setBuybackMessage({ type: 'success', text: response.data.message });
      setBuybackAmount('');
      fetchReport();
    } catch (err) {
      setBuybackMessage({ type: 'error', text: err.response?.data?.message || 'An unexpected error occurred.' });
    } finally {
      setIsBuyingBack(false);
    }
  };

  const renderContent = () => {
    if (loading) return <p>Loading Treasury Report...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!report) return <p>No data available.</p>;

    // --- THE FIX ---
    // Safely calculate available funds using optional chaining (?.)
    const availableForBuyback = 
      (report.ledgers?.COMMUNITY_GROWTH_INCENTIVES || 0) + 
      (report.ledgers?.DEPOSIT_FEES_BUYBACK || 0);

    return (
      <>
        <div className="admin-actions-card">
          <h3>Bonus Point Buy-Back</h3>
          <p>Use funds from the Community Growth & Buyback ledgers to buy back Bonus Points from users. This will credit their main balance with USDC and award them XP.</p>
          <div className="stat-card" style={{ marginBottom: '24px' }}>
            <span className="stat-label">Funds Available for Buy-Back</span>
            <span className="stat-value">${availableForBuyback.toFixed(2)}</span>
          </div>
          <form onSubmit={handleBuyback} className="admin-form">
            <div className="form-group">
              <label htmlFor="buyback-amount">Amount to Use (USDC)</label>
              <input
                id="buyback-amount"
                type="number"
                step="0.01"
                placeholder="e.g., 500.00"
                value={buybackAmount}
                onChange={(e) => setBuybackAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isBuyingBack || !buybackAmount || parseFloat(buybackAmount) <= 0 || parseFloat(buybackAmount) > availableForBuyback}>
              {isBuyingBack ? 'Processing...' : 'Execute Buy-Back'}
            </button>
          </form>
          {buybackMessage.text && (
            <p className={`admin-message ${buybackMessage.type}`}>
              {buybackMessage.text}
            </p>
          )}
        </div>

        <h2>Platform Revenue Totals</h2>
        <div className="stats-grid">
          <StatCard label="Total From Deposit Fees" value={report.revenue?.depositFees || 0} />
          <StatCard label="Total From Performance Fees" value={report.revenue?.performanceFees || 0} />
          <StatCard label="Grand Total Revenue" value={report.revenue?.total || 0} variant="highlight" />
        </div>

        <h2 style={{ marginTop: '48px' }}>Deposit Fee Allocation</h2>
        <p className="admin-subtitle">Breakdown of how Deposit Fee revenue is allocated for TGE and growth.</p>
        <div className="stats-grid-small">
          <StatCard label="Initial LP Seeding (1%)" value={report.ledgers?.DEPOSIT_FEES_LP_SEEDING || 0} />
          <StatCard label="LP Farming Rewards (15%)" value={report.ledgers?.DEPOSIT_FEES_LP_REWARDS || 0} />
          <StatCard label="Team & Advisors (25%)" value={report.ledgers?.DEPOSIT_FEES_TEAM || 0} />
          <StatCard label="Treasury & Growth (20%)" value={report.ledgers?.DEPOSIT_FEES_TREASURY || 0} />
          <StatCard label="Community Reserve (20%)" value={report.ledgers?.DEPOSIT_FEES_COMMUNITY || 0} />
          <StatCard label="Buyback Mechanic (10%)" value={report.ledgers?.DEPOSIT_FEES_BUYBACK || 0} />
          <StatCard label="Strategic Reserve (9%)" value={report.ledgers?.DEPOSIT_FEES_STRATEGIC || 0} />
        </div>

        <h2 style={{ marginTop: '48px' }}>Performance Fee Allocation</h2>
        <p className="admin-subtitle">Breakdown of how ongoing Performance Fee revenue is allocated.</p>
        <div className="stats-grid">
          <StatCard label="Treasury & Foundation (60%)" value={report.ledgers?.TREASURY_FOUNDATION || 0} />
          <StatCard label="Operations & Dev (25%)" value={report.ledgers?.OPERATIONS_DEVELOPMENT || 0} />
          <StatCard label="Trading Team Bonus (10%)" value={report.ledgers?.TRADING_TEAM_BONUS || 0} />
          <StatCard label="Community Growth / Buybacks (5%)" value={report.ledgers?.COMMUNITY_GROWTH_INCENTIVES || 0} />
        </div>

        <h2 style={{ marginTop: '48px' }}>Platform Liabilities</h2>
        <div className="stats-grid">
          <StatCard label="User Capital in Vaults" value={report.liabilities?.userCapitalInVaults || 0} note="Total user funds currently under management." variant="warning" />
          <StatCard label="Outstanding Bonus Points" value={report.liabilities?.bonusPoints || 0} note="Represents a future liability to be bought back." variant="warning" />
        </div>

        <h2 style={{ marginTop: '48px' }}>Summary</h2>
        <div className="stats-grid">
           <StatCard label="Net Position" value={report.netPosition || 0} note="Total Revenue minus Bonus Point Liability. A measure of platform profitability before operational costs." variant={(report.netPosition || 0) >= 0 ? 'highlight' : 'warning'} />
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