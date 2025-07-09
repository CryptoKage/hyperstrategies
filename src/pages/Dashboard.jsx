// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';
import VaultWithdrawModal from '../components/VaultWithdrawModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    totalPortfolioValue: 0,
    availableBalance: 0,
    totalBonusPoints: 0,
    vaults: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!loading) setLoading(true);
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      setError('Could not fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenAllocateModal = (vault) => {
    setSelectedVault(vault);
    setAllocateModalOpen(true);
  };
  const handleOpenWithdrawModal = (vault) => {
    setSelectedVault(vault);
    setWithdrawModalOpen(true);
  };
  const handleActionSuccess = () => {
    fetchDashboardData();
  };

  const StatCardSkeleton = () => (
    <div className="stat-card skeleton">
      <div className="skeleton-text short"></div>
      <div className="skeleton-text long"></div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="stats-grid">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      );
    }
    
    if (error) { return <p className="error-message">{error}</p>; }

    const investedVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) > 0);
    const availableVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) <= 0);

    return (
      <>
        {/* ✅ THIS IS THE FIX: The missing JSX for the stat cards */}
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
            <h2 style={{ marginTop: '48px' }}>Your Positions</h2>
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
                    <button className="btn-secondary" onClick={() => handleOpenAllocateModal(vault)}>Add Funds</button>
                    <button className="btn-secondary" onClick={() => handleOpenWithdrawModal(vault)}>Withdraw</button>
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
                <button className="btn-primary" onClick={() => handleOpenAllocateModal(vault)}>
                  Allocate Funds
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <Layout>
        <div className="dashboard-container">
          <h1>Welcome back, {user?.username || 'User'}!</h1>
          {renderContent()}
        </div>
      </Layout>

      <VaultModal
        isOpen={isAllocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        vault={selectedVault}
        availableBalance={dashboardData.availableBalance}
        onAllocationSuccess={handleActionSuccess}
      />
      
      <VaultWithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        vault={selectedVault}
        onWithdrawalSuccess={handleActionSuccess}
      />
    </>
  );
};

export default Dashboard;