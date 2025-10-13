// src/pages/admin/DeskResultsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DeskResultsPage = () => {
    const [vaults, setVaults] = useState([]);
    const [selectedVaultId, setSelectedVaultId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [supportingEvents, setSupportingEvents] = useState([]);

    // State for Monthly Summary Form
    const [monthlyPerf, setMonthlyPerf] = useState({ pnlPercentage: '', notes: '' });
    const [isSavingSummary, setIsSavingSummary] = useState(false);
    const [summaryMessage, setSummaryMessage] = useState({ type: '', text: '' });

    // State for New Trade Form
    const [newTrade, setNewTrade] = useState({ asset_symbol: '', direction: 'LONG', quantity: '', entry_price: '', contract_address: '', chain: 'ETHEREUM' });
    const [isLoggingTrade, setIsLoggingTrade] = useState(false);

    // State for New Vault Event Form
    const [newEvent, setNewEvent] = useState({ eventType: 'AIRDROP_RECEIVED', description: '', valueUsd: '', txHash: '' });
    const [isLoggingEvent, setIsLoggingEvent] = useState(false);


    // Fetch list of all vaults on component mount
    useEffect(() => {
        const fetchVaults = async () => {
          try {
            // Reusing the dashboard endpoint to get the vault list
            const response = await api.get('/dashboard'); 
            const activeVaults = response.data.vaults.filter(v => v.status === 'active');
            setVaults(activeVaults);
            if (activeVaults.length > 0) {
              setSelectedVaultId(activeVaults[0].vault_id);
            }
          } catch (err) {
            setError('Could not fetch list of vaults.');
          }
        };
        fetchVaults();
    }, []);

    // Fetch supporting events when vault or month changes
    const fetchSupportingEvents = useCallback(async () => {
        if (!selectedVaultId || !selectedMonth) {
            setSupportingEvents([]);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const monthDate = new Date(selectedMonth + '-01');
            const startDate = monthDate.toISOString().split('T')[0];
            const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).toISOString().split('T')[0];

            const response = await api.get(`/admin/vaults/${selectedVaultId}/supporting-events?startDate=${startDate}&endDate=${endDate}`);
            setSupportingEvents(response.data);
        } catch (err) {
            setError('Failed to fetch supporting events for this period.');
        } finally {
            setLoading(false);
        }
    }, [selectedVaultId, selectedMonth]);

    useEffect(() => {
        fetchSupportingEvents();
    }, [fetchSupportingEvents]);


    // Handlers for form submissions
    // in src/pages/admin/DeskResultsPage.jsx

const handleGenerateReports = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to generate all user reports for ${selectedMonth}? This will overwrite any existing drafts for this period.`)) {
        return;
    }

    setIsSavingSummary(true);
    setSummaryMessage({ type: '', text: '' });
    try {
        const monthDate = new Date(selectedMonth + '-01');
        const formattedMonth = monthDate.toISOString().split('T')[0];
        
        const payload = { 
            vaultId: selectedVaultId, 
            month: formattedMonth, 
            pnlPercentage: monthlyPerf.pnlPercentage,
            notes: monthlyPerf.notes
        };

        // Call our NEW endpoint
        const response = await api.post('/admin/reports/generate-monthly-drafts', payload);
        
        setSummaryMessage({ type: 'success', text: response.data.message });
    } catch (err) {
        setSummaryMessage({ type: 'error', text: err.response?.data?.error || 'Failed to generate reports.' });
    } finally {
        setIsSavingSummary(false);
    }
};

    const handleLogTrade = async (e) => {
        e.preventDefault();
        setIsLoggingTrade(true);
        try {
            await api.post(`/admin/vaults/${selectedVaultId}/trades`, newTrade);
            setNewTrade({ asset_symbol: '', direction: 'LONG', quantity: '', entry_price: '', contract_address: '', chain: 'ETHEREUM' });
            fetchSupportingEvents(); // Refresh the log
        } catch (err) {
            alert('Failed to log trade: ' + (err.response?.data?.message || 'Unknown error'));
        } finally {
            setIsLoggingTrade(false);
        }
    };
    
    const handleLogEvent = async (e) => {
        e.preventDefault();
        setIsLoggingEvent(true);
        try {
            await api.post('/admin/vault-events', { vaultId: selectedVaultId, ...newEvent });
            setNewEvent({ eventType: 'AIRDROP_RECEIVED', description: '', valueUsd: '', txHash: '' });
            fetchSupportingEvents(); // Refresh the log
        } catch (err) {
            alert('Failed to log event: ' + (err.response?.data?.error || 'Unknown error'));
        } finally {
            setIsLoggingEvent(false);
        }
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Trading Desk Results</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                {/* --- Main Controls --- */}
                <div className="admin-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="vaultSelect">Select Vault</label>
                        <select id="vaultSelect" value={selectedVaultId} onChange={(e) => setSelectedVaultId(e.target.value)} className="admin-vault-select">
                            {vaults.map((v) => <option key={v.vault_id} value={v.vault_id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="monthSelect">Select Month</label>
                        <input type="month" id="monthSelect" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} required />
                    </div>
                </div>

                {/* --- Monthly Summary Section --- */}
                <div className="admin-actions-card">
                    <h3>Monthly Summary & Report Generation</h3>
                    <p>Record the final, official P&L percentage. This will automatically generate a draft report for every active user in the vault for that month.</p>
                    <form onSubmit={handleGenerateReports} className="admin-form">
                        <div className="form-group">
                            <label htmlFor="perf-pnl">Performance Percentage (e.g., 5.5 or -2.1)</label>
                            <input id="perf-pnl" type="number" step="any" value={monthlyPerf.pnlPercentage} onChange={(e) => setMonthlyPerf({...monthlyPerf, pnlPercentage: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="perf-notes">Notes / Commentary (Optional)</label>
                            <textarea id="perf-notes" value={monthlyPerf.notes} onChange={(e) => setMonthlyPerf({...monthlyPerf, notes: e.target.value})} rows="3"></textarea>
                        </div>
                        <button type="submit" className="btn-primary" disabled={isSavingSummary || !selectedMonth || !monthlyPerf.pnlPercentage}>
            {isSavingSummary ? 'Generating...' : 'Save & Generate Draft Reports'}
        </button>
    </form>
    {summaryMessage.text && (
                        <div className={`admin-message ${summaryMessage.type}`}>
                            <p>{summaryMessage.text}</p>
                            {summaryMessage.type === 'success' && (
                                <Link to="/admin/reports/review" className="btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                                    Go to Review & Publish →
                                </Link>
                            )}
                        </div>   
                    )}
                </div>
    

                {/* --- Event Logging Forms --- */}
                <div className="admin-grid">
                    <div className="admin-card">
                        <h4>Log New Trade</h4>
                        <form onSubmit={handleLogTrade} className="admin-form">
                            {/* Simplified form for brevity. You can add all fields. */}
                            <input value={newTrade.asset_symbol} onChange={e => setNewTrade({...newTrade, asset_symbol: e.target.value})} placeholder="Symbol (e.g., ETH)" required />
                            <input type="number" value={newTrade.quantity} onChange={e => setNewTrade({...newTrade, quantity: e.target.value})} placeholder="Quantity" required />
                            <input type="number" value={newTrade.entry_price} onChange={e => setNewTrade({...newTrade, entry_price: e.target.value})} placeholder="Entry Price" required />
                            <input value={newTrade.contract_address} onChange={e => setNewTrade({...newTrade, contract_address: e.target.value})} placeholder="Contract Address" required />
                            <button type="submit" className="btn-secondary" disabled={isLoggingTrade}>{isLoggingTrade ? '...' : 'Log Trade'}</button>
                        </form>
                    </div>
                    <div className="admin-card">
                        <h4>Log Vault Event</h4>
                        <form onSubmit={handleLogEvent} className="admin-form">
                            <select value={newEvent.eventType} onChange={e => setNewEvent({...newEvent, eventType: e.target.value})}>
                                <option value="AIRDROP_RECEIVED">Airdrop Received</option>
                                <option value="FEE_INCURRED">Fee Incurred</option>
                                <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
                            </select>
                            <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Description (e.g., Received 10k ARB tokens)" required></textarea>
                            <input type="number" value={newEvent.valueUsd} onChange={e => setNewEvent({...newEvent, valueUsd: e.target.value})} placeholder="Realized USD Value (if any)" />
                            <button type="submit" className="btn-secondary" disabled={isLoggingEvent}>{isLoggingEvent ? '...' : 'Log Event'}</button>
                        </form>
                    </div>
                </div>
                
                {/* --- Supporting Events Log --- */}
               <div className="admin-card" style={{ marginTop: '24px' }}>
    <h3>Chronological Events Log for Selected Period</h3>
    {loading ? <LoadingSpinner /> : error ? <p className="error-message">{error}</p> :
        <div className="table-responsive">
            <table className="activity-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Details</th>
                        <th className="amount">Value / P&L (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    {supportingEvents.length > 0 ? supportingEvents.map(event => (
                        <tr key={`${event.type}-${event.id}`}>
                            <td>{new Date(event.event_date).toLocaleString()}</td>
                            <td>
                                <span className={`status-badge status-${event.type.toLowerCase()}`}>
                                    {event.type.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td>
                                {(() => {
                                    switch (event.type) {
                                        case 'DEPOSIT':
                                            return `User '${event.username}' deposited ${event.total_deposit_amount.toFixed(2)} (Net: ${event.tradable_capital.toFixed(2)})`;
                                        case 'TRADE':
                                            return `${event.status} ${event.direction} ${event.quantity} ${event.asset_symbol} @ ${event.entry_price}`;
                                        default: // For AIRDROP_RECEIVED, etc.
                                            return event.description;
                                    }
                                })()}
                            </td>
                            <td className={`amount ${ (event.pnl_usd || event.value_usd || 0) >= 0 ? 'text-positive' : 'text-negative'}`}>
                                { event.type === 'DEPOSIT' ? `+${event.total_deposit_amount.toFixed(2)}`
                                : (event.pnl_usd !== null && event.pnl_usd !== undefined) ? event.pnl_usd.toFixed(2)
                                : (event.value_usd !== null && event.value_usd !== undefined) ? event.value_usd.toFixed(2)
                                : 'N/A'}
                            </td>
                        </tr>
                    )) : <tr><td colSpan="4" style={{textAlign: 'center'}}>No events found for this period.</td></tr>}
                </tbody>
            </table>
        </div>
    }
</div>
            </div>
        </Layout>
    );
};

export default DeskResultsPage;
