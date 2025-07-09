// src/pages/Wallet.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal';
import WithdrawalHistory from '../components/WithdrawalHistory';

const Wallet = () => {
  // We initialize with a default structure to prevent rendering errors
  const [walletData, setWalletData] = useState({ usdcBalance: 0, ethBalance: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... other states are the same ...

  const fetchPageData = useCallback(async () => {
    // We don't need to re-set loading for manual refreshes with skeletons
    try {
      const [walletResponse, historyResponse] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/withdraw/history')
      ]);
      setWalletData(walletResponse.data);
      setHistory(historyResponse.data);
      setError('');
    } catch (err) {
      setError('Could not fetch wallet data.');
      console.error("Wallet page data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array makes this stable

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // ... handleCopyToClipboard and handleWithdrawalQueued are the same ...
  const handleCopyToClipboard = () => {};
  const handleWithdrawalQueued = () => { fetchPageData(); };


  // --- SKELETON COMPONENT ---
  const BalanceCardSkeleton = () => (
    <div className="balance-card skeleton">
      <div className="skeleton-text short"></div>
      <div className="skeleton-text long"></div>
    </div>
  );

  return (
    <>
      <Layout>
        <div className="wallet-container">
          <div className="wallet-header">
            <h1>Your Wallet</h1>
            <button onClick={fetchPageData} className="btn-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {loading ? (
            // Render skeletons while loading
            <div className="balance-grid">
              <BalanceCardSkeleton />
              <BalanceCardSkeleton />
            </div>
          ) : (
            // Render real data when loaded
            <div className="balance-grid">
              <div className="balance-card">
                <span className="balance-label">USDC Balance</span>
                <span className="balance-value">{walletData.usdcBalance.toFixed(4)}</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">ETH Balance (for Gas)</span>
                <span className="balance-value">{walletData.ethBalance.toFixed(6)}</span>
              </div>
            </div>
          )}

          <div className="address-section">
            <h2>Your Deposit Address</h2>
            <p className="address-subtext">Send USDC (Mainnet) to this address to fund your account.</p>
            <div className="address-box">
              {/* Also handle loading state for the address */}
              <span className="eth-address">{loading ? '...' : walletData.address}</span>
              <button onClick={handleCopyToClipboard} className="btn-copy">...</button>
            </div>
          </div>

          <div className="actions-section">
            <h2>Actions</h2>
            <div className="actions-grid">
              <div className="action-card">
                <h3>Withdraw Funds</h3>
                <p>Queue a withdrawal of your available USDC to an external wallet.</p>
                <button onClick={() => setIsWithdrawModalOpen(true)} className="btn-primary" disabled={loading}>
                  Start Withdrawal
                </button>
              </div>
            </div>
          </div>
          
          <WithdrawalHistory historyData={history} />
        </div>
      </Layout>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        usdcBalance={walletData.usdcBalance}
        onWithdrawalQueued={handleWithdrawalQueued}
      />
    </>
  );
};

export default Wallet;