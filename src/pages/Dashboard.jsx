// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      setError('Could not fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenModal = (vault) => {
    setSelectedVault(vault);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVault(null);
    setIsModalOpen(false);
  };

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
  const isNewUser = dashboardData.totalPortfolioValue === 0;

  return (
    <>
      <Layout>
        <div className="dashboard-container">
          <h1>Welcome back, {user?.username || 'User'}!</h1>

          {isNewUser ? (
            <div className="new-user-cta">
              <h2>Ready to Get Started?</h2>
              <p>Your first step is to fund your account. Go to your wallet to find your unique deposit address.</p>
              <button className="btn-primary btn-large" onClick={() => navigate('/wallet')}>
                Go to Wallet
              </button>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Portfolio Value</span>
                  <span className="stat-value">${(dashboardData.totalPortfolioValue || 0).toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Available to Allocate</span>
                  <div className="stat-main">
                    <span className="stat-value">${(dashboardData.availableBalance || 0).toFixed(2)}</span>
                    <button onClick={() => navigate('/wallet')} className="btn-link">Manage</button>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Bonus Points Value</span>
                  <span className="stat-value">${(dashboardData.totalBonusPoints || 0).toFixed(2)}</span>
                </div>
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
                        <div className="vault-actions">
                          <button className="btn-secondary" onClick={() => handleOpenModal(vault)}>Add Funds</button>
                          <button className="btn-secondary" onClick={() => navigate('/wallet')}>Withdraw</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 style={{ marginTop: '48px' }}>Available Strategies</h2>
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
            </>
          )}
        </div>
      </Layout>

      <VaultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vault={selectedVault}
        availableBalance={dashboardData.availableBalance || 0}
        onAllocationSuccess={handleAllocationSuccess}
      />
    </>
  );
};

export default Dashboard;