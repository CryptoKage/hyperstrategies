// /src/pages/Vault1Page.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import Layout from '../components/Layout';

// A reusable component for displaying key stats
const StatCard = ({ label, value, subtext = null, isCurrency = true, className = '' }) => (
    <div className={`profile-card ${className}`}>
        <h3>{label}</h3>
        <p className="stat-value-large">{isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);

// Define chart colors for consistency
const CHART_COLORS = {
    ACCOUNT: '#8884d8',
    VAULT: '#82ca9d',
    BTC: '#f7931a',
    ETH: '#627eea',
    SOL: '#9945FF',
};

const Vault1Page = () => {
    const { vaultId } = useParams();
    const [pageData, setPageData] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartView, setChartView] = useState('accountValue'); // 'accountValue' or 'performanceIndex'

    // --- Data Fetching ---
    const fetchPageData = useCallback(async () => {
        if (!vaultId) return;
        setLoading(true);
        try {
            const [userResponse, marketResponse] = await Promise.all([
                api.get(`/vault-details/${vaultId}`),
                api.get(`/market-data/${vaultId}`)
            ]);
            setPageData(userResponse.data);
            setMarketData(marketResponse.data);
        } catch (err) {
            setError("Could not load vault details. This vault may be inactive or you may not have a position yet.");
            console.error("Vault details fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [vaultId]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    // --- Chart Data Processing ---
    const formatChartData = () => {
    if (chartView === 'accountValue') {
        const history = pageData?.userPerformanceHistory || [];
        if (history.length < 2) return [];
        const baseValue = parseFloat(history[0].balance);
        if (isNaN(baseValue) || baseValue <= 0) return [];

        return history.map(point => ({
            date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            value: ((parseFloat(point.balance) / baseValue) - 1) * 100,
        }));
    } else { // performanceIndex view
        const vaultHistory = marketData?.vaultPerformance || [];
        if (vaultHistory.length < 2) return [];

        const combinedData = {};
        
        // THE FIX: Use a more granular date format for the key
        const getGranularDate = (dateStr) => new Date(dateStr).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        vaultHistory.forEach(point => {
            const date = getGranularDate(point.date);
            if (!combinedData[date]) combinedData[date] = { date };
            combinedData[date].VAULT = point.value;
        });

        if (marketData && marketData.assetPerformance) {
            for (const symbol in marketData.assetPerformance) {
                marketData.assetPerformance[symbol].forEach(point => {
                    const date = getGranularDate(point.date);
                    if (!combinedData[date]) combinedData[date] = { date };
                    combinedData[date][symbol] = point.value;
                });
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

    if (loading) {
        return <Layout><div className="vault-detail-container"><h1>Loading Vault Details...</h1></div></Layout>;
    }
    
    if (error || !pageData) {
        return <Layout><div className="vault-detail-container"><p className="error-message">{error || 'No data available for this vault.'}</p></div></Layout>;
    }

    const { 
        vaultInfo = {}, 
        userPosition = null, 
        assetBreakdown = [], 
        userLedger = [], 
        vaultStats = {} 
    } = pageData;

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
                                {vaultStats.capitalInTransit > 0 && (
                                    <StatCard label="Deposits in Transit" value={vaultStats.capitalInTransit} subtext="Waiting to be swept into the vault." />
                                )}
                            </div>
                            <div className="vault-detail-column">
                                <StatCard label="Realized P&L" value={userPosition.realizedPnl} subtext="Profits from closed trades." />
                                <StatCard label="Unrealized P&L" value={userPosition.unrealizedPnl} subtext="From currently open trades." className={userPosition.unrealizedPnl >= 0 ? 'text-positive' : 'text-negative'}/>
                            </div>
                        </div>

                        <div className="profile-card full-width">
                            <h3>Performance Journey</h3>
                            <div className="chart-toggle">
                                <button onClick={() => setChartView('accountValue')} className={chartView === 'accountValue' ? 'active' : ''}>My Account Value</button>
                                <button onClick={() => setChartView('performanceIndex')} className={chartView === 'performanceIndex' ? 'active' : ''}>Vault Performance Index</button>
                            </div>
                            
                            {chartData.length > 1 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#888" />
                                        <YAxis stroke="#888" tickFormatter={(tick) => `${tick.toFixed(1)}%`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} labelStyle={{ color: '#fff' }} formatter={(value) => `${value?.toFixed(2)}%`} />
                                        <Legend />
                                        
                                        {chartView === 'accountValue' ? (
                                            <Line type="monotone" dataKey="value" name="My Account Value" stroke={CHART_COLORS.ACCOUNT} strokeWidth={2} dot={false} />
                                        ) : (
                                            <>
                                                <Line type="monotone" dataKey="VAULT" name={`${vaultInfo.name} Index`} stroke={CHART_COLORS.VAULT} strokeWidth={2} dot={false} />
                                                {/* --- THIS IS THE FIX: ASSET LINES ARE NOW DOTTED --- */}
                                                <Line type="monotone" dataKey="BTC" name="BTC Performance" stroke={CHART_COLORS.BTC} strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                                <Line type="monotone" dataKey="ETH" name="ETH Performance" stroke={CHART_COLORS.ETH} strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                                <Line type="monotone" dataKey="SOL" name="SOL Performance" stroke={CHART_COLORS.SOL} strokeWidth={1} dot={false} strokeDasharray="3 3" />
                                            </>
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>Insufficient historical data to render chart.</p>
                            )}
                        </div>
                        
                        <div className="vault-detail-grid">
                            <div className="profile-card">
                                <h3>Asset Breakdown</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="asset-table">
                                        <thead>
                                            <tr><th>Asset</th><th className="amount">Live Price</th></tr>
                                        </thead>
                                        <tbody>
                                            {assetBreakdown.map(asset => {
                                                const cgLink = getCoinGeckoLink(asset);
                                                return (
                                                <tr key={asset.symbol}>
                                                    <td>
                                                        {cgLink ? (
                                                            <a href={cgLink} target="_blank" rel="noopener noreferrer" className="asset-link">
                                                                {asset.symbol} ↗
                                                            </a>
                                                        ) : (
                                                            <span>{asset.symbol}</span>
                                                        )}
                                                    </td>
                                                    <td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}</td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="profile-card">
                                <h3>Your Ledger</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="activity-table">
                                        <thead>
                                            <tr><th>Date</th><th>Type</th><th className="amount">Amount</th></tr>
                                        </thead>
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
