// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';
import WithdrawalHistory from '../components/WithdrawalHistory'; // We'll show history here too

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  
  const [copySuccess, setCopySuccess] = useState('');

  const fetchDashboardData = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const response = await api.get('/dashboard');
      console.log("Dashboard API Response:", response.data); // Keep this for debugging
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

  const handleOpenModal = (vault) => {
    setSelectedVault(vault);
    setIsModalOpen(true);
  };
  
  const handleCopyToClipboard = () => {
    if (dashboardData?.depositAddress) { // Assuming backend sends this
      navigator.clipboard.writeText(dashboardData.depositAddress);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };


  if (loading) return <Layout><div className="dashboard-container"><h1>Loading Dashboard...</h1></div></Layout>;
  if (error) return <Layout><div className="dashboard-container"><p className="error-message">{error}</p></div></Layout>;
  if (!dashboardData) return <Layout><div className="dashboard-container"><p>No data available.</p></div></Layout>;

  const investedVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) > 0);
  const availableVaults = dashboardData.vaults.filter(v => parseFloat(v.tradable_capital) <= 0);

  return (
    <>
      <Layout>
        <div className="dashboard-container">
          <h1>Welcome back, {user?.username || 'User'}!</h1>
          
          <div className="stats-grid">
            {/* ... portfolio value stat card ... */}
            <div className="stat-card">
              <span className="stat-label">Available to Allocate</span>
              <span className="stat-value">${(dashboardData.availableBalance || 0).toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Bonus Points Value</span>
              <span className="stat-value">${(dashboardData.totalBonusPoints || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="address-section">
            <h2>Your Deposit Address</h2>
            <p className="address-subtext">Send USDC (Mainnet) to this address to fund your account.</p>
            <div className="address-box">
              {/* Assuming your /dashboard endpoint now returns user's eth_address */}
              <span className="eth-address">{dashboardData.depositAddress || 'Loading address...'}</span>
              <button onClick={handleCopyToClipboard} className="btn-copy">
                {copySuccess || 'Copy'}
              </button>
            </div>
          </div>

          <h2>Available Strategies</h2>
          <div className="vaults-grid">
            {availableVaults.map(vault => (
              <div key={vault.vault_id} className="vault-card cta">
                <h3>{vault.name}</h3>
                <p className="cta-text">{vault.description}</p>
                <button className="btn-primary" onClick={() => handleOpenModal(vault)}>
                  Allocate Funds
                </button>
              </div>
            ))}
          </div>

          {investedVaults.length > 0 && (
            <>
              <h2>Your Positions</h2>
              <div className="vaults-grid">{/* ... your invested vaults map ... */}</div>
            </>
          )}

          <WithdrawalHistory />
        </div>
      </Layout>

      <VaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vault={selectedVault}
        availableBalance={dashboardData.availableBalance || 0}
        onAllocationSuccess={fetchDashboardData}
      />
    </>
  );
};

export default Dashboard;