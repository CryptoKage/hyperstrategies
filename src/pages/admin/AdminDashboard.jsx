// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, link } from 'react-router-dom'; 
import Layout from '../../components/Layout';
import api from '../../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [actionMessage, setActionMessage] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // --- NEW --- State for the Profit Distribution form
  const [distributeVaultId, setDistributeVaultId] = useState('1');
  const [distributeProfit, setDistributeProfit] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributeMessage, setDistributeMessage] = useState({ type: '', text: '' });

  const fetchAdminStats = useCallback(async () => {
    if (!stats) setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      setError(err.response?.data?.error || "Could not load admin data.");
      setStats(err.response?.data || { databaseConnected: false, alchemyConnected: false });
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  // --- Handlers for existing Admin Actions ---
  const handleTriggerSweep = useCallback(async () => {
    setIsActionLoading(true);
    setActionMessage('Triggering sweep job...');
    try {
      const response = await api.post('/admin/trigger-sweep');
      setActionMessage(response.data.message);
      setTimeout(fetchAdminStats, 5000);
    } catch (err) {
      setActionMessage('Failed to trigger sweep job.');
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchAdminStats]);

  const handleRetryAll = useCallback(async () => {
    setIsActionLoading(true);
    setActionMessage('Re-queueing all failed sweeps...');
    try {
      const response = await api.post('/admin/retry-sweeps');
      setActionMessage(response.data.message);
      fetchAdminStats();
    } catch (err) {
      setActionMessage('Failed to retry sweeps.');
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchAdminStats]);

  const handleArchive = useCallback(async (positionId) => {
    setIsActionLoading(true);
    setActionMessage(`Archiving position ${positionId}...`);
    try {
      const response = await api.post(`/admin/archive-sweep/${positionId}`);
      setActionMessage(response.data.message);
      fetchAdminStats();
    } catch (err) {
      setActionMessage('Failed to archive sweep.');
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchAdminStats]);

  // --- NEW --- Handler for the Profit Distribution form submission
  const handleDistributeProfit = async (e) => {
    e.preventDefault();
    setIsDistributing(true);
    setDistributeMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admin/distribute-profit', {
        vault_id: parseInt(distributeVaultId, 10),
        total_profit_amount: distributeProfit,
      });
      setDistributeMessage({ type: 'success', text: response.data.message });
      setDistributeProfit('');
      fetchAdminStats();
    } catch (err) {
      const message = err.response?.data?.message || 'An unexpected error occurred.';
      setDistributeMessage({ type: 'error', text: message });
    } finally {
      setIsDistributing(false);
    }
  };

  const StatCard = ({ label, value, currency = false }) => (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">
        {currency && '$'}
        {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (value || '0.00')}
      </span>
    </div>
  );
  
  const StatusIndicator = ({ label, isUp }) => (
    <div className="status-indicator">
      <span className={`status-light ${isUp ? 'up' : 'down'}`}></span>
      <span>{label}</span>
    </div>
  );

    const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 3) return;
    setIsSearching(true);
    try {
      const response = await api.get(`/admin/users/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const renderContent = () => {
    if (loading && !stats) return <p>Loading Admin Dashboard...</p>;
    if (error && !stats) return <p className="error-message">{error}</p>;
    if (!stats) return <p>No data available.</p>;
    
    return (
      <>
        <div className="system-status-bar">
          <StatusIndicator label="Backend API" isUp={!error} />
          <StatusIndicator label="Database" isUp={stats.databaseConnected} />
          <StatusIndicator label="Alchemy API" isUp={stats.alchemyConnected} />
        </div>

        {error && !loading && <p className="error-message">{error}</p>}

        <div className="stats-grid">
          <StatCard label="Total Users" value={stats.userCount} />
          <StatCard label="Total Available Capital" value={stats.totalAvailable} currency />
          <StatCard label="Total Capital in Vaults" value={stats.totalInVaults} currency />
          <StatCard label="Hot Wallet Gas (ETH)" value={parseFloat(stats.hotWalletBalance)} />
        </div>

                <div className="admin-actions-card">
          <h3>User Lookup</h3>
          <p>Search for a user by their username, email, or wallet address.</p>
          <form onSubmit={handleSearch} className="admin-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter search term (3+ characters)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSearching || searchQuery.length < 3}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>Search Results:</h4>
              <ul className="results-list">
                {searchResults.map(user => (
                  <li key={user.user_id} onClick={() => navigate(`/admin/user/${user.user_id}`)}>
                    <strong>{user.username}</strong> ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* --- THIS IS THE NEW CARD WE ARE ADDING --- */}
        <div className="admin-actions-card">
          <h3>Distribute Vault Profits</h3>
          <p>Manually trigger profit distribution for a vault after returning profits to the harvest wallet.</p>
          <form onSubmit={handleDistributeProfit} className="admin-form">
            <div className="form-group">
              <label htmlFor="vault-select">Select Vault</label>
              <select 
                id="vault-select" 
                value={distributeVaultId}
                onChange={(e) => setDistributeVaultId(e.target.value)}
                disabled={isDistributing}
              >
                <option value="1">Core1 Discretionary</option>
                <option value="2">ApeCoin Dual EMA</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="profit-amount">Total Profit Amount (USDC)</label>
              <input
                id="profit-amount"
                type="number"
                step="0.01"
                placeholder="e.g., 10000.00"
                value={distributeProfit}
                onChange={(e) => setDistributeProfit(e.target.value)}
                disabled={isDistributing}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isDistributing || !distributeProfit}>
              {isDistributing ? 'Distributing...' : 'Distribute Profits'}
            </button>
          </form>
          {distributeMessage.text && (
            <p className={`admin-message ${distributeMessage.type}`}>
              {distributeMessage.text}
            </p>
          )}
        </div>

        {stats.pendingVaultWithdrawals && stats.pendingVaultWithdrawals.length > 0 && (
          <div className="admin-actions-card warning">
            <h3>Pending Vault Withdrawals ({stats.pendingVaultWithdrawals.length})</h3>
            <p>ACTION REQUIRED: These positions need to be unwound on the trading desk. Once funds are returned, the withdrawal processor job will credit the users.</p>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Description</th>
                  <th className="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.pendingVaultWithdrawals.map(item => (
                  <tr key={item.activity_id}>
                    <td><strong>{item.username}</strong></td>
                    <td>{item.description}</td>
                    <td className="amount">${parseFloat(item.amount_primary).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-actions-card">
          <h3>Manual Job Triggers</h3>
          <p>Manually run a scheduled job. This is useful for immediate processing or testing.</p>
          <div className="action-button-row">
            <button className="btn-primary" onClick={handleTriggerSweep} disabled={isActionLoading}>
              {isActionLoading ? 'Job Running...' : 'Trigger Allocation Sweep'}
            </button>
            {actionMessage && <span className="action-status">{actionMessage}</span>}
          </div>
        </div>
        
        {stats.failedSweeps && stats.failedSweeps.length > 0 && (
          <div className="admin-actions-card warning">
            <h3>Failed Allocation Sweeps ({stats.failedSweeps.length})</h3>
            <p>These allocations failed to process automatically. Investigate the cause before retrying.</p>
            <table className="activity-table">
              <tbody>
                {stats.failedSweeps.map(item => (
                  <tr key={item.position_id}>
                    <td><strong>{item.username}</strong> - Pos. #{item.position_id}</td>
                    <td className="amount">${parseFloat(item.tradable_capital).toFixed(2)}</td>
                    <td className="actions-cell">
                      <button className="btn-icon" onClick={() => handleArchive(item.position_id)} disabled={isActionLoading} title="Archive/Ignore this sweep">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="action-button-row" style={{marginTop: '16px'}}>
              <button className="btn-primary" onClick={handleRetryAll} disabled={isActionLoading}>
                {isActionLoading ? 'Processing...' : 'Retry All Failed'}
              </button>
            </div>
          </div>
        )}

        <div className="admin-grid">
          <div className="activity-card">
            <h3>Recent Deposits</h3>
            {stats.recentDeposits && stats.recentDeposits.length > 0 ? (
              <table className="activity-table">
                <tbody>
                  {stats.recentDeposits.map((item, index) => (
                    <tr key={`dep-${index}`}>
                      <td><strong>{item.username}</strong> deposited</td>
                      <td className="amount">${parseFloat(item.amount).toFixed(2)} {item.token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No recent deposits.</p>}
          </div>
          <div className="activity-card">
            <h3>Recent Withdrawal Requests</h3>
            {stats.recentWithdrawals && stats.recentWithdrawals.length > 0 ? (
              <table className="activity-table">
                <tbody>
                 {stats.recentWithdrawals.map((item, index) => (
                  <tr key={`wd-${index}`}>
                    <td><strong>{item.username}</strong> requested</td>
                    <td className="amount">${parseFloat(item.amount).toFixed(2)} {item.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : <p>No recent withdrawal requests.</p>}
          </div>
        </div>
      </>
    );
  };

return (
  <Layout>
    <div className="admin-container">
      <div className="admin-header"> {/* The class name is now admin-header */}
        <h1>Admin Mission Control</h1>
        <div className="admin-header-actions"> {/* Buttons are wrapped */}
          <button onClick={fetchAdminStats} className="btn-secondary btn-sm" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <Link to="/admin/financials" className="btn-primary btn-sm">
            Financials & Auditing
          </Link>
        </div>
      </div>
      {renderContent()}
    </div>
  </Layout>
);
};

export default AdminDashboard;