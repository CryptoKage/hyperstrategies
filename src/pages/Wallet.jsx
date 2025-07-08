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

  const handleCopyToClipboard = () => { /* ... same as before ... */ };
  const handleWithdrawalQueued = () => { fetchPageData(); };

  // This defensive rendering prevents the crash
  const renderContent = () => {
    if (loading) return <h1>Loading Wallet...</h1>;
    if (error || !walletData) return <p className="error-message">{error || 'Could not load wallet data.'}</p>;

    return (
      <>
        <div className="wallet-header">
          <h1>Your Wallet</h1>
          {/* ✅ The missing Refresh button */}
          <button onClick={fetchPageData} className="btn-secondary">Refresh</button>
        </div>
        
        <div className="balance-grid">{/* ... your balance cards ... */}</div>
        <div className="address-section">{/* ... your address display ... */}</div>
        <div className="actions-section">{/* ... your actions section with Withdraw button ... */}</div>
        <WithdrawalHistory historyData={history} />
      </>
    );
  };

  return (
    <>
      <Layout><div className="wallet-container">{renderContent()}</div></Layout>
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