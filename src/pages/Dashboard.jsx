// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      setError('Could not fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenModal = (vault) => {
    setSelectedVault(vault);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVault(null);
    setIsModalOpen(false);
  };

  const handleInvestmentSuccess = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <Layout><div className="dashboard-container"><h1>Loading...</h1></div></Layout>;
  }
  if (error || !dashboardData) {
    return <Layout><div className="dashboard-container"><p className="error-message">{error || 'Could not load data.'}</p></div></Layout>;
  }

  // This logic correctly gets only the vaults the user has invested in.
  const investedVaults = dashboardData.vaults.filter(v => parseFloat(v.amount_deposited) > 0);
  // This logic gets the vaults that are available for new investment.
  const availableVaults = dashboardData.vaults.filter(v => parseFloat(v.amount_deposited) <= 0);

  return (
    <>
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
            <div className="stat-card">
              <span className="stat-label">Loyalty Points</span>
              <span className="stat-value">${dashboardData.totalLoyaltyPoints.toFixed(2)}</span>
            </div>
          </div>

          {/* This section only renders if the user has active investments */}
          {investedVaults.length > 0 && (
            <>
              <h2>Your Investments</h2>
              <div className="vaults-grid">
                {investedVaults.map(vault => (
                  <div key={vault.vault_id} className="vault-card">
                    <h3>{vault.name}</h3>
                    <div className="vault-stat">
                      <span className="stat-label">Tradable Capital</span>
                      <span>${parseFloat(vault.amount_deposited).toFixed(2)}</span>
                    </div>
                    <div className="vault-stat">
                      <span className="stat-label">Your P&L</span>
                      <span className={parseFloat(vault.pnl) >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                        {parseFloat(vault.pnl) >= 0 ? '+' : ''}${parseFloat(vault.pnl).toFixed(2)}
                      </span>
                    </div>
                    <div className="vault-actions">
                      <button className="btn-secondary" onClick={() => handleOpenModal(vault)}>Add Funds</button>
                      <button className="btn-secondary">Withdraw</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* This section shows vaults available to invest in */}
          <h2>Available Vaults</h2>
          <div className="vaults-grid">
            {availableVaults.map(vault => (
              <div key={vault.vault_id} className="vault-card cta">
                <h3>{vault.name}</h3>
                <p className="cta-text">{vault.description}</p>
                <div className="vault-actions">
                  <button className="btn-primary" onClick={() => handleOpenModal(vault)}>
                    Invest Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>

      <VaultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vault={selectedVault}
        onInvestmentSuccess={handleInvestmentSuccess}
      />
    </>
  );
};

export default Dashboard;