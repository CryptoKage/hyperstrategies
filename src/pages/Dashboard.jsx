// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';
import VaultWithdrawModal from '../components/VaultWithdrawModal'; // 1. Import the new modal

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for both modals
  const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false); // 2. New state for withdraw modal
  const [selectedVault, setSelectedVault] = useState(null);

  const fetchDashboardData = useCallback(async () => { /* ... same as before ... */ }, []);
  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleOpenAllocateModal = (vault) => {
    setSelectedVault(vault);
    setAllocateModalOpen(true);
  };

  // 3. New handler to open the withdraw modal
  const handleOpenWithdrawModal = (vault) => {
    setSelectedVault(vault);
    setWithdrawModalOpen(true);
  };

  // This single function can handle success for both allocating and withdrawing
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
    const availableVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) <= 0);

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
                    {/* ... pnl stat ... */}
                    <div className="vault-actions">
                      <button className="btn-secondary" onClick={() => handleOpenAllocateModal(vault)}>Add Funds</button>
                      {/* 4. This button now calls the correct handler */}
                      <button className="btn-secondary" onClick={() => handleOpenWithdrawModal(vault)}>Withdraw</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        <h2>Available Strategies</h2>
        <div className="vaults-grid">
            {/* ... your available vaults map ... */}
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
        availableBalance={dashboardData?.availableBalance || 0}
        onAllocationSuccess={handleActionSuccess}
      />
      
      {/* 5. Render the new withdraw modal, passing the correct props */}
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