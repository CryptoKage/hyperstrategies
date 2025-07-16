// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout'; // Note the path is different
import api from '../../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      setError("Could not load admin data. Ensure you have admin privileges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const StatCard = ({ label, value, currency = false }) => (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {currency && '$'}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
      </span>
    </div>
  );
  
  const renderContent = () => {
    if (loading) {
      return <p>Loading Admin Dashboard...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (!stats) {
      return <p>No data available.</p>;
    }

    return (
      <>
        <div className="stats-grid">
          <StatCard label="Total Users" value={stats.userCount} />
          <StatCard label="Total Available Capital" value={stats.totalAvailable} currency />
          <StatCard label="Total Capital in Vaults" value={stats.totalInVaults} currency />
          <StatCard label="Pending Withdrawals" value={stats.pendingWithdrawals} />
        </div>

        <div className="admin-grid">
          <div className="activity-card">
            <h3>Recent Deposits</h3>
            <table className="activity-table">
              <tbody>
                {stats.recentDeposits.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.username}</strong> deposited</td>
                    <td className="amount">${parseFloat(item.amount).toFixed(2)} {item.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="activity-card">
            <h3>Recent Withdrawal Requests</h3>
            <table className="activity-table">
              <tbody>
                 {stats.recentWithdrawals.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.username}</strong> requested</td>
                    <td className="amount">${parseFloat(item.amount).toFixed(2)} {item.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="admin-container">
        <h1>Admin Mission Control</h1>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;