// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';
import VaultWithdrawModal from '../components/VaultWithdrawModal';
import InfoIcon from '../components/InfoIcon'; // Import the InfoIcon

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
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
    
    if (error || !dashboardData) {
      return <p className="error-message">{error || 'Could not load data.'}</p>;
    }

    const investedVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) > 0);

    return (
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
              <div className="stat-label-with-icon">
                <span className="stat-label">Bonus Points Value</span>
                <Link to="/faq" className="info-icon-link" title="What are Bonus Points?">
                  <InfoIcon />
                </Link>
              </div>
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
          {dashboardData.vaults.map(vault => {
            if (investedVaults.find(v => v.vault_id === vault.vault_id)) return null;

            const isActive = vault.status === 'active';

            return (
              <div key={vault.vault_id} className={`vault-card ${isActive ? 'cta' : 'placeholder'}`}>
                <h3>{vault.name}</h3>
                <p className="cta-text">{vault.description}</p>
                <div className="vault-actions">
                  {isActive ? (
                    <button className="btn-primary" onClick={() => handleOpenAllocateModal(vault)}>
                      Allocate Funds
                    </button>
                  ) : (
                    <span className="placeholder-text">Coming Soon</span>
                  )}
                </div>
              </div>
            )
          })}
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

      {dashboardData && (
        <VaultModal
            isOpen={isAllocateModalOpen}
            onClose={() => setAllocateModalOpen(false)}
            vault={selectedVault}
            availableBalance={dashboardData.availableBalance}
            onAllocationSuccess={handleActionSuccess}
        />
      )}
      
      {dashboardData && (
        <VaultWithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            vault={selectedVault}
            onWithdrawalSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};

export default Dashboard;