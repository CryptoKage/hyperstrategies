// src/pages/vaultViews/DiscretionaryVaultView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComingSoon from '../../components/ComingSoon';
import api from '../../api/api';

const DetailStatCard = ({ labelKey, value, subtextKey = null, isCurrency = true, isXp = false, highlightClass = '' }) => {
    const { t } = useTranslation();
    const formattedValue = typeof value === 'number'
        ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '0.00';
        
    return (
        <div className={`profile-card ${highlightClass}`}>
            <h3>{t(labelKey)}</h3>
            <p className="stat-value-large">
                {isCurrency && (value >= 0 ? '+ $' : '- $')}
                {isCurrency ? Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formattedValue}
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
    
    const strategyGainsLabelKey = vaultInfo.name?.toLowerCase().includes('core')
        ? 'vault.stats.coreStrategyGains'
        : 'vault.stats.strategyGains';

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
                    <div className="vault-detail-grid">
                        {/* 1. Your Total Capital */}
                        <div className="profile-card highlight-primary">
                            <h3>{t('vault.stats.totalCapital')}</h3>
                            <p className="stat-value-large">${(userPosition.totalCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <p className="stat-subtext">{t('vault.stats.totalCapitalSubtext')}</p>
                        </div>
                        
                        {/* 2. Total Deposited */}
                        <DetailStatCard
                            labelKey="vault.stats.totalDeposited"
                            subtextKey="vault.stats.totalDepositedSubtext"
                            value={userPosition.principal}
                        />

                        {/* 3. Strategy Gains */}
                        <DetailStatCard
                            labelKey={strategyGainsLabelKey}
                            subtextKey="vault.stats.strategyGainsSubtext"
                            value={userPosition.realizedPnl}
                            highlightClass={userPosition.realizedPnl >= 0 ? 'highlight-positive' : 'highlight-negative'}
                        />

                        {/* 4. Buyback Gains (conditional) */}
                        {userPosition.buybackGains > 0 && (
                            <DetailStatCard
                                labelKey="vault.stats.buybackGains"
                                subtextKey="vault.stats.buybackGainsSubtext"
                                value={userPosition.buybackGains}
                                highlightClass="highlight-positive"
                            />
                        )}

                        {/* 5. Total XP (conditional) */}
                        {userPosition.totalXpFromVault > 0 && (
                             <DetailStatCard
                                labelKey="vault.stats.totalXpEarned"
                                value={userPosition.totalXpFromVault}
                                subtextKey="vault.stats.totalXpEarnedSubtext"
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
