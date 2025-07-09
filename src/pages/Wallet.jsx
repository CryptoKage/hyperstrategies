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
  const [error, setError] = useState({ wallet: null, history: null }); // Separate errors
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // We now have two separate functions to fetch data
  const fetchWalletDetails = useCallback(async () => {
    try {
      const response = await api.get('/user/wallet');
      setWalletData(response.data);
    } catch (err) {
      console.error("Wallet Details Fetch Error:", err);
      setError(prev => ({ ...prev, wallet: 'Could not load wallet balances.' }));
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await api.get('/withdraw/history');
      setHistory(response.data);
    } catch (err) {
      console.error("History Fetch Error:", err);
      setError(prev => ({ ...prev, history: 'Could not load withdrawal history.' }));
    }
  }, []);

  // This effect runs once to fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      // Run both fetches, but don't let one block the other from rendering
      await Promise.all([
        fetchWalletDetails(),
        fetchHistory()
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, [fetchWalletDetails, fetchHistory]);
  
  // ... handleCopyToClipboard and handleWithdrawalQueued are the same ...
  const handleCopyToClipboard = () => {};
  const handleWithdrawalQueued = () => {};

  return (
    <>
      <Layout>
        <div className="wallet-container">
          <div className="wallet-header">
            <h1>Your Wallet</h1>
            <button onClick={() => { fetchWalletDetails(); fetchHistory(); }} className="btn-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {/* Wallet Details Section */}
          <div className="balance-grid">
            {error.wallet ? <p className='error-message'>{error.wallet}</p> : (
              <>
                <div className="balance-card">
                  <span className="balance-label">USDC Balance</span>
                  <span className="balance-value">{(walletData?.usdcBalance || 0).toFixed(4)}</span>
                </div>
                <div className="balance-card">
                  <span className="balance-label">ETH Balance (for Gas)</span>
                  <span className="balance-value">{(walletData?.ethBalance || 0).toFixed(6)}</span>
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

          {/* Actions Section */}
          <div className="actions-section">
            {/* ... actions grid and withdraw button ... */}
          </div>
          
          {/* History Section */}
          {error.history ? <p className='error-message'>{error.history}</p> : 
            <WithdrawalHistory historyData={history} />
          }
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