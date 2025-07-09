// src/pages/Wallet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal';
import WithdrawalHistory from '../components/WithdrawalHistory';

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const fetchPageData = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const [walletResponse, historyResponse] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/withdraw/history')
      ]);
      
      setWalletData(walletResponse.data);
      setHistory(historyResponse.data);
      setError('');
      
    } catch (err) {
      setError('Could not fetch wallet data. Please try refreshing.');
      console.error("Wallet page data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleCopyToClipboard = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleWithdrawalQueued = () => {
    fetchPageData();
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
          <button onClick={fetchPageData} className="btn-secondary">Refresh</button>
        </div>
        
        <div className="balance-grid">
          <div className="balance-card">
            <span className="balance-label">USDC Balance</span>
            <span className="balance-value">{(walletData.usdcBalance || 0).toFixed(4)}</span>
          </div>
          <div className="balance-card">
            <span className="balance-label">ETH Balance (for Gas)</span>
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
        
        <WithdrawalHistory historyData={history} />
      </>
    );
  };

  return (
    <>
      <Layout>
        <div className="wallet-container">{renderContent()}</div>
      </Layout>
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