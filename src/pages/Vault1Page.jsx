// /src/pages/Vault1Page.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon'; // Import our simple component

// Main StatCard for top-level stats
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

const Vault1Page = () => {
    const { t } = useTranslation();
    const { vaultId } = useParams();
    const location = useLocation();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPageData = useCallback(async () => {
        if (!vaultId) return;
        const queryParams = new URLSearchParams(location.search);
        const impersonateUserId = queryParams.get('userId');
        const userApiUrl = impersonateUserId ? `/vault-details/${vaultId}?userId=${impersonateUserId}` : `/vault-details/${vaultId}`;
        setLoading(true);
        try {
            // We simplify the API call, no longer needing market or snapshot data for this page.
            const userResponse = await api.get(userApiUrl);
            setPageData(userResponse.data);
        } catch (err) {
            setError(t('vault.errors.loadDetails'));
        } finally {
            setLoading(false);
        }
    }, [vaultId, location.search, t]);

    useEffect(() => { fetchPageData(); }, [fetchPageData]);
    
    const getCoinGeckoLink = (asset) => {
        if (asset && asset.coingecko_id) {
            return `https://www.coingecko.com/en/coins/${asset.coingecko_id}`;
        }
        return null;
    };

    if (loading) { return <Layout><div className="vault-detail-container"><h1>{t('common.loading')}</h1></div></Layout>; }
    if (error || !pageData) { return <Layout><div className="vault-detail-container"><p className="error-message">{error || t('vault.errors.noData')}</p></div></Layout>; }

    const { vaultInfo = {}, userPosition = null, assetBreakdown = [], userLedger = [] } = pageData;
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
                        <div className="vault-detail-grid">
                            <div className="vault-detail-column"><StatCard labelKey="vault.stats.totalCapital" value={userPosition.totalCapital} subtextKey="vault.stats.totalCapitalSubtext" /></div>
                            <div className="vault-detail-column"><StatCard labelKey="vault.stats.realizedPnl" value={userPosition.realizedPnl} subtextKey="vault.stats.realizedPnlSubtext" /><StatCard labelKey="vault.stats.unrealizedPnl" value={userPosition.unrealizedPnl} subtextKey="vault.stats.unrealizedPnlSubtext" className={userPosition.unrealizedPnl >= 0 ? 'text-positive' : 'text-negative'}/></div>
                        </div>
                        
                        {/* --- THE FIX: Replace all analytics with our simple ComingSoon component --- */}
                        <ComingSoon featureKey="analytics" />

                        <div className="vault-detail-grid" style={{ marginTop: '24px' }}>
                            <div className="profile-card">
                                <h3>{t('vault.assetBreakdown.title')}</h3>
                                <div className="table-responsive-wrapper"><table className="asset-table"><thead><tr><th>{t('vault.assetBreakdown.asset')}</th><th className="amount">{t('vault.assetBreakdown.livePrice')}</th></tr></thead><tbody>{assetBreakdown.map(asset => (<tr key={asset.symbol}><td>{getCoinGeckoLink(asset) ? (<a href={getCoinGeckoLink(asset)} target="_blank" rel="noopener noreferrer" className="asset-link">{asset.symbol} ↗</a>) : (<span>{asset.symbol}</span>)}</td><td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}</td></tr>))}</tbody></table></div>
                            </div>
                            <div className="profile-card">
                                <h3>{t('vault.ledger.title')}</h3>
                                <div className="table-responsive-wrapper"><table className="activity-table"><thead><tr><th>{t('vault.ledger.date')}</th><th>{t('vault.ledger.type')}</th><th className="amount">{t('vault.ledger.amount')}</th></tr></thead><tbody>{userLedger.map(entry => (<tr key={entry.entry_id}><td>{new Date(entry.created_at).toLocaleDateString()}</td><td>{t(`ledgerTypes.${entry.entry_type}`, entry.entry_type.replace(/_/g, ' '))}</td><td className={`amount ${parseFloat(entry.amount) >= 0 ? 'text-positive' : 'text-negative'}`}>{`${parseFloat(entry.amount) >= 0 ? '+' : ''}${parseFloat(entry.amount).toFixed(2)}`}</td></tr>))}</tbody></table></div>
                            </div>
                        </div>
                    </>
                ) : ( <div className="profile-card text-center"><h2>{t('vault.notInvested.title')}</h2><p>{t('vault.notInvested.description')}</p><Link to="/dashboard" className="btn-primary mt-4">{t('common.goToDashboard')}</Link></div> )}
            </div>
        </Layout>
    );
};

export default Vault1Page;
