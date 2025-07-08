// src/pages/Wallet.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal'; // ✅ 1. Import the new modal

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // ✅ 2. State to control the withdrawal modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleWithdrawalQueued = () => {
    // When a withdrawal is successfully queued, we refresh the wallet data
    // to show the new, reduced USDC balance immediately.
    fetchWalletData();
  };

  if (loading) { /* ... loading JSX ... */ }
  if (error || !walletData) { /* ... error JSX ... */ }

  return (
    <>
      <Layout>
        <div className="wallet-container">
          <div className="wallet-header">
            <h1>Your Wallet</h1>
            <button onClick={fetchWalletData} className="btn-secondary">Refresh Balances</button>
          </div>
          
          <div className="balance-grid">
            {/* ... balance cards ... */}
          </div>

          <div className="address-section">
            {/* ... address display ... */}
          </div>

          {/* --- This is the new section --- */}
          <div className="actions-section">
            <h2>Actions</h2>
            <div className="actions-grid">
              <div className="action-card">
                <h3>Deposit USDC</h3>
                <p>Send USDC to your unique deposit address shown above.</p>
              </div>
              <div className="action-card">
                <h3>Withdraw Funds</h3>
                <p>Queue a withdrawal of your available USDC to an external wallet.</p>
                {/* ✅ 3. This button now opens our modal */}
                <button onClick={() => setIsWithdrawModalOpen(true)} className="btn-primary">
                  Start Withdrawal
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* ✅ 4. Render the modal itself. It's invisible until its state is true. */}
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