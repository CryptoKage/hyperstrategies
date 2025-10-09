// src/pages/vaultViews/DiscretionaryVaultView.jsx - SIMPLIFIED VERSION

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import ComingSoon from '../../components/ComingSoon';

// We keep the StatCard as it's used for the main "Total Capital" display
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
    
    // Destructure the data directly from the 'pageData' prop
    const { vaultInfo = {}, userPosition = null } = pageData;
    const hasPrincipal = userPosition && userPosition.principal > 0;
    
    return (
        <Layout>
            <div className="vault-detail-container">
                <div className="vault-detail-header">
                    <h1>{vaultInfo.name || t('vault.title')}</h1>
                    <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
                </div>
                <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
                
                {hasPrincipal ? (
                    <>
                        {/* --- THIS IS THE ONLY STAT CARD WE KEEP --- */}
                        <div className="vault-detail-grid">
                            <div className="vault-detail-column">
                                <StatCard 
                                    labelKey="vault.stats.totalCapital" 
                                    value={userPosition.totalCapital} 
                                    subtextKey="vault.stats.totalCapitalSubtext" 
                                />
                            </div>
                        </div>
                        
                        {/* --- ALL OTHER CARDS AND TABLES ARE REPLACED BY THIS --- */}
                       <ComingSoon 
            title={t('comingSoon.discretionary.title')} 
            description={t('comingSoon.discretionary.description')}
        />
                    </>
                ) : ( 
                    <div className="profile-card text-center">
                        <h2>{t('vault.notInvested.title')}</h2>
                        <p>{t('vault.notInvested.description')}</p>
                         <div style={{ marginTop: '24px' }}>
        <Link 
            to="/dashboard" 
            className="btn-primary" 
            style={{ width: 'auto', padding: '12px 24px' }}
        >
            {t('common.goToDashboard')}
        </Link>
    </div>
</div> 
                )}
            </div>
        </Layout>
    );
};

export default DiscretionaryVaultView;
