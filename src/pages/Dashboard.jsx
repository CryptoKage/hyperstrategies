// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('Could not fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Layout><div className="dashboard-container"><h1>Loading...</h1></div></Layout>;
  }

  if (error) {
    return <Layout><div className="dashboard-container"><p className="error-message">{error}</p></div></Layout>;
  }

  if (!dashboardData) {
    return <Layout><div className="dashboard-container"><p className="error-message">Could not load user data.</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Welcome back, {user?.username || 'User'}!</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Portfolio Value</span>
            <span className="stat-value">${dashboardData.totalPortfolioValue.toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available Balance</span>
            <span className="stat-value">${dashboardData.availableBalance.toFixed(2)}</span>
          </div>
        </div>

        <h2>Your Vaults</h2>
        <div className="vaults-grid">
          {dashboardData.vaults.map(vault => (
            <div key={vault.vault_id} className="vault-card">
              <h3>{vault.name}</h3>
              <div className="vault-stat">
                <span className="stat-label">Your Position</span>
                <span>${parseFloat(vault.amount_deposited).toFixed(2)}</span>
              </div>
              <div className="vault-stat">
                <span className="stat-label">Your P&L</span>
                <span className={parseFloat(vault.pnl) >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                  {parseFloat(vault.pnl) >= 0 ? '+' : ''}${parseFloat(vault.pnl).toFixed(2)}
                </span>
              </div>
              <div className="vault-actions">
                <button className="btn-secondary">Add Funds</button>
                <button className="btn-secondary">Withdraw</button>
              </div>
            </div>
          ))}
          {!dashboardData.vaults.find(v => v.vault_id === 1) && (
            <div className="vault-card cta">
              <h3>Derivatives Vault</h3>
              <p className="cta-text">Actively traded derivatives for all market conditions. Start your investment today.</p>
              <div className="vault-actions">
                <button className="btn-primary">Invest Now</button>
              </div>
            </div>
          )}
          <div className="vault-card placeholder">
            <h3>Long-Term Hold Vault</h3>
            <span className="placeholder-text">Coming Soon</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// The corrected line
export default Dashboard;