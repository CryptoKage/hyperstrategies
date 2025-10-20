// src/pages/vaultViews/DiscretionaryVaultView.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComingSoon from '../../components/ComingSoon';
import VaultModal from '../../components/VaultModal';

const StatCard = ({ labelKey, value, subtextKey = null, isCurrency = true, className = '' }) => {
    const { t } = useTranslation();
    return (
        <div className={`profile-card ${className}`}>
            <h3>{t(labelKey)}</h3>
            <p className="stat-value-large">{isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
            {subtextKey && <p className="stat-subtext">{t(subtextKey)}</p>}
        </div>
    );
};

const DiscretionaryVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    
    // Destructure all the data we need from the parent component's prop
    const { vaultInfo = {}, userPosition = null, dashboardData } = pageData;
    const isInvested = userPosition && userPosition.principal > 0;

    // State to control the visibility of the investment modal
    const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);

    // Logic to determine if the vault is open for new investments
    const canInvest = vaultInfo.is_user_investable && vaultInfo.status === 'active';
    
    return (
        <div className="vault-detail-container">
            <div className="vault-detail-header">
                <h1>{vaultInfo.name || t('vault.title')}</h1>
                <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
            </div>
            <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
            
            {/* Action buttons are now always visible at the top */}
            <div className="vault-actions">
                {canInvest && (
                    <button className="btn-primary" onClick={() => setAllocateModalOpen(true)}>
                        {isInvested ? t('vault.actions.investMore') : t('vault.actions.investNow')}
                    </button>
                )}
                {isInvested && (
                    // This can be wired up to a withdrawal modal in the future
                    <button className="btn-secondary">{t('vault.actions.requestWithdrawal')}</button>
                )}
            </div>

            {isInvested ? (
                // --- VIEW FOR INVESTED USERS ---
                <>
                    <div className="vault-detail-grid">
                        <div className="vault-detail-column">
                            <StatCard 
                                labelKey="vault.stats.totalCapital" 
                                value={userPosition.totalCapital} 
                                subtextKey="vault.stats.totalCapitalSubtext" 
                            />
                        </div>
                    </div>
                    
                    <ComingSoon 
                        title={t('comingSoon.discretionary.title')} 
                        description={t('comingSoon.discretionary.description')}
                    />
                </>
            ) : ( 
                // --- VIEW FOR NON-INVESTED USERS ---
                !canInvest ? (
                    // If the vault is closed to new investment
                    <div className="profile-card text-center">
                        <h2>{t('vault.closed.title', 'Investment Closed')}</h2>
                        <p>{t('vault.closed.description', 'This vault is not currently accepting new deposits.')}</p>
                    </div>
                ) : (
                    // If the vault is open, but the user is not yet invested
                    <div className="profile-card text-center">
                        <h2>{t('vault.notInvested.title', 'You are not invested in this vault')}</h2>
                        <p>{t('vault.notInvested.description', 'Click "Invest Now" to allocate funds from your available balance.')}</p>
                    </div>
                )
            )}

            {/* The Modal for investing, which is always available in the DOM */}
            {dashboardData && canInvest && (
                <VaultModal
                    isOpen={isAllocateModalOpen}
                    onClose={() => setAllocateModalOpen(false)}
                    vault={vaultInfo}
                    availableBalance={dashboardData.availableBalance}
                    userTier={dashboardData.accountTier}
                    onAllocationSuccess={() => window.location.reload()} // Reload the page on success to see updated balances
                />
            )}
        </div>
    );
};

export default DiscretionaryVaultView;
