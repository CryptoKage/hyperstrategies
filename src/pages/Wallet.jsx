// src/pages/Wallet.jsx

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

const Wallet = () => {
  const { t } = useTranslation();
  const { isBalanceHidden, toggleBalanceVisibility } = useAuth();
  
  const [walletData, setWalletData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ wallet: null, history: null });
  const [copySuccess, setCopySuccess] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const fetchWalletDetails = useCallback(async () => {
    try {
      const response = await api.get('/user/wallet');
      setWalletData(response.data);
      setError(prev => ({ ...prev, wallet: null }));
    } catch (err) {
      console.error("Wallet Details Fetch Error:", err);
      setError(prev => ({ ...prev, wallet: t('wallet.error_wallet') }));
    }
  }, [t]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await api.get('/withdraw/history');
      setHistory(response.data);
      setError(prev => ({ ...prev, history: null }));
    } catch (err) {
      console.error("History Fetch Error:", err);
      setError(prev => ({ ...prev, history: t('wallet.error_history') }));
    }
  }, [t]);

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
  
  const handleCopyToClipboard = () => {
    if (walletData?.address) {
      navigator.clipboard.writeText(walletData.address);
      setCopySuccess(t('wallet.copied'));
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };
  
  const handleWithdrawalQueued = () => {
    fetchAllData();
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
            <button onClick={fetchAllData} className="btn-secondary" disabled={loading}>
              {loading ? t('wallet.refreshing') : t('wallet.refresh')}
            </button>
            <button onClick={toggleBalanceVisibility} className="btn-icon" title="Toggle balance visibility">
              <EyeIcon isHidden={isBalanceHidden} />
            </button>
          </div>
        </div>
        
        <div className="balance-grid">
          {error.wallet ? <p className='error-message'>{error.wallet}</p> : !walletData ? null : (
            <>
              {/* Card 1: Total Portfolio Value */}
              <div className="balance-card">
                <div className="label-with-icon">
                  <span className="balance-label">{t('wallet.total_portfolio_value')}</span>
                </div>
                <div className="balance-value-group">
                  <span className="balance-value">
                    {isBalanceHidden 
                      ? '******' 
                      : `$${((walletData.totalCapitalInVaults || 0) + (walletData.totalBonusPoints || 0) + (walletData.availableBalance || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                  </span>
                  <span className={`stat-sub-value ${ (walletData.totalUnrealizedPnl || 0) >= 0 ? 'stat-pnl-positive' : 'stat-pnl-negative' }`}>
                    {t('wallet.unrealized_pnl')}: {isBalanceHidden 
                      ? '******' 
                      : `${((walletData.totalUnrealizedPnl || 0) >= 0) ? '+' : ''}${(walletData.totalUnrealizedPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    }
                  </span>
                </div>
              </div>

              {/* Card 2: Available Balance */}
              <div className="balance-card">
                <div className="label-with-icon">
                  <span className="balance-label">{t('wallet.available_balance_card')}</span>
                </div>
                <div className="balance-value-group">
                  <span className="balance-value">
                    {isBalanceHidden ? '******' : `$${(walletData.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                  <span className="stat-sub-value">{t('wallet.ready_to_invest')}</span>
                </div>
              </div>

              {/* Card 3: Bonus Points Value */}
              <div className="balance-card">
                <div className="label-with-icon">
                  <span className="balance-label">{t('wallet.bonus_points_value')}</span>
                  <Link to="/faq" className="info-icon-link" title={t('faq.q1_title')}>
                    <InfoIcon />
                  </Link>
                </div>
                <div className="balance-value-group">
                  <span className="balance-value">
                    {isBalanceHidden ? '******' : `$${(walletData.totalBonusPoints || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
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
          usdcBalance={walletData.availableBalance}
          onWithdrawalQueued={handleWithdrawalQueued}
        />
      )}
    </>
  );
};

export default Wallet;