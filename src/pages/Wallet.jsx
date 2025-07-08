// src/pages/Wallet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal';
import WithdrawalHistory from '../components/WithdrawalHistory';

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // We wrap this in useCallback to prevent it from being recreated on every render
  const fetchWalletData = useCallback(async () => {
    // Show loader on manual refresh clicks, but not on initial load
    if (!loading) setLoading(true); 
    try {
      const response = await api.get('/user/wallet');
      setWalletData(response.data);
      setError(''); // Clear previous errors on a successful fetch
    } catch (err) {
      setError('Could not fetch wallet data. Please try refreshing.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loading]); // Dependency on 'loading' state

  // Initial data fetch on component mount
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]); // Now depends on the stable fetchWalletData function

  const handleCopyToClipboard = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  // This function will be called by the modal on a successful withdrawal
  const handleWithdrawalQueued = () => {
    // Refresh all wallet data to show updated balances and history
    fetchWalletData();
  };

  const renderContent = () => {
    if (loading) {
      return <h1>Loading Wallet...</h1>;
    }
    if (error || !walletData) {
      return <p className="error-message">{error || 'Could not load wallet data.'}</p>;
    }

    return (
      <>
        <div className="wallet-header">
          <h1>Your Wallet</h1>
          <button onClick={fetchWalletData} className="btn-secondary">Refresh Balances</button>
        </div>
        
        <div className="balance-grid">
          <div className="balance-card">
            <span className="balance-label">USDC Balance</span>
            <span className="balance-value">{(walletData.usdcBalance || 0).toFixed(4)}</span>
          </div>
          <div className="balance-card">
            <span className="balance-label">ETH Balance</span>
            <span className="balance-value">{(walletData.ethBalance || 0).toFixed(6)}</span>
          </div>
        </div>

        <div className="address-section">
          <h2>Your Deposit Address</h2>
          <p className="address-subtext">Send USDC (Mainnet) to this address to fund your account.</p>
          <div className="address-box">
            <span className="eth-address">{walletData.address}</span>
            <button onClick={handleCopyToClipboard} className="btn-copy">
              {copySuccess || 'Copy'}
            </button>
          </div>
        </div>

        <div className="actions-section">
          <h2>Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <h3>Withdraw Funds</h3>
              <p>Queue a withdrawal of your available USDC to an external wallet.</p>
              <button onClick={() => setIsWithdrawModalOpen(true)} className="btn-primary">
                Start Withdrawal
              </button>
            </div>
          </div>
        </div>

        <WithdrawalHistory />
      </>
    );
  };

  return (
    <>
      <Layout>
        <div className="wallet-container">
          {renderContent()}
        </div>
      </Layout>

      {/* Conditionally render the modal to ensure walletData is available */}
      {walletData && (
        <WithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          usdcBalance={walletData.usdcBalance}
          onWithdrawalQueued={handleWithdrawalQueued}
        />
      )}
    </>
  );
};

export default Wallet;