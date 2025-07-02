// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = async () => {
    try {
      const [dashboardRes, profileRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/auth/me')
      ]);

      setDashboardData(dashboardRes.data);
      setWalletAddress(profileRes.data.eth_address);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    const balance = parseFloat(dashboardData?.availableBalance);
    if (!withdrawAddress || isNaN(amount) || amount <= 0) {
      return alert('Please enter a valid address and amount.');
    }
    if (amount > balance) {
      return alert('Withdrawal amount exceeds available balance.');
    }
    api.post('/withdraw', { amount, toAddress: withdrawAddress })
      .then(() => {
        alert('Withdraw sent.');
        setShowWithdraw(false);
        fetchData();
      })
      .catch((err) => {
        console.error(err);
        alert('Error sending withdrawal.');
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    alert('Wallet address copied to clipboard');
  };

  if (loading) return <Layout><h1>Loading...</h1></Layout>;
  if (error || !dashboardData) return <Layout><p className="error-message">{error}</p></Layout>;

  const { totalPortfolioValue = 0, availableBalance = 0, vaults = [] } = dashboardData;

  return (
    <Layout>
      <div className="dashboard-container">
        <h1>Welcome back, {user?.username || 'User'}!</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Portfolio Value</span>
            <span className="stat-value">${Number(totalPortfolioValue).toFixed(2)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available Balance</span>
            <span className="stat-value">${Number(availableBalance).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={fetchData} className="btn-secondary">Refresh Balance</button>
        </div>

        <div className="wallet-section" style={{ marginTop: '2rem' }}>
          <h2>Your Wallet Address</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={handleCopy} className="btn-secondary">Copy Address</button>
            <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#fff', background: '#111', padding: '6px 12px', borderRadius: '6px' }}>{walletAddress}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowDeposit(!showDeposit)} className="btn-secondary">Deposit</button>
            <button onClick={() => setShowWithdraw(!showWithdraw)} className="btn-secondary">Withdraw</button>
          </div>

          {showDeposit && (
            <div style={{ marginTop: '1rem' }}>
              <QRCodeCanvas value={walletAddress} size={180} bgColor="#fff" fgColor="#000" />
              <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', color: '#ccc' }}>{walletAddress}</p>
            </div>
          )}

          {showWithdraw && (
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                placeholder="ETH Wallet Address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount to Withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <div>
                <button onClick={handleWithdraw} className="btn-primary">Withdraw</button>
                <button onClick={() => setShowWithdraw(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="pnl-chart-placeholder" style={{ marginTop: '2rem' }}>
          <h2>Performance Chart (PnL)</h2>
          <div style={{ border: '1px dashed #444', padding: '2rem', textAlign: 'center', color: '#888' }}>
            [ PnL Chart Coming Soon ]
          </div>
        </div>

        <h2 style={{ marginTop: '2rem' }}>Your Vaults</h2>
        <div className="vaults-grid">
          {vaults.map((vault) => (
            <div key={vault.vault_id} className="vault-card">
              <h3>{vault.name}</h3>
              <div className="vault-metric">
                <span className="metric-label">APY:</span>
                <span className="metric-value">
                  Avg X% / month <span className="metric-subvalue">(Y% / day)</span>
                </span>
              </div>
              <div className="vault-metric">
                <span className="metric-label">Status:</span>
                <span className={vault.status === 'open' ? 'status-open' : 'status-closed'}>
                  {vault.status === 'open' ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="vault-stat">
                <span className="stat-label">Your Position</span>
                <span>${Number(vault.amount_deposited).toFixed(2)}</span>
              </div>

              <div className="vault-stat">
                <span className="stat-label">Your P&L</span>
                <span className={Number(vault.pnl) >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                  {Number(vault.pnl) >= 0 ? '+' : ''}${Number(vault.pnl).toFixed(2)}
                </span>
              </div>
              <div className="vault-actions">
                <button className="btn-secondary">Add Funds</button>
                <button className="btn-secondary">Withdraw</button>
              </div>
            </div>
          ))}

          <div className="vault-card placeholder">
            <h3>Long-Term Hold Vault</h3>
            <span className="placeholder-text">Coming Soon</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;