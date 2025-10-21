// src/pages/vaultViews/DiscretionaryVaultView.jsx - CLEANED UP

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComingSoon from '../../components/ComingSoon';

// StatCard remains the same
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
    
    const { vaultInfo = {}, userPosition = null } = pageData;
    const isInvested = userPosition && userPosition.principal > 0;
    
    return (
        <div className="vault-detail-container">
            <div className="vault-detail-header">
                <h1>{vaultInfo.name || t('vault.title')}</h1>
                <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
            </div>
            <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
            
            {/* The action buttons and VaultModal have been completely removed from this component. */}

            {isInvested ? (
                // --- VIEW FOR INVESTED USERS (Informational Only) ---
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
                // --- VIEW FOR NON-INVESTED USERS (Guide them back to Dashboard) ---
                <div className="profile-card text-center">
                    <h2>{t('vault.notInvested.title', 'You are not invested in this vault')}</h2>
                    <p>{t('vault.notInvested.description_go_back', 'Go back to the dashboard to invest.')}</p>
                    <div style={{ marginTop: '24px' }}>
                        <Link to="/dashboard" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            {t('common.goToDashboard')}
                        </Link>
                    </div>
                </div> 
            )}

            {/* The VaultModal is no longer needed here. */}
        </div>
    );
};

export default DiscretionaryVaultView;
