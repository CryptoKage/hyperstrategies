import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import api from '../api/api';
import WithdrawModal from '../components/WithdrawModal';
import WithdrawalHistory from '../components/WithdrawalHistory';
import { useAuth } from '../context/AuthContext';
import EyeIcon from '../components/EyeIcon';
import InfoIcon from '../components/InfoIcon';
import ActivityHistory from '../components/ActivityHistory';
import LoadingSpinner from '../components/LoadingSpinner';

const Wallet = () => {
  const { t } = useTranslation();
  const { isBalanceHidden, toggleBalanceVisibility } = useAuth();
  
  const [walletData, setWalletData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ wallet: null, history: null });
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchWalletData = useCallback(async () => {
    if (!walletData) setLoading(true); 
    try {
      const [walletRes, historyRes] = await Promise.all([
        api.get('/user/wallet'),
        api.get('/withdraw/history')
      ]);
      setWalletData(walletRes.data);
      setHistory(historyRes.data);
      setError({ wallet: null, history: null });
    } catch (err) {
      console.error("Wallet Page Fetch Error:", err);
      setError({ wallet: t('wallet.error_wallet'), history: t('wallet.error_history') });
    } finally {
      setLoading(false);
    }
  }, [t, walletData]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);
  
  const handleCopyToClipboard = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess(t('wallet.copied'));
      setTimeout(() => setCopySuccess(t('wallet.copy')), 2000);
    }
  };
  
  const handleWithdrawalQueued = () => {
    fetchWalletData();
  };

  const renderContent = () => {
    if (loading) {
      return <h1>{t('wallet.loading')}</h1>;
    }

    return (
      <>
        <div className="wallet-header">
          <h1>{t('wallet.title')}</h1>
          <div className="wallet-header-actions">
            <button onClick={fetchWalletData} className="btn-secondary" disabled={loading}>
              {loading ? t('wallet.refreshing') : t('wallet.refresh')}
            </button>
            <button onClick={toggleBalanceVisibility} className="btn-icon" title="Toggle balance visibility">
              <EyeIcon isHidden={isBalanceHidden} />
            </button>
          </div>
        </div>
        
        <div className="tabs">
          <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            {t('wallet.tabs.overview')}
          </button>
          <button className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            {t('wallet.tabs.activity')}
          </button>
          <button className={`tab-button ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}>
            {t('wallet.tabs.withdrawals')}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <>
              <div className="balance-grid">
                {error.wallet ? <p className='error-message'>{error.wallet}</p> : !walletData ? null : (
                  <>
                    <div className="balance-card">
                      <div className="label-with-icon"><span className="balance-label">{t('wallet.total_portfolio_value')}</span></div>
                      <div className="balance-value-group">
                        <span className="balance-value">{isBalanceHidden ? '******' : `$${((walletData.totalCapitalInVaults || 0) + (walletData.totalBonusPoints || 0) + (walletData.availableBalance || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                        <span className={`stat-sub-value ${ (walletData.totalUnrealizedPnl || 0) >= 0 ? 'stat-pnl-positive' : 'stat-pnl-negative' }`}>{t('wallet.unrealized_pnl')}: {isBalanceHidden ? '******' : `${((walletData.totalUnrealizedPnl || 0) >= 0) ? '+' : ''}${(walletData.totalUnrealizedPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                      </div>
                    </div>
                    <div className="balance-card">
                       {walletData?.pendingVaultWithdrawal && (
                        <div className="balance-loading-icon"><LoadingSpinner /></div>
                      )}
                      <div className="label-with-icon"><span className="balance-label">{t('wallet.available_balance_card')}</span></div>
                      <div className="balance-value-group">
                        <span className="balance-value">{isBalanceHidden ? '******' : `$${(walletData.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                        <span className="stat-sub-value">{t('wallet.ready_to_invest')}</span>
                      </div>
                    </div>
                    <div className="balance-card">
                      <div className="label-with-icon"><span className="balance-label">{t('wallet.bonus_points_value')}</span><Link to="/faq" className="info-icon-link" title={t('faq.q1_title')}><InfoIcon /></Link></div>
                      <div className="balance-value-group"><span className="balance-value">{isBalanceHidden ? '******' : `$${(walletData.totalBonusPoints || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span></div>
                    </div>
                  </>
                )}
              </div>
              <div className="address-section">
                <h2>{t('wallet.deposit_address_title')}</h2>
                <p className="address-subtext">{t('wallet.deposit_address_subtitle')}</p>
                <div className="address-box">
                  <span className="eth-address">{walletData?.address || t('wallet.address_loading')}</span>
                  <button onClick={handleCopyToClipboard} className="btn-copy">{copySuccess || t('wallet.copy')}</button>
                </div>
              </div>
              <div className="actions-section">
                <h2>{t('wallet.actions_title')}</h2>
                <div className="actions-grid">
                  <div className="action-card">
                    <h3>{t('wallet.withdraw_funds_title')}</h3>
                    <p>{t('wallet.withdraw_funds_subtitle')}</p>
                    <button onClick={() => setIsWithdrawModalOpen(true)} className="btn-primary" disabled={!walletData}>
                      {t('wallet.start_withdrawal')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <div className="admin-card">
              <ActivityHistory />
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <>
              {error.history ? <p className='error-message'>{error.history}</p> : <WithdrawalHistory historyData={history} />}
            </>
          )}
        </div>
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
          usdcBalance={walletData.availableBalance}
          onWithdrawalQueued={handleWithdrawalQueued}
        />
      )}
    </>
  );
};

export default Wallet;
