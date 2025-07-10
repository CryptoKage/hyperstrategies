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
  const [error, setError] = useState({ wallet: null, history: null });
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Your robust, separate data-fetching logic is preserved
  const fetchWalletDetails = useCallback(async () => {
    try {
      const response = await api.get('/user/wallet');
      setWalletData(response.data);
      setError(prev => ({ ...prev, wallet: null }));
    } catch (err) {
      console.error("Wallet Details Fetch Error:", err);
      setError(prev => ({ ...prev, wallet: 'Could not load wallet balances.' }));
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await api.get('/withdraw/history');
      setHistory(response.data);
      setError(prev => ({ ...prev, history: null }));
    } catch (err) {
      console.error("History Fetch Error:", err);
      setError(prev => ({ ...prev, history: 'Could not load withdrawal history.' }));
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchWalletDetails(),
      fetchHistory()
    ]);
    setLoading(false);
  }, [fetchWalletDetails, fetchHistory]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  // ✅ 1. POPULATED: The copy-to-clipboard logic is now complete.
  const handleCopyToClipboard = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000); // Reset message after 2s
    }
  };
  
  // ✅ 2. POPULATED: This now correctly re-fetches all page data.
  const handleWithdrawalQueued = () => {
    fetchAllData();
  };

  const renderContent = () => {
    if (loading) {
      return <h1>Loading Wallet...</h1>;
    }

    return (
      <>
        <div className="wallet-header">
          <h1>Your Wallet</h1>
          <button onClick={fetchAllData} className="btn-secondary" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Wallet Details Section */}
        <div className="balance-grid">
          {error.wallet ? <p className='error-message'>{error.wallet}</p> : (
            <>
              <div className="balance-card">
                <span className="balance-label">USDC Balance (On-Chain)</span>
                <span className="balance-value">{(walletData?.usdcBalance || 0).toFixed(4)}</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">ETH Balance (for Gas)</span>
                <span className="balance-value">{(walletData?.ethBalance || 0).toFixed(6)}</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Bonus Points Value</span>
                <span className="balance-value">${(walletData?.totalBonusPoints || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        <div className="address-section">
          <h2>Your Deposit Address</h2>
          <p className="address-subtext">Send USDC (Mainnet) to this address to fund your account.</p>
          <div className="address-box">
            <span className="eth-address">{walletData?.address || 'Loading...'}</span>
            <button onClick={handleCopyToClipboard} className="btn-copy">{copySuccess || 'Copy'}</button>
          </div>
        </div>

        {/* ✅ 3. POPULATED: The missing Actions section and button. */}
        <div className="actions-section">
          <h2>Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <h3>Withdraw Funds</h3>
              <p>Queue a withdrawal of your available USDC to an external wallet.</p>
              <button onClick={() => setIsWithdrawModalOpen(true)} className="btn-primary" disabled={!walletData}>
                Start Withdrawal
              </button>
            </div>
          </div>
        </div>
        
        {/* History Section */}
        {error.history ? <p className='error-message'>{error.history}</p> : 
          <WithdrawalHistory historyData={history} />
        }
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