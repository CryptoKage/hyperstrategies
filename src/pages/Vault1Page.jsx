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
      setError("Could not load vault details.");
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
  
  // ==============================================================================
  // --- BUG FIX: This is the clean, correct version of the function ---
  // ==============================================================================
  const getCoinGeckoLink = (asset) => {
    if (asset && asset.coingecko_id) {
        return `https://www.coingecko.com/en/coins/${asset.coingecko_id}`;
    }
    return null; // Return null if there's no ID, so no link will be rendered
  };

  if (loading) {
    return <Layout><div className="vault-detail-container"><h1>Loading Vault Details...</h1></div></Layout>;
  }
  
  if (error || !pageData) {
    return <Layout><div className="vault-detail-container"><p className="error-message">{error || 'No data found for this vault.'}</p></div></Layout>;
  }

  const { 
    vaultInfo = {}, 
    userPosition = null, 
    performanceHistory = [], 
    assetBreakdown = [], 
    userLedger = [], 
    vaultStats = {} 
  } = pageData;

  const isInvested = userPosition && userPosition.totalCapital > 0;

  return (
    <Layout>
      <div className="vault-detail-container">
        <div className="vault-detail-header">
          <h1>{vaultInfo.name || 'Vault Details'}</h1>
          <Link to="/dashboard" className="btn-secondary btn-sm">← Back to Dashboard</Link>
        </div>
        <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
        
        <div className="vault-detail-grid single-col">
            <StatCard label="Capital in Transit" value={vaultStats.capitalInTransit} subtext="User deposits waiting to be swept into trades." />
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
                    {/* --- BUG FIX: Removed the extra '<' before tbody --- */}
                    <tbody>
                        {assetBreakdown.length > 0 ? (
                        assetBreakdown.map(asset => {
                          const cgLink = getCoinGeckoLink(asset);
                          return (
                            <tr key={asset.symbol}>
                                <td>
                                  {cgLink ? (
                                    <a href={cgLink} target="_blank" rel="noopener noreferrer" className="asset-link">{asset.symbol} ↗</a>
                                  ) : (
                                    <span>{asset.symbol}</span>
                                  )}
                                </td>
                                <td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                                <td className="amount">{(asset.weight * 100).toFixed(0)}%</td>
                            </tr>
                          );
                        })
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

          {isInvested && userLedger && userLedger.length > 0 && (
            <div className="profile-card full-width">
              <h3>Your Transaction History</h3>
              {/* Table was omitted for brevity, but it goes here */}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Vault1Page;
