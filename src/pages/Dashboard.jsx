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
  const [isUpdatingCompound, setIsUpdatingCompound] = useState({});

  // --- NEW: State to store the lock status for each vault ---
  const [vaultLockStatuses, setVaultLockStatuses] = useState({});

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);

      const initialCompoundState = {};
      if (response.data.userPositions) {
        response.data.userPositions.forEach(p => {
          initialCompoundState[p.vault_id] = p.auto_compound ?? true;
        });

        // --- NEW LOGIC: After fetching positions, fetch their lock statuses ---
        const lockStatusPromises = response.data.userPositions.map(p =>
          api.get(`/vaults/${p.vault_id}/lock-status`)
        );
        const lockStatusResults = await Promise.all(lockStatusPromises);
        
        const newLockStatuses = {};
        response.data.userPositions.forEach((p, index) => {
          newLockStatuses[p.vault_id] = lockStatusResults[index].data;
        });
        setVaultLockStatuses(newLockStatuses);
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
    setIsUpdatingCompound(prev => ({ ...prev, [vaultId]: true }));
    setAutoCompoundState(prevState => ({ ...prevState, [vaultId]: newState }));
    try {
      await api.put(`/user/vault-settings/${vaultId}/compound`, { autoCompound: newState });
    } catch (err) {
      console.error("Failed to update auto-compound setting:", err);
      setAutoCompoundState(prevState => ({ ...prevState, [vaultId]: currentState }));
    } finally {
      setIsUpdatingCompound(prev => ({ ...prev, [vaultId]: false }));
    }
  };

  const handleOpenAllocateModal = (vault) => { setSelectedVault(vault); setAllocateModalOpen(true); };
  const handleOpenWithdrawModal = (position) => { setSelectedVault(position); setWithdrawModalOpen(true); };
  const handleActionSuccess = () => { fetchDashboardData(); };

  const StatCardSkeleton = () => ( <div className="stat-card skeleton"><div className="skeleton-text short"></div><div className="skeleton-text long"></div></div> );

  const renderContent = () => {
    if (loading) { return ( <div className="stats-grid"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div> ); }
    if (error || !dashboardData) { return <p className="error-message">{t('dashboard.no_data')}</p>; }
    const investedPositions = dashboardData.userPositions || [];

    return (
      <>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">{t('dashboard.total_value')}</span>
            <div className="stat-main">
              <span className="stat-value">{isBalanceHidden ? '******' : `$${((dashboardData.totalCapitalInVaults || 0) + (dashboardData.totalBonusPoints || 0) + (dashboardData.availableBalance || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              <button onClick={toggleBalanceVisibility} className="btn-icon" title="Toggle balance visibility"><EyeIcon isHidden={isBalanceHidden} /></button>
            </div>
            <span className={`stat-sub-value ${(dashboardData.totalUnrealizedPnl || 0) >= 0 ? 'stat-pnl-positive' : 'stat-pnl-negative'}`}>
               {t('dashboard.unrealized_pnl')}: {isBalanceHidden ? '******' : `${((dashboardData.totalUnrealizedPnl || 0) >= 0) ? '+' : ''}${(dashboardData.totalUnrealizedPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t('dashboard.available_balance')}</span>
            <div className="stat-main">
              <span className="stat-value">{isBalanceHidden ? '******' : `$${(dashboardData.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              <button onClick={() => navigate('/wallet')} className="btn-link">{t('dashboard.manage')}</button>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label-with-icon">
              <span className="stat-label">{t('dashboard.bonus_points')}</span>
              <Link to="/faq" className="info-icon-link" title={t('faq.q1_title')}><InfoIcon /></Link>
            </div>
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
                const tradableCapital = parseFloat(position.tradable_capital);
                const pnl = parseFloat(position.pnl);
                const isUpdating = isUpdatingCompound[position.vault_id];
                const cardStyle = vaultInfo.image_url && vaultImageMap[vaultInfo.image_url] ? { backgroundImage: `url(${vaultImageMap[vaultInfo.image_url]})` } : {};
                
                // --- THE FIX: Get the lock status for the current position ---
                const vaultLockStatus = vaultLockStatuses[position.vault_id] || { isLocked: true }; // Default to locked while loading

                return (
                  <div key={position.vault_id} className="vault-card invested with-bg" style={cardStyle}>
                    <div className="card-overlay"></div>
                    <div className="card-content">
                      <h3>{vaultInfo.name}</h3>
                      <div className="vault-stat">
                        <span>{t('dashboard.tradable_capital')}</span>
                        <span>{isBalanceHidden ? '******' : `$${tradableCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                      </div>
                      <div className="vault-stat">
                        <span>{t('dashboard.pnl')}</span>
                        <span className={pnl >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                          {isBalanceHidden ? '******' : `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </div>
                      <div className="auto-compound-toggle">
                        <div className="label-group">
                          <label htmlFor={`compound-toggle-${position.vault_id}`}>{isUpdating ? t('dashboard.saving') : t('dashboard.auto_compound')}</label>
                          <Link to="/faq#auto-compound" className="info-icon-link" title={t('dashboard.auto_compound_tooltip')}><InfoIcon /></Link>
                        </div>
                        <label className="switch">
                          <input type="checkbox" id={`compound-toggle-${position.vault_id}`} checked={autoCompoundState[position.vault_id] ?? true} onChange={() => handleToggleAutoCompound(position.vault_id)} disabled={isUpdating} />
                          <span className="slider round"></span>
                        </label>
                      </div>
                      <div className="vault-actions">
                        <button className="btn-secondary" onClick={() => handleOpenAllocateModal(vaultInfo)}>{t('dashboard.add_funds')}</button>
                        <button className="btn-secondary" onClick={() => navigate(`/vaults/${vaultInfo.vault_id}`)}>               {t('dashboard.more_info')}</button>
                        {/* --- THE FIX: The Withdraw button is now disabled and has a tooltip based on lock status --- */}
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleOpenWithdrawModal(position)}
                          disabled={vaultLockStatus.isLocked}
                          title={vaultLockStatus.isLocked ? `Unlocks on ${new Date(vaultLockStatus.unlockDate).toLocaleDateString()}` : 'Withdraw funds'}
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
            const cardStyle = vault.image_url && vaultImageMap[vault.image_url] ? { backgroundImage: `url(${vaultImageMap[vault.image_url]})` } : {};
            const displayPnl = parseFloat(vault.display_pnl_percentage) || 0;

            return (
              <div key={vault.vault_id} className={`vault-card ${isActive ? 'cta' : 'placeholder'} with-bg`} style={cardStyle}>
                <div className="card-overlay"></div>
                <div className="card-content">
                  <h3>{vault.name}</h3>
                  <p className="cta-text">{vault.description}</p>
                  
                  {isActive && displayPnl !== 0 && (
                    <div className="vault-stat marketing-stat">
                      <span>{t('dashboard.all_time_pnl')}</span>
                      <span className={displayPnl >= 0 ? 'stat-value-positive' : 'stat-value-negative'}>
                        {displayPnl > 0 ? '+' : ''}{displayPnl.toFixed(2)}%
                      </span>
                    </div>
                  )}

                  <div className="vault-actions">
                   <button className="btn-secondary" onClick={() => navigate(`/vaults/${vault.vault_id}`)}>
                      {t('dashboard.more_info')}
                    </button>
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
        <VaultModal 
          isOpen={isAllocateModalOpen} 
          onClose={() => setAllocateModalOpen(false)} 
          vault={selectedVault} 
          availableBalance={dashboardData.availableBalance} 
          userTier={dashboardData.accountTier} 
          onAllocationSuccess={handleActionSuccess} 
        />
      )}
      {dashboardData && (
        <VaultWithdrawModal 
          isOpen={isWithdrawModalOpen} 
          onClose={() => setWithdrawModalOpen(false)} 
          vault={selectedVault}
          unlockDate={vaultLockStatuses[selectedVault?.vault_id]?.unlockDate}
          onWithdrawalSuccess={handleActionSuccess} 
        />
      )}
    </>
  );
};

export default Dashboard;
