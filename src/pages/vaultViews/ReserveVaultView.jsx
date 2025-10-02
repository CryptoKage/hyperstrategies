// src/pages/vaultViews/ReserveVaultView.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout'; // Adjust path if necessary
import ComingSoon from '../../components/ComingSoon'; // Import the component

const StatCard = ({ labelKey, value, isCurrency = true }) => {
    const { t } = useTranslation();
    return (
        <div className="profile-card">
            <h3>{t(labelKey)}</h3>
            <p className="stat-value-large">
                {isCurrency && '$'}
                {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
        </div>
    );
};

const ReserveVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    const { vaultInfo, userPosition } = pageData;

    // Check if the user has any capital in this vault
    const isInvested = userPosition && userPosition.totalCapital > 0;

    return (
        <Layout>
            <div className="vault-detail-container">
                <div className="vault-detail-header">
                    <h1>{vaultInfo.name}</h1>
                    <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
                </div>
                <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
                
                {isInvested ? (
                    <>
                        {/* Show the user their current capital if they are invested */}
                        <div className="vault-detail-grid">
                            <div className="vault-detail-column">
                                <StatCard labelKey="vault.stats.totalCapital" value={userPosition.totalCapital} />
                            </div>
                        </div>
                        
                        {/* Display the Coming Soon component for the detailed analytics */}
                       <ComingSoon 
            title={t('comingSoon.reserve.title')}
            description={t('comingSoon.reserve.description')}
        />
                    </>
                ) : (
                    // If not invested, show a prompt to go to the dashboard
                    <div className="profile-card text-center">
                        <h2>{t('vault.notInvested.title')}</h2>
                        <p>{t('vault.notInvested.description')}</p>
                        <Link to="/dashboard" className="btn-primary mt-4">{t('common.goToDashboard')}</Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReserveVaultView;
