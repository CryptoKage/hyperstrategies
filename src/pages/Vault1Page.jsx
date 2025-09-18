// /src/pages/Vault1Page.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

// A reusable component for displaying key stats
const StatCard = ({ label, value, subtext = null, isCurrency = true, className = '' }) => (
    <div className={`profile-card ${className}`}>
        <h3>{label}</h3>
        <p className="stat-value-large">{isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);

const Vault1Page = () => {
    const { vaultId } = useParams();
    const { isBalanceHidden } = useAuth(); // Assuming useAuth provides this
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all vault data from our new, powerful API endpoint
    const fetchVaultDetails = useCallback(async () => {
        if (!vaultId) return;
        setLoading(true);
        try {
            const response = await api.get(`/vault-details/${vaultId}`);
            setPageData(response.data);
        } catch (err) {
            setError("Could not load vault details. This vault may be inactive or you may not have a position yet.");
            console.error("Vault details fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [vaultId]);

    useEffect(() => {
        fetchVaultDetails();
    }, [fetchVaultDetails]);

    // This function processes the data from the API to format it for the chart
    // It now calculates percentage change relative to the first point AND includes the projected line
    const formatChartData = (history = [], currentUnrealizedPnl = 0) => {
        if (!history || history.length < 2) return [];

        const baseValue = parseFloat(history[0].balance);
        if (isNaN(baseValue) || baseValue <= 0) return []; // Cannot calculate % change from zero or invalid base

        return history.map(point => {
            const settledBalance = parseFloat(point.balance);
            
            // Main line: % growth of the settled balance relative to the first point
            const settledPerformance = ((settledBalance / baseValue) - 1) * 100;
            
            // Projected line: settled balance + current unrealized P&L, all relative to the initial base value
            // This visually represents what the "performance" would look like if current P&L was baked in historically
            const projectedTotal = settledBalance + currentUnrealizedPnl;
            const projectedPerformance = ((projectedTotal / baseValue) - 1) * 100;

            return {
                date: new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
                "Settled Performance": settledPerformance,
                "Projected Performance": projectedPerformance,
            };
        });
    };
    
    // Helper to get CoinGecko link
    const getCoinGeckoLink = (asset) => {
        // You'll need to store a coingecko_id in vault_assets for this to work
        if (asset && asset.coingecko_id) {
            return `https://www.coingecko.com/en/coins/${asset.coingecko_id}`;
        }
        return null;
    };


    if (loading) {
        return <Layout><div className="vault-detail-container"><h1>Loading Vault Details...</h1></div></Layout>;
    }
    
    if (error || !pageData) {
        return <Layout><div className="vault-detail-container"><p className="error-message">{error}</p></div></Layout>;
    }

    const { 
        vaultInfo = {}, 
        userPosition = null, 
        assetBreakdown = [], 
        userLedger = [], 
        userPerformanceHistory = [],
        vaultStats = {} 
    } = pageData;

    // Determine if the user has any principal invested (actual deposits)
    const hasPrincipal = userPosition && userPosition.principal > 0;
    const chartData = formatChartData(userPerformanceHistory, userPosition?.unrealizedPnl || 0);

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
                            {/* Column 1: Main Position Stats */}
                            <div className="vault-detail-column">
                                <StatCard label="Your Total Capital" value={userPosition.totalCapital} subtext="Principal + Realized & Unrealized P&L" />
                                {vaultStats.capitalInTransit > 0 && (
                                    <StatCard label="Deposits in Transit" value={vaultStats.capitalInTransit} subtext="Waiting to be swept into the vault." />
                                )}
                            </div>

                            {/* Column 2: P&L Breakdown */}
                            <div className="vault-detail-column">
                                <StatCard label="Realized P&L" value={userPosition.realizedPnl} subtext="Profits from closed trades." />
                                <StatCard label="Unrealized P&L" value={userPosition.unrealizedPnl} subtext="From currently open trades." className={userPosition.unrealizedPnl >= 0 ? 'text-positive' : 'text-negative'}/>
                                {vaultStats.pendingWithdrawals > 0 && (
                                    <StatCard label="Pending Withdrawals" value={vaultStats.pendingWithdrawals} subtext="Funds being processed for withdrawal." />
                                )}
                            </div>
                        </div>

                        {/* The Performance Chart */}
                        <div className="profile-card full-width">
                            <h3>Your Performance Journey</h3>
                            {chartData.length > 1 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#888" />
                                        <YAxis stroke="#888" tickFormatter={(tick) => `${tick.toFixed(1)}%`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                            labelStyle={{ color: '#fff' }}
                                            formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="Settled Performance" name="Your Settled Balance" stroke="#8884d8" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="Projected Performance" name="Projected Total (with Current Unrealized P&L)" stroke="#facc15" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p>Your performance chart will appear here after your first deposit and a P&L distribution.</p>
                            )}
                        </div>

                        {/* Asset and Transaction Tables */}
                        <div className="vault-detail-grid">
                            <div className="profile-card">
                                <h3>Asset Breakdown</h3>
                                <div className="table-responsive-wrapper">
                                    <table className="asset-table">
                                        <thead>
                                            <tr><th>Asset</th><th className="amount">Live Price</th></tr>
                                        </thead>
                                        <tbody>
                                            {assetBreakdown.map(asset => (
                                                <tr key={asset.symbol}>
                                                    <td>
                                                        {getCoinGeckoLink(asset) ? (
                                                            <a href={getCoinGeckoLink(asset)} target="_blank" rel="noopener noreferrer" className="asset-link">
                                                                {asset.symbol} ↗
                                                            </a>
                                                        ) : (
                                                            <span>{asset.symbol}</span>
                                                        )}
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
