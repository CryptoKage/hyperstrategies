// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import VaultModal from '../components/VaultModal';
import VaultWithdrawModal from '../components/VaultWithdrawModal';
import InfoIcon from '../components/InfoIcon';
import EyeIcon from '../components/EyeIcon';
import CountdownTimer from '../components/CountdownTimer';

import coreVaultBg from '../assets/core.png';
import apecoinVaultBg from '../assets/apecoin.png';
import pantherVaultBg from '../assets/panther-swarm.jpg';

const vaultImageMap = {
  'core.png': coreVaultBg,
  'apecoin.png': apecoinVaultBg,
  'panther-swarm.jpg': pantherVaultBg,
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isBalanceHidden, toggleBalanceVisibility } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);

  const [autoCompoundState, setAutoCompoundState] = useState({});

  const fetchDashboardData = useCallback(async () => {
    try {
      // The backend now sends totalCapitalInVaults and totalUnrealizedPnl
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
      const initialCompoundState = {};
      if (response.data.userPositions) {
        response.data.userPositions.forEach(p => {
          initialCompoundState[p.vault_id] = p.auto_compound ?? true;
        });
      }
      setAutoCompoundState(initialCompoundState);
      setError('');
    } catch (err) {
      console.error('[Dashboard] API call failed:', err);
      setError('Could not fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleAutoCompound = async (vaultId) => {
    const currentState = autoCompoundState[vaultId];
    const newState = !currentState;
    setAutoCompoundState(prevState => ({ ...prevState, [vaultId]: newState }));
    try {
      await api.put(`/vaults/positions/${vaultId}/compound`, { autoCompound: newState });
    } catch (err) {
      console.error("Failed to update auto-compound setting:", err);
      setAutoCompoundState(prevState => ({ ...prevState, [vaultId]: currentState }));
    }
  };

  const handleOpenAllocateModal = (vault) => {
    setSelectedVault(vault);
    setAllocateModalOpen(true);
  };
  const handleOpenWithdrawModal = (position) => {
    setSelectedVault(position);
    setWithdrawModalOpen(true);
  };
  const handleActionSuccess = () => {
    fetchDashboardData();
  };

  const StatCardSkeleton = () => (
    <div className="stat-card skeleton"><div className="skeleton-text short"></div><div className="skeleton-text long"></div></div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="stats-grid">
          <StatCardSkeleton /> <StatCardSkeleton /> <StatCardSkeleton />
        </div>
      );
    }
    
    if (error || !dashboardData) {
      return <p className="error-message">{t('dashboard.no_data')}</p>;
    }

    const investedPositions = dashboardData.userPositions || [];

    return (
      <>
        <div className="stats-grid">
          {/* --- THIS IS THE UPDATED CARD --- */}
          <div className="stat-card">
            <span className="stat-label">{t('dashboard.total_value')}</span>
            <div className="stat-main">
              <span className="stat-value">
                {isBalanceHidden 
                  ? '******' 
                  : `$${(
                      (dashboardData.totalCapitalInVaults || 0) + 
                      (dashboardData.totalBonusPoints || 0) + 
                      (dashboardData.availableBalance || 0)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              </span>
              <button onClick={toggleBalanceVisibility} className="btn-icon" title="Toggle balance visibility"><EyeIcon isHidden={isBalanceHidden} /></button>
            </div>
            {/* The new sub-value span with cleaner logic and conditional coloring */}
            <span 
              className={`stat-sub-value ${
                (dashboardData.totalUnrealizedPnl || 0) >= 0 ? 'stat-pnl-positive' : 'stat-pnl-negative'
              }`}
            >
              Unrealized PnL: {isBalanceHidden 
                ? '******' 
                : `${((dashboardData.totalUnrealizedPnl || 0) >= 0) ? '+' : ''}${(dashboardData.totalUnrealizedPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">{t('dashboard.available_balance')}</span>
            <div className="stat-main">
              {/* Also use toLocaleString here for consistency */}
              <span className="stat-value">{isBalanceHidden ? '******' : `$${(dashboardData.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              <button onClick={() => navigate('/wallet')} className="btn-link">{t('dashboard.manage')}</button>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label-with-icon">
              <span className="stat-label">{t('dashboard.bonus_points')}</span>
              <Link to="/faq" className="info-icon-link" title={t('faq.q1_title')}><InfoIcon /></Link>
            </div>
            {/* Also use toLocaleString here for consistency */}
            <span className="stat-value">{isBalanceHidden ? '******' : `$${(dashboardData.totalBonusPoints || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
          </div>
        </div>

        {investedPositions.length > 0 && (
          <>
            <h2 style={{ marginTop: '48px' }}>{t('dashboard.your_positions')}</h2>
            <div className="vaults-grid">
              {investedPositions.map(position => {
                const vaultInfo = dashboardData.vaults.find(v => v.vault_id === position.vault_id);
                if (!vaultInfo) return null;
                const isLocked = position.lock_expires_at && new Date(position.lock_expires_at) > new Date();
                
                const cardStyle = vaultInfo.image_url && vaultImageMap[vaultInfo.image_url]
                  ? { backgroundImage: `url(${vaultImageMap[vaultInfo.image_url]})` } 
                  : {};

                return (
                  <div key={position.position_id} className="vault-card invested with-bg" style={cardStyle}>
                    <div className="card-overlay"></div>
                    <div className="card-content">
                      <h3>{vaultInfo.name}</h3>
                      <div className="vault-stat">
                        <span>{t('dashboard.tradable_capital')}</span>
                        <span>{isBalanceHidden ? '******' : `$${parseFloat(position.tradable_capital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                      </div>
                      <div className="vault-stat">
                        <span>{t('dashboard.pnl')}</span>
                        <span className={parseFloat(position.pnl) >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                          {isBalanceHidden ? '******' : `${parseFloat(position.pnl) >= 0 ? '+' : ''}$${parseFloat(position.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </div>
                      {isLocked && (
                          <div className="vault-stat lock-info">
                              <span>{t('dashboard.unlocks_in')}</span>
                              <CountdownTimer expiryTimestamp={position.lock_expires_at} />
                          </div>
                      )}
                      <div className="auto-compound-toggle">
                          <label htmlFor={`compound-toggle-${position.vault_id}`}>{t('dashboard.auto_compound')}</label>
                          <label className="switch">
                              <input type="checkbox" id={`compound-toggle-${position.vault_id}`} checked={autoCompoundState[position.vault_id] ?? true} onChange={() => handleToggleAutoCompound(position.vault_id)} />
                              <span className="slider round"></span>
                          </label>
                      </div>
                      <div className="vault-actions">
                        <button className="btn-secondary" onClick={() => handleOpenAllocateModal(vaultInfo)}>{t('dashboard.add_funds')}</button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleOpenWithdrawModal(position)}
                          disabled={isLocked}
                          title={isLocked ? t('dashboard.locked_tooltip', { date: new Date(position.lock_expires_at).toLocaleDateString() }) : t('dashboard.unlocked_tooltip')}
                        >
                          {t('dashboard.withdraw')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <h2 style={{ marginTop: '48px' }}>{t('dashboard.available_strategies')}</h2>
        <div className="vaults-grid">
          {dashboardData.vaults.map(vault => {
            if (investedPositions.find(p => p.vault_id === vault.vault_id)) return null;
            const isActive = vault.status === 'active';
            
            const cardStyle = vault.image_url && vaultImageMap[vault.image_url]
              ? { backgroundImage: `url(${vaultImageMap[vault.image_url]})` } 
              : {};

            return (
              <div key={vault.vault_id} className={`vault-card ${isActive ? 'cta' : 'placeholder'} with-bg`} style={cardStyle}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <h3>{vault.name}</h3>
                  <p className="cta-text">{vault.description}</p>
                  <div className="vault-actions">
                    {isActive ? (
                      <button className="btn-primary" onClick={() => handleOpenAllocateModal(vault)}>
                        {t('dashboard.allocate_funds')}
                      </button>
                    ) : (
                      <span className="placeholder-text">{t('dashboard.coming_soon')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      <Layout>
        <div className="dashboard-container">
          <h1>{t('dashboard.welcome', { username: user?.username || 'User' })}</h1>
          {renderContent()}
        </div>
      </Layout>
      
      {dashboardData && (
        <VaultModal isOpen={isAllocateModalOpen} onClose={() => setAllocateModalOpen(false)} vault={selectedVault} availableBalance={dashboardData.availableBalance} userTier={dashboardData.accountTier} onAllocationSuccess={handleActionSuccess} />
      )}
      {dashboardData && (
        <VaultWithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} vault={selectedVault} onWithdrawalSuccess={handleActionSuccess} />
      )}
    </>
  );
};

export default Dashboard;