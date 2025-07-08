// src/pages/Wallet.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
// We don't need these yet, but we will soon.
// import WithdrawModal from '../components/WithdrawModal';
// import WithdrawalHistory from '../components/WithdrawalHistory';

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const fetchWalletData = async () => {
    // No need to set loading here, the initial load is enough
    try {
      const response = await api.get('/user/wallet');
      console.log("API Response:", response.data); // Let's see what the backend sends
      setWalletData(response.data);
    } catch (err) {
      setError('Could not fetch wallet data. Please try refreshing.');
      console.error(err);
    } finally {
      // Only set loading to false on the initial fetch
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []); // Empty array ensures this runs only once on component mount

  const handleCopyToClipboard = () => {
    // Use optional chaining (?.) to prevent crash if walletData is null
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  // --- THIS IS THE KEY FIX ---
  // The component now handles the loading and error states explicitly before trying to render data.
  const renderContent = () => {
    if (loading) {
      return <h1>Loading Wallet...</h1>;
    }

    if (error || !walletData) {
      return <p className="error-message">{error || 'Could not load wallet data.'}</p>;
    }

    // If we get here, walletData is guaranteed to exist.
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
      </>
    );
  };

  return (
    <Layout>
      <div className="wallet-container">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default Wallet;