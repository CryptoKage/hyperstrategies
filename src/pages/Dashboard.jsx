// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';
import WithdrawalHistory from '../components/WithdrawalHistory'; // Keep for future use

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  // ✅ THE FIX: The dependency array for useCallback is now empty [].
  // This makes the function "stable" - it's created only once and never changes.
  const fetchDashboardData = useCallback(async () => {
    setLoading(true); // Always set loading to true when we begin a fetch
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      setError('Could not fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false); // Always set loading to false when we're done
    }
  }, []); // Empty array means this function is stable.

  // This useEffect now runs only once on initial component load.
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenModal = (vault) => {
    setSelectedVault(vault);
    setIsModalOpen(true);
  };

  const handleCopyToClipboard = () => {
    if (dashboardData?.depositAddress) {
      navigator.clipboard.writeText(dashboardData.depositAddress);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  // This function is passed to the modal and will refresh data on success
  const handleAllocationSuccess = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <Layout><div className="dashboard-container"><h1>Loading Dashboard...</h1></div></Layout>;
  }

  if (error || !dashboardData) {
    return <Layout><div className="dashboard-container"><p className="error-message">{error || 'No data available.'}</p></div></Layout>;
  }

  const investedVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) > 0);
  const availableVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) <= 0);

  return (
    <>
      <Layout>
        <div className="dashboard-container">
          <h1>Welcome back, {user?.username || 'User'}!</h1>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Portfolio Value</span>
              <span className="stat-value">${(dashboardData.totalPortfolioValue || 0).toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Available to Allocate</span>
              <span className="stat-value">${(dashboardData.availableBalance || 0).toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Bonus Points Value</span>
              <span className="stat-value">${(dashboardData.totalBonusPoints || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <h2>Available Strategies</h2>
          <div className="vaults-grid">
            {availableVaults.map(vault => (
              <div key={vault.vault_id} className="vault-card cta">
                <h3>{vault.name}</h3>
                <p className="cta-text">{vault.description}</p>
                <div className="vault-actions">
                    <button className="btn-primary" onClick={() => handleOpenModal(vault)}>
                    Allocate Funds
                    </button>
                </div>
              </div>
            ))}
          </div>

          {investedVaults.length > 0 && (
            <>
              <h2>Your Positions</h2>
              <div className="vaults-grid">
                {investedVaults.map(vault => (
                  <div key={vault.vault_id} className="vault-card">
                    <h3>{vault.name}</h3>
                    <div className="vault-stat">
                      <span>Tradable Capital</span>
                      <span>${parseFloat(vault.tradable_capital).toFixed(2)}</span>
                    </div>
                    <div className="vault-stat">
                      <span>Unrealized P&L</span>
                      <span className={parseFloat(vault.pnl) >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                        {parseFloat(vault.pnl) >= 0 ? '+' : ''}${parseFloat(vault.pnl).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Layout>

      <VaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vault={selectedVault}
        availableBalance={dashboardData.availableBalance || 0}
        onAllocationSuccess={handleAllocationSuccess}
      />
    </>
  );
};

export default Dashboard;