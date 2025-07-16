// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Your data fetching logic is correct, just making the dependency array stable.
  const fetchAdminStats = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      // Use the error data from the API if it exists
      setError(err.response?.data?.error || "Could not load admin data.");
      // Also set a default stats object so the UI can render the status lights correctly
      setStats(err.response?.data || { databaseConnected: false, alchemyConnected: false });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  // A reusable component for the stat cards
  const StatCard = ({ label, value, currency = false }) => (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {currency && '$'}
        {/* Added a check for null/undefined before formatting */}
        {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (value || '0.00')}
      </span>
    </div>
  );
  
  // A new component for the status lights
  const StatusIndicator = ({ label, isUp }) => (
    <div className="status-indicator">
      <span className={`status-light ${isUp ? 'up' : 'down'}`}></span>
      <span>{label}</span>
    </div>
  );
  
  const renderContent = () => {
    if (loading) {
      return <p>Loading Admin Dashboard...</p>;
    }
    // We can still render part of the page even if there's an error
    if (error && !stats) {
      return <p className="error-message">{error}</p>;
    }
    
    return (
      <>
        {/* --- The New System Status Bar --- */}
        <div className="system-status-bar">
          <StatusIndicator label="Backend API" isUp={!error} />
          <StatusIndicator label="Database" isUp={stats.databaseConnected} />
          <StatusIndicator label="Alchemy API" isUp={stats.alchemyConnected} />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="stats-grid">
          <StatCard label="Total Users" value={stats.userCount} />
          <StatCard label="Total Available Capital" value={stats.totalAvailable} currency />
          <StatCard label="Total Capital in Vaults" value={stats.totalInVaults} currency />
          {/* --- The New Hot Wallet Balance Card --- */}
          <StatCard label="Hot Wallet Gas (ETH)" value={parseFloat(stats.hotWalletBalance)} />
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
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;