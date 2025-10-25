// src/pages/admin/AdminDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingTransfers, setPendingTransfers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [actionMessage, setActionMessage] = useState({ id: null, type: '', text: '' });
  const [completingId, setCompletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [finalizingId, setFinalizingId] = useState(null);

  const navigate = useNavigate();

  const fetchAdminStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, transfersResponse] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/transfers/pending'),
      ]);
      
      setStats(statsResponse.data);
      setPendingTransfers(transfersResponse.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError(err.response?.data?.error || "Could not load admin data.");
      setStats({ databaseConnected: false, alchemyConnected: false, pendingVaultWithdrawals: [], recentDeposits: [], recentWithdrawals: [] });
      setPendingTransfers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const handleSweepToUser = async (activityId) => {
    setApprovingId(activityId);
    setActionMessage({ id: activityId, text: 'Initiating sweep...' });
    try {
      await api.post(`/admin/withdrawals/${activityId}/sweep`);
      setActionMessage({ id: activityId, type: 'success', text: 'Sweep started. Awaiting confirmation.' });
      fetchAdminStats();
    } catch (err) {
      setActionMessage({ id: activityId, type: 'error', text: err.response?.data?.error || 'Sweep failed.' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleFinalizeWithdrawal = async (activityId) => {
    setFinalizingId(activityId);
    setActionMessage({ id: activityId, text: 'Finalizing...' });
    try {
      const response = await api.post(`/admin/withdrawals/${activityId}/finalize`);
      setActionMessage({ id: activityId, type: 'success', text: response.data.message });
      setTimeout(fetchAdminStats, 1500);
    } catch (err) {
      setActionMessage({ id: activityId, type: 'error', text: err.response?.data?.error || 'Finalization failed.' });
    } finally {
      setFinalizingId(null);
    }
  };

  const handleCompleteTransfer = async (transferId) => {
    setCompletingId(transferId);
    setActionMessage({ id: transferId, text: 'Processing...' });
    try {
      const response = await api.post(`/admin/transfers/${transferId}/complete`);
      setActionMessage({ id: transferId, type: 'success', text: response.data.message });
      setTimeout(fetchAdminStats, 2000); 
    } catch (err) {
      setActionMessage({ id: transferId, type: 'error', text: err.response?.data?.error || 'Processing failed.' });
      setCompletingId(null);
    }
  };

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
  
  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error && !stats) return <p className="error-message">{error}</p>;
    if (!stats) return <p>No data available.</p>;
    
    return (
      <>
        <div className="system-status-bar">
          <StatusIndicator label="Backend API" isUp={!error} />
          <StatusIndicator label="Database" isUp={stats.databaseConnected} />
          <StatusIndicator label="Alchemy API" isUp={stats.alchemyConnected} />
        </div>

        <div className="stats-grid">
          <StatCard label="Total Users" value={stats.userCount} />
          <StatCard label="Total Available Capital" value={stats.totalAvailable} currency />
          <StatCard label="Total Capital in Vaults" value={stats.totalInVaults} currency />
          <StatCard label="Hot Wallet Gas (ETH)" value={parseFloat(stats.hotWalletBalance)} />
        </div>
        
        {/* --- NEW: Grouped Navigation --- */}
        <div className="admin-grid" style={{marginTop: '2rem'}}>
            <div className="admin-actions-card">
                <h3>Reporting & Month-End</h3>
                <p>Tools for closing financial periods, generating reports, and auditing data.</p>
                <div className="admin-tool-links">
                    <Link to="/admin/pnl-reconciliation" className="btn-secondary">PNL Reconciliation</Link>
                    <Link to="/admin/desk-results" className="btn-secondary">Monthly Close Workflow</Link>
                    <Link to="/admin/reports/review" className="btn-secondary">Report Management Suite</Link>
                    <Link to="/admin/platform-reports" className="btn-secondary">Platform Aggregate Report</Link>
                    <Link to="/admin/monthly-audit" className="btn-secondary">Monthly P&L Audit</Link>
                    <Link to="/admin/treasury" className="btn-secondary">Treasury & Business Report</Link>
                </div>
            </div>
            <div className="admin-actions-card">
                <h3>Core Management</h3>
                <p>Manage vaults, farming pipelines, and user-specific details.</p>
                 <div className="admin-tool-links">
                    <Link to="/admin/vaults" className="btn-secondary">Vault Management</Link>
                    <Link to="/admin/farming-pipeline" className="btn-secondary">Farming Pipeline</Link>
                    <Link to="/admin/financials" className="btn-secondary">Financial Ledgers</Link>
                </div>
            </div>
             <div className="admin-actions-card">
                <h3>Ecosystem & Gamification</h3>
                <p>Manage pins, award XP, and run other community initiatives.</p>
                 <div className="admin-tool-links">
                    <Link to="/admin/pins" className="btn-secondary">Pin Management</Link>
                    <Link to="/admin/xp-awards" className="btn-secondary">XP & Reward Tools</Link>
                    <Link to="/admin/animations" className="btn-secondary">Animation Controls</Link>
                </div>
            </div>
        </div>

        <div className="admin-actions-card">
          <h3>User Lookup</h3>
          <form onSubmit={handleSearch} className="admin-form">
            <div className="form-group">
              <input type="text" placeholder="Search by username, email, or wallet address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
        
        {/* --- Action Queues --- */}
        <div className="admin-actions-card">
          <h3>Withdrawal Workflow Queue</h3>
          {stats.pendingVaultWithdrawals && stats.pendingVaultWithdrawals.length > 0 ? (
            <div className="table-responsive">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>User</th><th>Description</th><th className="amount">Amount</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pendingVaultWithdrawals.map(item => (
                    <tr key={item.activity_id}>
                      <td><Link to={`/admin/user/${item.user_id}`} className="admin-table-link">{item.username}</Link></td>
                      <td>{item.description}</td>
                      <td className="amount">${parseFloat(item.amount_primary).toFixed(2)}</td>
                      <td><span className={`status-badge status-${(item.status || 'unknown').toLowerCase()}`}>{(item.status || 'UNKNOWN').replace(/_/g, ' ')}</span></td>
                      <td className="actions-cell">
                        {item.status === 'PENDING_FUNDING' && (
                          <button className="btn-primary btn-sm" onClick={() => handleSweepToUser(item.activity_id)} disabled={approvingId === item.activity_id}>
                            {approvingId === item.activity_id ? '...' : 'Sweep to User'}
                          </button>
                        )}
                        {item.status === 'PENDING_CONFIRMATION' && <button className="btn-secondary btn-sm" disabled>Awaiting B/C</button>}
                        {item.status === 'SWEEP_CONFIRMED' && (
                          <button className="btn-positive btn-sm" onClick={() => handleFinalizeWithdrawal(item.activity_id)} disabled={finalizingId === item.activity_id}>
                            {finalizingId === item.activity_id ? '...' : 'Finalize & Credit'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {actionMessage.id && <p className={`admin-message ${actionMessage.type}`}>{actionMessage.text}</p>}
            </div>
          ) : <p>No pending vault withdrawals.</p>}
        </div>

        <div className="admin-actions-card">
          <h3>Pending Vault Transfers Queue</h3>
          {pendingTransfers && pendingTransfers.length > 0 ? (
            <div className="table-responsive">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>User</th><th>Request</th><th className="amount">Amount</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTransfers.map(item => (
                    <tr key={item.transfer_id}>
                      <td><Link to={`/admin/user/${item.user_id}`} className="admin-table-link">{item.username}</Link></td>
                      <td>{`${item.from_vault_name} → ${item.to_vault_name}`}</td>
                      <td className="amount">${parseFloat(item.amount).toFixed(2)}</td>
                      <td><span className={`status-badge status-${(item.status || 'unknown').toLowerCase()}`}>{(item.status || 'UNKNOWN').replace(/_/g, ' ')}</span></td>
                      <td className="actions-cell">
                        {item.status === 'PENDING_UNWIND' && (
                          <button className="btn-positive btn-sm" onClick={() => handleCompleteTransfer(item.transfer_id)} disabled={completingId === item.transfer_id}>
                            {completingId === item.transfer_id ? '...' : 'Complete Transfer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {actionMessage.id && <p className={`admin-message ${actionMessage.type}`}>{actionMessage.text}</p>}
            </div>
          ) : <p>No pending vault transfers.</p>}
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Mission Control</h1>
          <div className="admin-header-actions">
            <button onClick={fetchAdminStats} className="btn-secondary btn-sm" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
