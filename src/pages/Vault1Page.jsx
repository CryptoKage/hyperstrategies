// /src/pages/Vault1Page.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import Layout from '../components/Layout';

const StatCard = ({ label, value, subtext = null, isCurrency = true, className = '' }) => (
    <div className={`profile-card ${className}`}>
        <h3>{label}</h3>
        <p className="stat-value-large">{isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);

const CHART_COLORS = { ACCOUNT: '#8884d8', VAULT: '#82ca9d', PROJECTION: '#82ca9d', BTC: '#f7931a', ETH: '#627eea', SOL: '#9945FF' };

const Vault1Page = () => {
    const { vaultId } = useParams();
    const location = useLocation();

    const [pageData, setPageData] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartView, setChartView] = useState('accountValue');
    const [showAssetLines, setShowAssetLines] = useState(false);

    const fetchPageData = useCallback(async () => {
        if (!vaultId) return;
        const queryParams = new URLSearchParams(location.search);
        const impersonateUserId = queryParams.get('userId');
        const userApiUrl = impersonateUserId ? `/vault-details/${vaultId}?userId=${impersonateUserId}` : `/vault-details/${vaultId}`;
        setLoading(true);
        try {
            const [userResponse, marketResponse] = await Promise.all([ api.get(userApiUrl), api.get(`/market-data/${vaultId}`) ]);
            setPageData(userResponse.data);
            setMarketData(marketResponse.data);
        } catch (err) {
            setError("Could not load vault details.");
        } finally {
            setLoading(false);
        }
    }, [vaultId, location.search]);

    useEffect(() => { fetchPageData(); }, [fetchPageData]);

    const formatChartData = () => {
        // --- THE FIX: Return raw USD for Account Value ---
        if (chartView === 'accountValue') {
            const history = pageData?.userPerformanceHistory || [];
            if (history.length === 0) return [];
            return history.map(point => ({
                date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
                value: parseFloat(point.balance),
            }));
        } else { // performanceIndex view
            const vaultHistory = marketData?.vaultPerformance || [];
            if (vaultHistory.length < 2) return [];
            
            const combinedData = {};
            const getGranularDate = (dateStr) => new Date(dateStr).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

            // Normalize the main index line
            const baseIndexValue = parseFloat(vaultHistory[0].value) + 100;
            vaultHistory.forEach(point => {
                const date = getGranularDate(point.date);
                if (!combinedData[date]) combinedData[date] = { date };
                combinedData[date].VAULT = ((parseFloat(point.value) + 100) / baseIndexValue * 100) - 100;
            });

            // Normalize asset lines
            if (marketData && marketData.assetPerformance) {
                for (const symbol in marketData.assetPerformance) {
                    const assetHistory = marketData.assetPerformance[symbol];
                    if(assetHistory.length > 0) {
                        const baseAssetValue = parseFloat(assetHistory[0].value) + 100;
                        assetHistory.forEach(point => {
                            const date = getGranularDate(point.date);
                            if (!combinedData[date]) combinedData[date] = { date };
                            combinedData[date][symbol] = ((parseFloat(point.value) + 100) / baseAssetValue * 100) - 100;
                        });
                    }
                }
            }

            // --- ADD THE PROJECTION LINE ---
            if (pageData && pageData.projectedIndexValue && vaultHistory.length > 0) {
                const lastHistoricalPoint = vaultHistory[vaultHistory.length - 1];
                const normalizedProjection = ((pageData.projectedIndexValue / baseIndexValue) * 100) - 100;
                
                const todayStr = new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                if (!combinedData[todayStr]) combinedData[todayStr] = { date: todayStr };
                combinedData[todayStr].PROJECTION = normalizedProjection;

                const lastDate = getGranularDate(lastHistoricalPoint.date);
                if (combinedData[lastDate]) {
                    combinedData[lastDate].PROJECTION = combinedData[lastDate].VAULT;
                }
            }
            return Object.values(combinedData);
        }
    };
    
    // Helper to get CoinGecko link
    const getCoinGeckoLink = (asset) => {
        if (asset && asset.coingecko_id) {
            return `https://www.coingecko.com/en/coins/${asset.coingecko_id}`;
        }
        return null;
    };

      if (loading) { return <Layout><h1>Loading...</h1></Layout>; }
    if (error || !pageData) { return <Layout><p className="error-message">{error}</p></Layout>; }

    const { vaultInfo = {}, userPosition = null, assetBreakdown = [], userLedger = [] } = pageData;
    const hasPrincipal = userPosition && userPosition.principal > 0;
    const chartData = formatChartData();
    
    return (
        <Layout>
            <div className="vault-detail-container">
                <div className="vault-detail-header">
                    <h1>{vaultInfo.name || 'Vault Details'}</h1>
                    <Link to="/dashboard" className="btn-secondary btn-sm">← Back to Dashboard</Link>
                </div>
                <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
                
                {hasPrincipal ? (
                    <>
                        <div className="vault-detail-grid">
                            <div className="vault-detail-column">
                                <StatCard label="Your Total Capital" value={userPosition.totalCapital} subtext="Principal + Realized & Unrealized P&L" />
                                {/* --- THE FIX: Comment out the Deposits in Transit card --- */}
                                {/* {vaultStats.capitalInTransit > 0 && <StatCard label="Deposits in Transit" value={vaultStats.capitalInTransit} />} */}
                            </div>
                            <div className="vault-detail-column">
                                <StatCard label="Realized P&L" value={userPosition.realizedPnl} subtext="Profits from closed trades." />
                                <StatCard label="Unrealized P&L" value={userPosition.unrealizedPnl} subtext="From currently open trades." className={userPosition.unrealizedPnl >= 0 ? 'text-positive' : 'text-negative'}/>
                            </div>
                        </div>

                        <div className="profile-card full-width">
                            <h3>Performance Journey</h3>
                            <div className="chart-toggle">
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setChartView('accountValue')} className={chartView === 'accountValue' ? 'active' : ''}>My Account Value</button>
                                    <button onClick={() => setChartView('performanceIndex')} className={chartView === 'performanceIndex' ? 'active' : ''}>Vault Performance Index</button>
                                </div>
                                {chartView === 'performanceIndex' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc' }}>
                                        <input type="checkbox" id="asset-toggle" checked={showAssetLines} onChange={(e) => setShowAssetLines(e.target.checked)} />
                                        <label htmlFor="asset-toggle">Compare Assets</label>
                                    </div>
                                )}
                            </div>
                            
                            {chartData.length > (chartView === 'accountValue' ? 0 : 1) ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#888" />
                                        {/* --- THE FIX: Dynamic Y-Axis --- */}
                                        <YAxis stroke="#888" tickFormatter={(tick) => chartView === 'accountValue' ? `$${Math.round(tick)}` : `${tick.toFixed(1)}%`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} labelStyle={{ color: '#fff' }} formatter={(value) => chartView === 'accountValue' ? `$${value?.toFixed(2)}` : `${value?.toFixed(2)}%`} />
                                        <Legend />
                                        
                                        {chartView === 'accountValue' ? (
                                            <Line type="monotone" dataKey="value" name="My Account Value" stroke={CHART_COLORS.ACCOUNT} strokeWidth={2} dot={false} />
                                        ) : (
                                            <>
                                                <Line type="monotone" dataKey="VAULT" name={`${vaultInfo.name} Index`} stroke={CHART_COLORS.VAULT} strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="PROJECTION" name="With Unrealized P&L" stroke={CHART_COLORS.PROJECTION} strokeWidth={2} dot={false} strokeDasharray="2 6" />
                                                {showAssetLines && (
                                                    <>
                                                        <Line type="monotone" dataKey="BTC" name="BTC Performance" stroke={CHART_COLORS.BTC} strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                                        <Line type="monotone" dataKey="ETH" name="ETH Performance" stroke={CHART_COLORS.ETH} strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                                        <Line type="monotone" dataKey="SOL" name="SOL Performance" stroke={CHART_COLORS.SOL} strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : ( <p>Insufficient historical data to render chart.</p> )}
                        </div>
                        
                        {/* Tables Section */}
                        <div className="vault-detail-grid">
                            <div className="profile-card">
                                <h3>Asset Breakdown</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="asset-table">
                                        <thead><tr><th>Asset</th><th className="amount">Live Price</th></tr></thead>
                                        <tbody>
                                            {assetBreakdown.map(asset => (
                                                <tr key={asset.symbol}>
                                                    <td>
                                                        {getCoinGeckoLink(asset) ? (<a href={getCoinGeckoLink(asset)} target="_blank" rel="noopener noreferrer" className="asset-link">{asset.symbol} ↗</a>) : (<span>{asset.symbol}</span>)}
                                                    </td>
                                                    <td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="profile-card">
                                <h3>Your Ledger</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="activity-table">
                                        <thead><tr><th>Date</th><th>Type</th><th className="amount">Amount</th></tr></thead>
                                        <tbody>
                                            {userLedger.map(entry => (
                                                <tr key={entry.entry_id}>
                                                    <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                                                    <td>{entry.entry_type.replace(/_/g, ' ')}</td>
                                                    <td className={`amount ${parseFloat(entry.amount) >= 0 ? 'text-positive' : 'text-negative'}`}>
                                                        {`${parseFloat(entry.amount) >= 0 ? '+' : ''}${parseFloat(entry.amount).toFixed(2)}`}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="profile-card text-center">
                        <h2>You are not currently invested in this vault.</h2>
                        <p>To see your performance, make a deposit from your dashboard.</p>
                        <Link to="/dashboard" className="btn-primary mt-4">Go to Dashboard</Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Vault1Page;
