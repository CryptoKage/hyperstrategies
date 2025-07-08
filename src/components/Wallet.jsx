// src/pages/Wallet.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/wallet');
      setWalletData(response.data);
    } catch (err) {
      setError('Could not fetch wallet data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleCopyToClipboard = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
    }
  };

  if (loading) {
    return <Layout><div className="wallet-container"><h1>Loading Wallet...</h1></div></Layout>;
  }

  if (error || !walletData) {
    return <Layout><div className="wallet-container"><p className="error-message">{error || 'Could not load data.'}</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="wallet-container">
        <div className="wallet-header">
          <h1>Your Wallet</h1>
          <button onClick={fetchWalletData} className="btn-secondary">Refresh Balances</button>
        </div>
        
        <div className="balance-grid">
          <div className="balance-card">
            <span className="balance-label">USDC Balance</span>
            <span className="balance-value">{walletData.usdcBalance.toFixed(4)}</span>
          </div>
          <div className="balance-card">
            <span className="balance-label">ETH Balance</span>
            <span className="balance-value">{walletData.ethBalance.toFixed(6)}</span>
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

        {/* We will build out the Deposit/Withdraw components here in the next phase */}
        <div className="actions-section">
          {/* <DepositComponent /> */}
          {/* <WithdrawComponent /> */}
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;