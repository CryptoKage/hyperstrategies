// PASTE THIS ENTIRE CONTENT TO REPLACE: hyperstrategies/src/pages/Vault1Page.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, subtext = null, isCurrency = true }) => (
  <div className="profile-card">
    <h3>{label}</h3>
    <p className="stat-value-large">
      {isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
    </p>
    {subtext && <p className="stat-subtext">{subtext}</p>}
  </div>
);

const Vault1Page = () => {
  const { vaultId } = useParams();
  const { t } = useTranslation();
  const { isBalanceHidden } = useAuth();

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVaultDetails = useCallback(async () => {
    if (!vaultId) return;
    setLoading(true);
    try {
      const response = await api.get(`/vault-details/${vaultId}`);
      setPageData(response.data);
    } catch (err) {
      console.error(`Failed to fetch details for vault ${vaultId}:`, err);
      setError("Could not load vault details at this time.");
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchVaultDetails();
  }, [fetchVaultDetails]);

  const formatChartData = (data = []) => {
    return data.map(item => ({
      date: new Date(item.record_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      pnl: parseFloat(item.pnl_percentage).toFixed(2),
    })).reverse();
  };
  
  const getCoinGeckoLink = (symbol) => {
      const cgMap = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'SOL': 'solana',
          'USDC': 'usd-coin'
      };
      const id = cgMap[symbol.toUpperCase()];
      return id ? `https://www.coingecko.com/en/coins/${id}` : '#';
  };

  if (loading) {
    return <Layout><div className="vault-detail-container"><h1>Loading Vault Details...</h1></div></Layout>;
  }
  
  // ==============================================================================
  // --- BUG FIX: Add a more robust check to prevent rendering with null data ---
  // This ensures that even if loading is false, we don't try to render until pageData exists.
  // ==============================================================================
  if (error || !pageData) {
    return <Layout><div className="vault-detail-container"><p className="error-message">{error || 'No data found for this vault.'}</p></div></Layout>;
  }

  // --- BUG FIX: Provide default empty values when destructuring ---
  // This prevents the app from crashing if any part of the API response is missing.
  const { 
    vaultInfo = {}, 
    userPosition = null, // Can be null if not invested
    performanceHistory = [], 
    assetBreakdown = [], 
    userLedger = [], 
    vaultStats = {} 
  } = pageData;
  // ==============================================================================
  // --- END OF FIX ---
  // ==============================================================================

  const isInvested = userPosition && userPosition.totalCapital > 0;

  return (
    <Layout>
      <div className="vault-detail-container">
        <div className="vault-detail-header">
          <h1>{vaultInfo.name || 'Vault Details'}</h1>
          <Link to="/dashboard" className="btn-secondary btn-sm">← Back to Dashboard</Link>
        </div>
        <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
        
        <div className="vault-detail-grid three-col">
            <StatCard label="Total Value Locked" value={vaultStats.totalValueLocked} subtext="The current Net Asset Value (NAV) of the vault." />
            <StatCard label="Capital in Transit" value={vaultStats.capitalInTransit} subtext="User deposits waiting to be swept into trades." />
            <StatCard label="Total Principal" value={vaultStats.totalPrincipal} subtext="Total user capital deposited into the vault." />
        </div>

        <div className="vault-detail-grid">
          {isInvested && (
            <div className="profile-card">
              <h3>Your Position</h3>
              <div className="stat-item"><span>Total Capital</span><span>{isBalanceHidden ? '******' : `$${userPosition.totalCapital.toFixed(2)}`}</span></div>
              <div className="stat-item"><span>Unrealized P&L</span><span className={userPosition.totalPnl >= 0 ? 'text-positive' : 'text-negative'}>{isBalanceHidden ? '******' : `${userPosition.totalPnl >= 0 ? '+' : ''}$${userPosition.totalPnl.toFixed(2)}`}</span></div>
            </div>
          )}
          
          <div className="profile-card">
            <h3>Asset Breakdown</h3>
            <div className="table-responsive-wrapper">
                <table className="asset-table">
                    <thead>
                        <tr><th>Asset</th><th className="amount">Live Price</th><th className="amount">Target Weight</th></tr>
                    </thead>
                    <tbody>
                        {assetBreakdown.length > 0 ? (
                        assetBreakdown.map(asset => (
                            <tr key={asset.symbol}>
                                <td>
                                    <a href={getCoinGeckoLink(asset.symbol)} target="_blank" rel="noopener noreferrer" className="asset-link">{asset.symbol} ↗</a>
                                </td>
                                <td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                                <td className="amount">{(asset.weight * 100).toFixed(0)}%</td>
                            </tr>
                        ))
                        ) : (<tr><td colSpan="3">Asset allocation is not currently specified.</td></tr>)}
                    </tbody>
                </table>
            </div>
          </div>

          <div className="profile-card full-width">
            <h3>Performance (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatChartData(performanceHistory)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                <YAxis stroke="var(--color-text-secondary)" unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
                <Legend />
                <Line type="monotone" dataKey="pnl" name="Vault P&L (%)" stroke="#4ade80" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {isInvested && userLedger.length > 0 && (
            <div className="profile-card full-width">
              <h3>Your Transaction History</h3>
              <div className="table-responsive-wrapper">
                <table className="activity-table">
                  <thead><tr><th>Date</th><th>Type</th><th>Status</th><th className="amount">Amount</th></tr></thead>
                  <tbody>
                    {userLedger.map(entry => (
                      <tr key={entry.entry_id}>
                        <td>{new Date(entry.created_at).toLocaleString()}</td>
                        <td>{entry.entry_type.replace(/_/g, ' ')}</td>
                        <td><span className={`status-badge status-${entry.status.toLowerCase()}`}>{entry.status}</span></td>
                        <td className={`amount ${parseFloat(entry.amount) >= 0 ? 'text-positive' : 'text-negative'}`}>{`${parseFloat(entry.amount) > 0 ? '+' : ''}${parseFloat(entry.amount).toFixed(2)}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Vault1Page;
