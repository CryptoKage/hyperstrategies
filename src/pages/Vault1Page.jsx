// /src/pages/Vault1Page.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';

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

// A smaller component for the new condensed snapshot grid
const SnapshotItem = ({ labelKey, value, className = '' }) => {
    const { t } = useTranslation();
    return (
        <div className="performance-snapshot-item">
            <span className={`value ${className}`}>{value?.toFixed(2)}</span>
            <span className="label">{t(labelKey)}</span>
        </div>
    );
};

const CHART_COLORS = { ACCOUNT: '#8884d8', VAULT: '#82ca9d', PROJECTION: '#facc15', BTC: '#f7931a', ETH: '#627eea', SOL: '#9945FF' };
const KNOWN_ASSETS = { '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'BTC', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ETH', '0xd31a59c85ae9d8edefec411e448fd2e703a42e99': 'SOL' };

const Vault1Page = () => {
    const { t } = useTranslation();
    const { vaultId } = useParams();
    const location = useLocation();
    const [pageData, setPageData] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [performanceSnapshot, setPerformanceSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartView, setChartView] = useState('performanceIndex');
    const [showAssetLines, setShowAssetLines] = useState(true);

    const fetchPageData = useCallback(async () => {
        if (!vaultId) return;
        const queryParams = new URLSearchParams(location.search);
        const impersonateUserId = queryParams.get('userId');
        const userApiUrl = impersonateUserId ? `/vault-details/${vaultId}?userId=${impersonateUserId}` : `/vault-details/${vaultId}`;
        setLoading(true);
        try {
            const [userResponse, marketResponse, snapshotResponse] = await Promise.all([ 
                api.get(userApiUrl), 
                api.get(`/market-data/${vaultId}`),
                api.get(`/performance/${vaultId}/snapshot`)
            ]);
            setPageData(userResponse.data);
            setMarketData(marketResponse.data);
            setPerformanceSnapshot(snapshotResponse.data);
        } catch (err) { setError(t('vault.errors.loadDetails')); } finally { setLoading(false); }
    }, [vaultId, location.search, t]);

    useEffect(() => { fetchPageData(); }, [fetchPageData]);

    const formatChartData = () => {
        if (chartView === 'accountValue') {
            const history = pageData?.userPerformanceHistory || [];
            if (history.length === 0) return [];
            return history.map(point => ({ date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }), value: parseFloat(point.balance) }));
        } else {
            if (!marketData || !marketData.vaultPerformance) return [];
            
            const rawIndexHistory = marketData.vaultPerformance;
            const rawAssetHistory = marketData.assetPerformance || []; // This is now a correct array
            if (rawIndexHistory.length < 2) return [];

            const chartPoints = {};
            const getChartDate = (dateStr) => new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

            const baseIndex = parseFloat(rawIndexHistory[0].index_value);
            rawIndexHistory.forEach(point => {
                const date = getChartDate(point.record_date);
                if (!chartPoints[date]) chartPoints[date] = { date };
                chartPoints[date].VAULT = ((parseFloat(point.index_value) / baseIndex) - 1) * 100;
            });
            
            const assetBaselines = {};
            for (const address in KNOWN_ASSETS) {
                // This line will now work because rawAssetHistory is an array.
                const firstPoint = rawAssetHistory.find(p => p.asset_prices_snapshot && p.asset_prices_snapshot[address]);
                if (firstPoint) assetBaselines[address] = parseFloat(firstPoint.asset_prices_snapshot[address]);
            }
            rawAssetHistory.forEach(point => {
                if (point.asset_prices_snapshot) {
                    const date = getChartDate(point.record_date);
                    if (!chartPoints[date]) chartPoints[date] = { date };
                    for (const address in assetBaselines) {
                        const symbol = KNOWN_ASSETS[address];
                        if (point.asset_prices_snapshot[address]) {
                            const currentPrice = parseFloat(point.asset_prices_snapshot[address]);
                            chartPoints[date][symbol] = ((currentPrice / assetBaselines[address]) - 1) * 100;
                        }
                    }
                }
            });
            
            if (pageData?.projectedIndexValue) {
                const lastPoint = rawIndexHistory[rawIndexHistory.length - 1];
                const lastDate = getChartDate(lastPoint.record_date);
                if (chartPoints[lastDate]) chartPoints[lastDate].PROJECTION = chartPoints[lastDate].VAULT;
                const projectionDate = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
                if (!chartPoints[projectionDate]) chartPoints[projectionDate] = { date: projectionDate };
                chartPoints[projectionDate].PROJECTION = ((pageData.projectedIndexValue / baseIndex) - 1) * 100;
            }

            return Object.values(chartPoints).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
    };
    
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
    const chartData = formatChartData();
    
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

                        {/* --- THE FINAL UI: The new, condensed performance card --- */}
                        {performanceSnapshot && (
                            <div className="profile-card full-width">
                                <h3>{t('vault.performanceSnapshotTitle')}</h3>
                                <div className="performance-snapshot-grid">
                                    <SnapshotItem labelKey="vault.stats.dailyReturn" value={performanceSnapshot.daily} className={performanceSnapshot.daily >= 0 ? 'text-positive' : 'text-negative'} />
                                    <SnapshotItem labelKey="vault.stats.weeklyReturn" value={performanceSnapshot.weekly} className={performanceSnapshot.weekly >= 0 ? 'text-positive' : 'text-negative'} />
                                    <SnapshotItem labelKey="vault.stats.monthlyReturn" value={performanceSnapshot.monthly} className={performanceSnapshot.monthly >= 0 ? 'text-positive' : 'text-negative'} />
                                    <SnapshotItem labelKey="vault.stats.totalReturn" value={performanceSnapshot.total} className={performanceSnapshot.total >= 0 ? 'text-positive' : 'text-negative'} />
                                </div>
                                <p className="stat-subtext" style={{textAlign: 'center', marginTop: '1rem'}}>{t('vault.performanceSnapshotSubtext')}</p>
                            </div>
                        )}

                        <div className="profile-card full-width">
                            <h3>{t('vault.chart.title')}</h3>
                            <div className="chart-toggle">
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button onClick={() => setChartView('accountValue')} className={chartView === 'accountValue' ? 'active' : ''}>{t('vault.chart.myAccountValue')}</button>
                                    <button onClick={() => setChartView('performanceIndex')} className={chartView === 'performanceIndex' ? 'active' : ''}>{t('vault.chart.vaultPerformanceIndex')}</button>
                                </div>
                                {chartView === 'performanceIndex' && (
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc'}}>
                                        <input type="checkbox" id="asset-toggle" checked={showAssetLines} onChange={(e) => setShowAssetLines(e.target.checked)} />
                                        <label htmlFor="asset-toggle">{t('vault.chart.compareAssets')}</label>
                                    </div>
                                )}
                            </div>
                            
                            {chartData.length > 1 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={chartData} margin={{ top: 20, right: 25, left: 20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#888" />
                                        <YAxis stroke="#888" tickFormatter={(tick) => chartView === 'accountValue' ? `$${Math.round(tick)}` : `${tick.toFixed(1)}%`} />
                                        <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333'}} labelStyle={{color: '#fff'}} formatter={(value) => chartView === 'accountValue' ? `$${value?.toFixed(2)}` : `${value?.toFixed(2)}%`} />
                                        <Legend />
                                        {chartView === 'accountValue' ? (
                                            <Line type="monotone" dataKey="value" name={t('vault.chart.legend.myAccountValue')} stroke={CHART_COLORS.ACCOUNT} dot={false} />
                                        ) : (
                                            <>
                                                <Line type="monotone" dataKey="VAULT" name={t('vault.chart.legend.vaultIndex', { vaultName: vaultInfo.name })} stroke={CHART_COLORS.VAULT} dot={false} />
                                                <Line type="monotone" dataKey="PROJECTION" name={t('vault.chart.legend.withUnrealized')} stroke={CHART_COLORS.PROJECTION} dot={false} strokeDasharray="2 6" connectNulls />
                                                {showAssetLines && (
                                                    <>
                                                        <Line type="monotone" dataKey="BTC" name={t('vault.chart.legend.btc')} stroke={CHART_COLORS.BTC} dot={false} strokeDasharray="3 3" connectNulls />
                                                        <Line type="monotone" dataKey="ETH" name={t('vault.chart.legend.eth')} stroke={CHART_COLORS.ETH} dot={false} strokeDasharray="3 3" connectNulls />
                                                        <Line type="monotone" dataKey="SOL" name={t('vault.chart.legend.sol')} stroke={CHART_COLORS.SOL} dot={false} strokeDasharray="3 3" connectNulls />
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : ( <p>{t('vault.errors.noChartData')}</p> )}
                        </div>
                        
                        <div className="vault-detail-grid">
                            <div className="profile-card">
                                <h3>{t('vault.assetBreakdown.title')}</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="asset-table">
                                        <thead><tr><th>{t('vault.assetBreakdown.asset')}</th><th className="amount">{t('vault.assetBreakdown.livePrice')}</th></tr></thead>
                                        <tbody>
                                            {assetBreakdown.map(asset => (<tr key={asset.symbol}><td>{getCoinGeckoLink(asset) ? (<a href={getCoinGeckoLink(asset)} target="_blank" rel="noopener noreferrer" className="asset-link">{asset.symbol} ↗</a>) : (<span>{asset.symbol}</span>)}</td><td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}</td></tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="profile-card">
                                <h3>{t('vault.ledger.title')}</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="activity-table">
                                        <thead><tr><th>{t('vault.ledger.date')}</th><th>{t('vault.ledger.type')}</th><th className="amount">{t('vault.ledger.amount')}</th></tr></thead>
                                        <tbody>
                                            {userLedger.map(entry => (<tr key={entry.entry_id}><td>{new Date(entry.created_at).toLocaleDateString()}</td><td>{t(`ledgerTypes.${entry.entry_type}`, entry.entry_type.replace(/_/g, ' '))}</td><td className={`amount ${parseFloat(entry.amount) >= 0 ? 'text-positive' : 'text-negative'}`}>{`${parseFloat(entry.amount) >= 0 ? '+' : ''}${parseFloat(entry.amount).toFixed(2)}`}</td></tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : ( <div className="profile-card text-center"><h2>{t('vault.notInvested.title')}</h2><p>{t('vault.notInvested.description')}</p><Link to="/dashboard" className="btn-primary mt-4">{t('common.goToDashboard')}</Link></div> )}
            </div>
        </Layout>
    );
};

export default Vault1Page;
