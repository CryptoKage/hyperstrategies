import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import Layout from '../../components/Layout';
import api from '../../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  const fetchAdminStats = useCallback(async () => {
    // We don't need the 'if (!stats)' check, always allow refresh
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      setError(err.response?.data?.error || "Could not load admin data.");
      // Provide a default stats object on error to prevent crashes
      setStats({ databaseConnected: false, alchemyConnected: false, pendingVaultWithdrawals: [], recentDeposits: [], recentWithdrawals: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

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
    if (loading) return <p>Loading Admin Dashboard...</p>;
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
        
        {stats.pendingVaultWithdrawals && stats.pendingVaultWithdrawals.length > 0 && (
          <div className="admin-actions-card warning">
            <h3>Pending Vault Withdrawals ({stats.pendingVaultWithdrawals.length})</h3>
            <p>ACTION REQUIRED: These internal vault withdrawals are waiting to be processed by the background job.</p>
            <div className="table-responsive">
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
                      <td><Link to={`/admin/user/${item.user_id}`} className="admin-table-link">{item.username}</Link></td>
                      <td>{item.description}</td>
                      <td className="amount">${parseFloat(item.amount_primary).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="admin-actions-card">
          <h3>User Lookup</h3>
          <p>Search for a user by their username, email, or wallet address.</p>
          <form onSubmit={handleSearch} className="admin-form">
            <div className="form-group">
              <input type="text" placeholder="Enter search term (3+ characters)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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

        <div className="admin-grid">
          <div className="activity-card">
            <h3>Recent Deposits</h3>
            {stats.recentDeposits && stats.recentDeposits.length > 0 ? (
              <table className="activity-table">
                <tbody>
                  {stats.recentDeposits.map((item, index) => (
                    <tr key={`dep-${index}`}>
                      <td><strong>{item.username}</strong> deposited</td>
                      <td className="amount">${parseFloat(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No recent deposits.</p>}
          </div>
          <div className="activity-card">
            <h3>Recent Platform Withdrawals</h3>
            {stats.recentWithdrawals && stats.recentWithdrawals.length > 0 ? (
              <table className="activity-table">
                <tbody>
                 {stats.recentWithdrawals.map((item, index) => (
                  <tr key={`wd-${index}`}>
                    <td><strong>{item.username}</strong> requested</td>
                    <td className="amount">${parseFloat(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : <p>No recent platform withdrawal requests.</p>}
          </div>
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
              {loading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
            <Link to="/admin/financials" className="btn-primary btn-sm">Financials & Auditing</Link>
            <Link to="/admin/treasury" className="btn-primary btn-sm">Treasury Report</Link>
            <Link to="/admin/vaults" className="btn-primary btn-sm">Vault Management</Link>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
