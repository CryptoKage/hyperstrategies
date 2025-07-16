// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sweepStatus, setSweepStatus] = useState(''); // Added for manual trigger
  const [isSweeping, setIsSweeping] = useState(false); // Added for manual trigger

  const fetchAdminStats = useCallback(async () => {
    // Corrected the infinite loop bug by removing [loading] dependency
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      setError(err.response?.data?.error || "Could not load admin data.");
      setStats(err.response?.data || { databaseConnected: false, alchemyConnected: false });
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array makes it stable

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const handleTriggerSweep = useCallback(async () => {
    setIsSweeping(true);
    setSweepStatus('Triggering job...');
    try {
      const response = await api.post('/admin/trigger-sweep');
      setSweepStatus(response.data.message);
      // Optionally, refresh stats after a short delay
      setTimeout(fetchAdminStats, 3000);
    } catch (err) {
      setSweepStatus('Failed to trigger job.');
    } finally {
      setIsSweeping(false);
    }
  }, [fetchAdminStats]);

  const StatCard = ({ label, value, currency = false }) => (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {currency && '$'}
        {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (value || '0.00')}
      </span>
    </div>
  );
  
  const StatusIndicator = ({ label, isUp }) => (
    <div className="status-indicator">
      <span className={`status-light ${isUp ? 'up' : 'down'}`}></span>
      <span>{label}</span>
    </div>
  );
  
  const renderContent = () => {
    if (loading && !stats) {
      return <p>Loading Admin Dashboard...</p>;
    }
    if (error && !stats) {
      return <p className="error-message">{error}</p>;
    }
    if (!stats) {
      return <p>No data available.</p>;
    }
    
    return (
      <>
        <div className="system-status-bar">
          <StatusIndicator label="Backend API" isUp={!error} />
          <StatusIndicator label="Database" isUp={stats.databaseConnected} />
          <StatusIndicator label="Alchemy API" isUp={stats.alchemyConnected} />
        </div>

        {error && !loading && <p className="error-message">{error}</p>}

        <div className="stats-grid">
          <StatCard label="Total Users" value={stats.userCount} />
          <StatCard label="Total Available Capital" value={stats.totalAvailable} currency />
          <StatCard label="Total Capital in Vaults" value={stats.totalInVaults} currency />
          <StatCard label="Hot Wallet Gas (ETH)" value={parseFloat(stats.hotWalletBalance)} />
        </div>

        <div className="admin-actions-card">
          <h3>Manual Job Triggers</h3>
          <p>Manually run a scheduled job. This is useful for immediate processing or testing.</p>
          <div className="action-button-row">
            <button className="btn-primary" onClick={handleTriggerSweep} disabled={isSweeping}>
              {isSweeping ? 'Job Started...' : 'Trigger Allocation Sweep'}
            </button>
            {sweepStatus && <span className="action-status">{sweepStatus}</span>}
          </div>
        </div>

        <div className="admin-grid">
          <div className="activity-card">
            <h3>Recent Deposits</h3>
            {stats.recentDeposits && stats.recentDeposits.length > 0 ? (
              <table className="activity-table">
                <tbody>
                  {stats.recentDeposits.map((item, index) => (
                    <tr key={`dep-${index}`}>
                      <td><strong>{item.username}</strong> deposited</td>
                      <td className="amount">${parseFloat(item.amount).toFixed(2)} {item.token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No recent deposits.</p>}
          </div>

          <div className="activity-card">
            <h3>Recent Withdrawal Requests</h3>
            {stats.recentWithdrawals && stats.recentWithdrawals.length > 0 ? (
              <table className="activity-table">
                <tbody>
                 {stats.recentWithdrawals.map((item, index) => (
                  <tr key={`wd-${index}`}>
                    <td><strong>{item.username}</strong> requested</td>
                    <td className="amount">${parseFloat(item.amount).toFixed(2)} {item.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : <p>No recent withdrawal requests.</p>}
          </div>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="wallet-header">
            <h1>Admin Mission Control</h1>
            <button onClick={fetchAdminStats} className="btn-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;