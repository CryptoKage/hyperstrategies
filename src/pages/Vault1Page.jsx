import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

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
    console.log(`[Debug] Starting fetch for vaultId: ${vaultId}`); // <-- Log 1
    try {
      const response = await api.get(`/vault-details/${vaultId}`);
      
      // --- THIS IS THE CRITICAL LOG ---
      // Let's see the raw data the backend is sending us.
      console.log("[Debug] Raw API response data:", response.data); // <-- Log 2
      
      setPageData(response.data);
      console.log("[Debug] State has been set. Component should re-render."); // <-- Log 3

    } catch (err) {
      console.error(`[Debug] Failed to fetch details for vault ${vaultId}:`, err);
      setError("Could not load vault details at this time.");
    } finally {
      setLoading(false);
      console.log("[Debug] Loading state set to false."); // <-- Log 4
    }
  }, [vaultId]);

  useEffect(() => {
    fetchVaultDetails();
  }, [fetchVaultDetails]);

  const formatChartData = (data = []) => {
    return data.map(item => ({
      date: new Date(item.record_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      pnl: parseFloat(item.pnl_percentage).toFixed(2),
    })).reverse(); // Reverse to show oldest data first on the chart
  };

  if (loading) {
    return <Layout><div className="vault-detail-container"><h1>Loading Vault Details...</h1></div></Layout>;
  }
  if (error || !pageData) {
    return <Layout><div className="vault-detail-container"><p className="error-message">{error || 'No data found for this vault.'}</p></div></Layout>;
  }

  const { vaultInfo, userPosition, performanceHistory, assetBreakdown, userLedger } = pageData;

  return (
    <Layout>
      <div className="vault-detail-container">
        <div className="vault-detail-header">
          <h1>{vaultInfo.name}</h1>
          <Link to="/dashboard" className="btn-secondary btn-sm">← Back to Dashboard</Link>
        </div>
        <p className="vault-detail-subtitle">{vaultInfo.description}</p>
        
        <div className="vault-detail-grid">
          <div className="profile-card">
            <h3>Your Position</h3>
            <div className="stat-item"><span>Total Capital</span><span>{isBalanceHidden ? '******' : `$${userPosition.totalCapital.toFixed(2)}`}</span></div>
            <div className="stat-item"><span>Unrealized P&L</span><span className={userPosition.totalPnl >= 0 ? 'text-positive' : 'text-negative'}>{isBalanceHidden ? '******' : `${userPosition.totalPnl >= 0 ? '+' : ''}$${userPosition.totalPnl.toFixed(2)}`}</span></div>
          </div>
          
          <div className="profile-card">
            <h3>Asset Breakdown</h3>
            {assetBreakdown.length > 0 ? (
              assetBreakdown.map(asset => (
                <div key={asset.symbol} className="stat-item"><span>{asset.symbol}</span><span>{(asset.weight * 100).toFixed(0)}%</span></div>
              ))
            ) : (<p>Asset allocation is not currently specified.</p>)}
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
                <Line type="monotone" dataKey="pnl" name="Daily P&L (%)" stroke="#4ade80" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

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
        </div>
      </div>
    </Layout>
  );
};

export default Vault1Page;
