// src/pages/vaultViews/ReserveVaultView.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';

// A reusable StatCard, tailored for this page's layout
const StatCard = ({ labelKey, value, subtext = null, isCurrency = true, className = '' }) => {
    const { t } = useTranslation();
    const formattedValue = typeof value === 'number'
        ? value.toLocaleString('en-US', { minimumFractionDigits: isCurrency ? 2 : 6, maximumFractionDigits: isCurrency ? 2 : 6 })
        : 'N/A';

    return (
        <div className={`profile-card ${className}`}>
            <h3>{t(labelKey)}</h3>
            <p className="stat-value-large">
                {isCurrency && '$'}{formattedValue}
            </p>
            {subtext && <p className="stat-subtext">{subtext}</p>}
        </div>
    );
};

const ReserveVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    const { vaultInfo, userPosition, openTrades = [], assetBreakdown = [] } = pageData;

    const isInvested = userPosition && userPosition.principal > 0;
    
    // --- Data Calculations ---
    let userShare = { totalAssetAmount: 0, averageCost: 0 };
    let reserveAsset = null;

    if (isInvested && openTrades.length > 0 && assetBreakdown.length > 0) {
        // Find the primary asset using our new flag. Fallback to the first asset.
        reserveAsset = assetBreakdown.find(a => a.is_primary_asset) || assetBreakdown[0];

        // The vault's total holdings is the sum of all 'buy' quantities.
        const totalVaultAssetAmount = openTrades.reduce((sum, trade) => sum + parseFloat(trade.quantity), 0);
        
        // We need the vault's total principal to calculate user ownership.
        // The API provides this in a roundabout way, let's calculate it robustly.
        const vaultTotalPrincipal = openTrades.reduce((sum, trade) => sum + (parseFloat(trade.quantity) * parseFloat(trade.entry_price)), 0);
        
        const userOwnershipPct = (vaultTotalPrincipal > 0) ? (userPosition.principal / vaultTotalPrincipal) : 0;
        
        userShare.totalAssetAmount = totalVaultAssetAmount * userOwnershipPct;

        if (userShare.totalAssetAmount > 0) {
            userShare.averageCost = userPosition.principal / userShare.totalAssetAmount;
        }
    }
    // --- End Calculations ---

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
                            <StatCard 
                                labelKey="reserveVault.avgCost" 
                                value={userShare.averageCost} 
                                subtext={`per ${reserveAsset ? reserveAsset.symbol : 'unit'}`} 
                            />
                        </div>

                        <div className="admin-card" style={{ marginTop: '24px' }}>
                            <h3>Vault Purchase History</h3>
                            <p className="form-description">This log shows all asset purchases made by the trading desk for this vault's reserve.</p>
                            <div className="table-responsive">
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Asset Purchased</th>
                                            <th>Amount</th>
                                            <th className="amount">Price per Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {openTrades.sort((a,b) => new Date(b.trade_opened_at) - new Date(a.trade_opened_at)).map(trade => (
                                            <tr key={trade.trade_id}>
                                                <td>{new Date(trade.trade_opened_at).toLocaleDateString()}</td>
                                                <td>{trade.asset_symbol}</td>
                                                <td>{parseFloat(trade.quantity).toFixed(6)}</td>
                                                <td className="amount">${parseFloat(trade.entry_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
