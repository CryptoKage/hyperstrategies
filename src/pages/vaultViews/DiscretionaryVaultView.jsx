// FILE: src/pages/vaultViews/DiscretionaryVaultView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComingSoon from '../../components/ComingSoon';
import api from '../../api/api';

// --- NEW: A reusable Stat Card component for this view ---
const DetailStatCard = ({ label, value, subtextKey, isCurrency = true, isXp = false, highlightClass = '' }) => {
    const { t } = useTranslation();
    
    // Gracefully handle null or undefined values
    const numericValue = typeof value === 'number' ? value : 0;

    const formattedValue = numericValue.toLocaleString('en-US', { 
        minimumFractionDigits: isCurrency ? 2 : 4, 
        maximumFractionDigits: isCurrency ? 2 : 4 
    });
        
    return (
        <div className={`profile-card ${highlightClass}`}>
            <h3>{label}</h3>
            <p className="stat-value-large">
                {isCurrency && (numericValue >= 0 ? '+ $' : '- $')}
                {isCurrency ? Math.abs(numericValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formattedValue}
                {isXp && ' XP'}
            </p>
            {subtextKey && <p className="stat-subtext">{t(subtextKey)}</p>}
        </div>
    );
};


const DiscretionaryVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    
    const { vaultInfo = {}, userPosition = null } = pageData;
    const isInvested = userPosition && userPosition.principal > 0;
    const [isReportEligible, setIsReportEligible] = useState(false);

    useEffect(() => {
        if (isInvested) {
            api.get('/user/report-eligibility')
                .then(res => {
                    if (res.data.eligible) setIsReportEligible(true);
                })
                .catch(err => console.error("Failed to fetch report eligibility", err));
        }
    }, [isInvested]);
    
    // Make the label dynamic based on vault name
    const strategyGainsLabel = t(
        vaultInfo.name?.toLowerCase().includes('core') 
            ? 'vault.stats.coreStrategyGains' 
            : 'vault.stats.strategyGains'
    );
    
    return (
        <div className="vault-detail-container">
            <div className="vault-detail-header">
                <h1>{vaultInfo.name || t('vault.title')}</h1>
                <div className="vault-header-actions">
                    {isReportEligible && ( <Link to="/reports" className="btn-primary btn-sm">{t('vault.actions.myReports', 'My Reports')}</Link> )}
                    <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
                </div>
            </div>
            <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
            
            {isInvested ? (
                <>
                    {/* --- THIS SECTION IS UPDATED TO USE THE NEW STAT CARDS --- */}
                    <div className="vault-detail-grid">
                        <div className="profile-card highlight-primary">
                            <h3>{t('vault.stats.totalCapital')}</h3>
                            <p className="stat-value-large">${(userPosition.totalCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="stat-subtext">{t('vault.stats.totalCapitalSubtext')}</p>
                        </div>
                        
                        <DetailStatCard
                            label={t('vault.stats.totalDeposited')}
                            subtextKey="vault.stats.totalDepositedSubtext"
                            value={userPosition.principal}
                        />

                        <DetailStatCard
                            label={strategyGainsLabel} 
                            subtextKey="vault.stats.strategyGainsSubtext"
                            value={userPosition.strategyGains}
                            highlightClass={userPosition.strategyGains >= 0 ? 'highlight-positive' : 'highlight-negative'}
                        />

                        {/* Conditionally render Buyback Gains only if they exist */}
                        {userPosition.buybackGains > 0 && (
                            <DetailStatCard
                                label={t('vault.stats.buybackGains')}
                                subtextKey="vault.stats.buybackGainsSubtext"
                                value={userPosition.buybackGains}
                                highlightClass="highlight-positive"
                            />
                        )}

                        {/* Conditionally render the new XP cards */}
                        {userPosition.totalXpFromVault > 0 && (
                             <DetailStatCard
                                label={t('vault.stats.totalXpEarned')}
                                value={userPosition.totalXpFromVault}
                                subtextKey="vault.stats.totalXpEarnedSubtext"
                                isCurrency={false}
                                isXp={true}
                            />
                        )}
                        {userPosition.dailyXpRate > 0 && (
                             <DetailStatCard
                                label={t('profile_page.xp_rate_label')} // Reuse existing translation key
                                value={userPosition.dailyXpRate}
                                subtextKey="vault.stats.dailyXpRateSubtext" // You will need to add this key to en.json
                                isCurrency={false}
                                isXp={true}
                            />
                        )}
                    </div>
                    
                    <ComingSoon 
                        title={t('comingSoon.discretionary.title')} 
                        description={t('comingSoon.discretionary.description')}
                    />
                </>
            ) : ( 
                <div className="profile-card text-center">
                    <h2>{t('vault.notInvested.title')}</h2>
                    <p>{t('vault.notInvested.description_go_back')}</p>
                    <div style={{ marginTop: '24px' }}>
                        <Link to="/dashboard" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            {t('common.goToDashboard')}
                        </Link>
                    </div>
                </div> 
            )}
        </div>
    );
};

export default DiscretionaryVaultView;
