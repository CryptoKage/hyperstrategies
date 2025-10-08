// src/pages/vaultViews/ReserveVaultView.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import ComingSoon from '../../components/ComingSoon';

// Reusable StatCard component for this page
const StatCard = ({ labelKey, value, subtext = null, isCurrency = true, className = '' }) => {
    const { t } = useTranslation();
    return (
        <div className={`profile-card ${className}`}>
            <h3>{t(labelKey)}</h3>
            <p className="stat-value-large">
                {isCurrency && '$'}
                {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
            </p>
            {subtext && <p className="stat-subtext">{subtext}</p>}
        </div>
    );
};

const ReserveVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    const { vaultInfo, userPosition, openTrades = [], assetBreakdown = [] } = pageData;

    const isInvested = userPosition && userPosition.principal > 0;
    
    // --- CALCULATIONS ---
    let userShare = {
        totalAssetAmount: 0,
        averageCost: 0,
    };
    let reserveAsset = null;
    let totalVaultAssetAmount = 0;

    if (isInvested && openTrades.length > 0 && assetBreakdown.length > 0) {
        // Find the primary reserve asset (assuming it's the first one listed)
        reserveAsset = assetBreakdown[0];

        // Calculate the vault's total holdings of the reserve asset
        totalVaultAssetAmount = openTrades.reduce((sum, trade) => sum + parseFloat(trade.quantity), 0);

        // Calculate the user's ownership percentage of the vault's principal capital
        // Note: We use principal for a stable ownership percentage that isn't affected by P&L
        const vaultTotalPrincipal = pageData.vaultStats?.totalPrincipal || totalVaultAssetAmount * openTrades[0].entry_price; // Fallback
        const userOwnershipPct = (vaultTotalPrincipal > 0) ? (userPosition.principal / vaultTotalPrincipal) : 0;
        
        // Calculate the user's pro-rata share of the total asset holdings
        userShare.totalAssetAmount = totalVaultAssetAmount * userOwnershipPct;

        // Calculate the user's average cost basis
        if (userShare.totalAssetAmount > 0) {
            userShare.averageCost = userPosition.principal / userShare.totalAssetAmount;
        }
    }
    // --- END OF CALCULATIONS ---

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
                        <div className="vault-detail-grid">
                            <StatCard labelKey="vault.stats.totalCapital" value={userPosition.totalCapital} />
                            <StatCard 
                                labelKey="reserveVault.yourHoldings"
                                value={userShare.totalAssetAmount}
                                subtext={reserveAsset ? reserveAsset.symbol : ''}
                                isCurrency={false}
                                className="text-positive"
                            />
                            <StatCard labelKey="reserveVault.avgCost" value={userShare.averageCost} subtext={`per ${reserveAsset ? reserveAsset.symbol : 'unit'}`} />
                        </div>

                        <div className="admin-card" style={{ marginTop: '24px' }}>
                            <h3>Purchase History</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>This log shows all asset purchases made by the trading desk for this vault.</p>
                            <div className="table-responsive">
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Asset</th>
                                            <th>Amount Purchased</th>
                                            <th className="amount">Price per Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {openTrades.map(trade => (
                                            <tr key={trade.trade_id}>
                                                <td>{new Date(trade.trade_opened_at).toLocaleDateString()}</td>
                                                <td>{trade.asset_symbol}</td>
                                                <td>{parseFloat(trade.quantity).toFixed(6)}</td>
                                                <td className="amount">${parseFloat(trade.entry_price).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : ( 
                    <div className="profile-card text-center">
                        <h2>{t('vault.notInvested.title')}</h2>
                        <p>{t('vault.notInvested.description')}</p>
                        <div style={{ marginTop: '24px' }}>
                            <Link to="/dashboard" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                                {t('common.goToDashboard')}
                            </Link>
                        </div>
                    </div> 
                )}
            </div>
        </Layout>
    );
};

export default ReserveVaultView;
