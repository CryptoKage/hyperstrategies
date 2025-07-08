// src/pages/Wallet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal';
import WithdrawalHistory from '../components/WithdrawalHistory';

const Wallet = () => {
  // State for all the data this page needs
  const [walletData, setWalletData] = useState(null);
  const [history, setHistory] = useState([]);
  
  // State for the UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // A single function to fetch all data for the page, wrapped in useCallback for stability
  const fetchPageData = useCallback(async () => {
    if (!loading) setLoading(true); // Show loader for manual refreshes
    try {
      // Fetch both wallet balances and withdrawal history in parallel for speed
      const [walletResponse, historyResponse] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/withdraw/history')
      ]);
      
      setWalletData(walletResponse.data);
      setHistory(historyResponse.data);
      setError(''); // Clear any previous errors on success

    } catch (err) {
      setError('Could not fetch wallet data. Please try refreshing.');
      console.error("Wallet page data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initial data fetch when the component first mounts
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

  // This function is passed to the modal. After a withdrawal is queued,
  // we re-fetch everything to get the most up-to-date info.
  const handleWithdrawalQueued = () => {
    fetchPageData();
  };

  // Main render logic
  const renderContent = () => {
    if (loading) {
      return <h1>Loading Wallet...</h1>;
    }
    if (error || !walletData) {
      return <p className="error-message">{error || 'Could not load wallet data.'}</p>;
    }

    // If loading is done and data exists, render the full UI
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
        
        {/* Pass the fetched history data down as a prop */}
        <WithdrawalHistory historyData={history} />
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

      {/* Conditionally render the modal to ensure walletData is not null */}
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