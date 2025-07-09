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
  
  // Initialize with a default structure to prevent rendering errors
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

  // --- Data Fetching with Performance Logging ---
  const fetchDashboardData = useCallback(async () => {
    console.log('[Dashboard] 🚀 Starting data fetch...');
    console.time("DashboardDataFetchTime"); // 1. START the timer
    
    // We don't set loading to true on subsequent refreshes to keep the UI responsive
    
    try {
      const response = await api.get('/dashboard');
      console.log('[Dashboard] ✅ API response received:', response.data);
      setDashboardData(response.data);
      setError(''); // Clear previous errors on success
    } catch (err) {
      console.error('[Dashboard] ❌ API call failed:', err);
      setError('Could not fetch dashboard data.');
    } finally {
      // On initial load, turn off the main skeleton loading state
      if (loading) setLoading(false);
      console.timeEnd("DashboardDataFetchTime"); // 2. STOP the timer and print duration
    }
  }, [loading]);

  // This useEffect runs only once when the component first mounts
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Modal Handlers ---
  const handleOpenAllocateModal = (vault) => {
    setSelectedVault(vault);
    setAllocateModalOpen(true);
  };
  const handleOpenWithdrawModal = (vault) => {
    setSelectedVault(vault);
    setWithdrawModalOpen(true);
  };

  // This function is passed to both modals to refresh data after a successful action
  const handleActionSuccess = () => {
    console.log('[Dashboard] 🔄 Action successful, refreshing dashboard data...');
    fetchDashboardData();
  };

  // --- Skeleton Component for Loading State ---
  const StatCardSkeleton = () => (
    <div className="stat-card skeleton">
      <div className="skeleton-text short"></div>
      <div className="skeleton-text long"></div>
    </div>
  );

  // --- Main Render Logic ---
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
    
    if (error) {
      return <p className="error-message">{error}</p>;
    }

    const investedVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) > 0);
    const availableVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) <= 0);

    return (
      <>
        <div className="stats-grid">
          {/* ... stat cards ... */}
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