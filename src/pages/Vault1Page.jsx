import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

// StatCard component remains the same
const StatCard = ({ label, value, subtext = null, isCurrency = true }) => (
    <div className="profile-card">
        <h3>{label}</h3>
        <p className="stat-value-large">{isCurrency && '$'}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);


const Vault1Page = () => {
    const { vaultId } = useParams();
    const { isBalanceHidden } = useAuth();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchVaultDetails = useCallback(async () => {
        if (!vaultId) return;
        setLoading(true);
        try {
            const response = await api.get(`/vault-details/${vaultId}`);
            setPageData(response.data);
        } catch (err) {
            setError("Could not load vault details.");
        } finally {
            setLoading(false);
        }
    }, [vaultId]);

    useEffect(() => {
        fetchVaultDetails();
    }, [fetchVaultDetails]);
    
    // ==============================================================================
    // --- FINAL UPGRADE: Normalize all chart data to percentage change ---
    // ==============================================================================
    const formatChartData = (data = [], assets = []) => {
        const reversedData = [...data].reverse(); // Oldest data first
        if (reversedData.length === 0) return [];

        const assetSymbols = assets.map(a => a.symbol.toUpperCase());
        const firstPoint = reversedData[0];
        
        // Establish the baseline "Day 0" values
        const basePnl = parseFloat(firstPoint.pnl_percentage);
        const basePrices = {};
        if (firstPoint.asset_prices_snapshot) {
            for (const symbol of assetSymbols) {
                basePrices[symbol] = firstPoint.asset_prices_snapshot[symbol];
            }
        }

        return reversedData.map(item => {
            const formattedItem = {
                date: new Date(item.record_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
                // Normalize Vault P&L against the first day's P&L
                "Vault P&L": parseFloat(item.pnl_percentage) - basePnl,
            };
            
            if (item.asset_prices_snapshot) {
                for (const symbol of assetSymbols) {
                    const currentPrice = item.asset_prices_snapshot[symbol];
                    const basePrice = basePrices[symbol];
                    if (currentPrice && basePrice > 0) {
                        // Normalize asset price to percentage change
                        formattedItem[symbol] = ((currentPrice / basePrice) - 1) * 100;
                    }
                }
            }
            return formattedItem;
        });
    };

    const getCoinGeckoLink = (asset) => {
        if (asset && asset.coingecko_id) {
            return `https://www.coingecko.com/en/coins/${asset.coingecko_id}`;
        }
        return null;
    };
    
    if (loading) return <Layout><div className="vault-detail-container"><h1>Loading...</h1></div></Layout>;
    if (error || !pageData) return <Layout><div className="vault-detail-container"><p className="error-message">{error || 'No data.'}</p></div></Layout>;

    const { 
        vaultInfo = {}, 
        userPosition = null, 
        performanceHistory = [], 
        assetBreakdown = [], 
        userLedger = [], 
        vaultStats = {} 
    } = pageData;

    const isInvested = userPosition && userPosition.totalCapital > 0;
    const chartData = formatChartData(performanceHistory, assetBreakdown);
    const chartAssets = assetBreakdown.filter(a => a.symbol !== 'USDC').map(a => a.symbol.toUpperCase());

    const lineColors = { BTC: '#F7931A', ETH: '#8884d8', SOL: '#9945FF', HYPE: '#38BDF8' };

    return (
    <Layout>
      <div className="vault-detail-container">
        <div className="vault-detail-header">
          <h1>{vaultInfo.name || 'Vault Details'}</h1>
          <Link to="/dashboard" className="btn-secondary btn-sm">← Back to Dashboard</Link>
        </div>
        <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
        
        <div className="vault-detail-grid">
          <div className="vault-detail-column">
            {isInvested && (
              <div className="profile-card">
                <h3>Your Position</h3>
                <div className="stat-item"><span>Total Capital</span><span>{isBalanceHidden ? '******' : `$${userPosition.totalCapital.toFixed(2)}`}</span></div>
                <div className="stat-item"><span>Total Unrealized P&L</span><span className={userPosition.totalPnl >= 0 ? 'text-positive' : 'text-negative'}>{isBalanceHidden ? '******' : `${userPosition.totalPnl >= 0 ? '+' : ''}$${userPosition.totalPnl.toFixed(2)}`}</span></div>
              </div>
            )}
            {vaultStats.capitalInTransit > 0 && (
                <StatCard label="Your Capital in Transit" value={vaultStats.capitalInTransit} subtext="Deposits waiting to be swept into trades." />
            )}
            {vaultStats.pendingWithdrawals > 0 && (
                <StatCard label="Your Pending Withdrawals" value={vaultStats.pendingWithdrawals} subtext="Funds being processed for withdrawal from this vault." />
            )}
          </div>

          <div className="vault-detail-column">
            <div className="profile-card">
                <h3>Asset Breakdown</h3>
                <div className="table-responsive-wrapper">
                    <table className="asset-table">
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th className="amount">Live Price</th>
                                {isInvested && <th className="amount">Your P&L</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {assetBreakdown.map(asset => {
                                const cgLink = getCoinGeckoLink(asset);
                                const userPnlForAsset = userPosition?.pnlByAsset?.[asset.symbol] || 0;
                                return (
                                <tr key={asset.symbol}>
                                    <td>
                                    {cgLink ? (<a href={cgLink} target="_blank" rel="noopener noreferrer" className="asset-link">{asset.symbol} ↗</a>) : (<span>{asset.symbol}</span>)}
                                    </td>
                                    <td className="amount">${asset.livePrice ? asset.livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'N/A'}</td>
                                    {isInvested && (
                                        <td className={`amount ${userPnlForAsset >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {isBalanceHidden ? '******' : `${userPnlForAsset >= 0 ? '+' : ''}$${userPnlForAsset.toFixed(2)}`}
                                        </td>
                                    )}
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>

        <div className="profile-card full-width">
          <h3>Overall Vault Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
              <YAxis yAxisId="left" label={{ value: 'Vault P&L (%)', angle: -90, position: 'insideLeft' }} stroke="#4ade80" />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Asset Price ($)', angle: 90, position: 'insideRight' }} stroke="var(--color-text-secondary)" domain={['dataMin - 1000', 'dataMax + 1000']} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
              <Legend />
              
              <Line yAxisId="left" type="monotone" dataKey="pnl" name="Vault P&L" unit="%" stroke="#4ade80" strokeWidth={3} dot={false} />
              
              {chartAssets.map(symbol => (
                <Line 
                  key={symbol}
                  yAxisId="right" 
                  type="monotone" 
                  dataKey={symbol} 
                  name={`${symbol} Price`}
                  unit="$"
                  stroke={lineColors[symbol] || '#ffffff'} 
                  strokeWidth={1} 
                  strokeDasharray="3 3" 
                  dot={false} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {isInvested && userLedger && userLedger.length > 0 && (
            <div className="profile-card full-width">
              <h3>Your Transaction History</h3>
              <div className="table-responsive-wrapper">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="amount">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLedger.map(entry => (
                      <tr key={entry.entry_id}>
                        <td>{new Date(entry.created_at).toLocaleString()}</td>
                        <td>{entry.entry_type.replace(/_/g, ' ')}</td>
                        <td>
                          <span className={`status-badge status-${entry.status.toLowerCase()}`}>
                            {entry.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={`amount ${parseFloat(entry.amount) >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {`${parseFloat(entry.amount) > 0 ? '+' : ''}${parseFloat(entry.amount).toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </Layout>
  );
};

export default Vault1Page;
