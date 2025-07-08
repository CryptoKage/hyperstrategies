// src/pages/Wallet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal';
import WithdrawalHistory from '../components/WithdrawalHistory';

const Wallet = () => {
  // We now have separate states for each piece of data
  const [walletData, setWalletData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // This function now fetches ALL data for the page.
  const fetchPageData = useCallback(async () => {
    setLoading(true); // Always show loader on refresh
    try {
      // Fetch both endpoints in parallel for speed
      const [walletResponse, historyResponse] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/withdraw/history')
      ]);
      
      setWalletData(walletResponse.data);
      setHistory(historyResponse.data);
      setError(''); // Clear any previous errors
      
    } catch (err) {
      setError('Could not fetch wallet data. Please try refreshing.');
      console.error("Wallet page data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);
  
  // ... (handleCopyToClipboard is the same) ...

  const handleWithdrawalQueued = () => {
    // After a withdrawal is queued, just refetch everything.
    fetchPageData();
  };

  const renderContent = () => {
    // The loading state now covers both API calls
    if (loading) {
      return <h1>Loading Wallet...</h1>;
    }
    // If the main wallet data fails, we show a critical error
    if (!walletData) {
      return <p className="error-message">{error || 'Could not load wallet data.'}</p>;
    }

    return (
      <>
        <div className="wallet-header">
          <h1>Your Wallet</h1>
          <button onClick={fetchPageData} className="btn-secondary">Refresh</button>
        </div>
        
        {/* ... (Your balance-grid and address-section JSX) ... */}

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
        
        {/* We now pass the history data down as a prop */}
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