// src/pages/vaultViews/DiscretionaryVaultView.jsx - FINAL POLISHED VERSION

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComingSoon from '../../components/ComingSoon';
import api from '../../api/api';

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
    
    return (
        <div className="vault-detail-container">
            {/* The header now contains a div for the actions with the new CSS class */}
            <div className="vault-detail-header">
                <h1>{vaultInfo.name || t('vault.title')}</h1>
                <div className="vault-header-actions">
                    {isReportEligible && (
                        <Link to="/reports" className="btn-primary btn-sm">
                            {t('vault.actions.myReports', 'My Reports')}
                        </Link>
                    )}
                    <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
                </div>
            </div>
            <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
            
            {isInvested ? (
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
        </div>
    );
};

export default DiscretionaryVaultView;
