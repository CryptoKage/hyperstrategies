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
  
  const [approvingId, setApprovingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ id: null, type: '', text: '' });

  // --- NEW STATE for Diagnostic Tools ---
  const [blockToScan, setBlockToScan] = useState('');
  const [userToScan, setUserToScan] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  const fetchAdminStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      setError(err.response?.data?.error || "Could not load admin data.");
      setStats({ databaseConnected: false, alchemyConnected: false, pendingVaultWithdrawals: [], recentDeposits: [], recentWithdrawals: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const handleApproveWithdrawal = async (activityId) => {
    setApprovingId(activityId);
    setActionMessage({ id: activityId, text: 'Approving...' });
    try {
      const response = await api.post(`/admin/approve-withdrawal/${activityId}`);
      setActionMessage({ id: activityId, type: 'success', text: response.data.message });
      setTimeout(fetchAdminStats, 2000);
    } catch (err) {
      setActionMessage({ id: activityId, type: 'error', text: err.response?.data?.message || 'Approval failed.' });
    } finally {
      setApprovingId(null);
    }
  };

  // --- NEW HANDLER for Force Block Scan ---
  const handleForceScanBlock = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setScanMessage({ text: 'Scanning block...' });
    try {
      const response = await api.post('/admin/force-scan-block', { blockNumber: blockToScan });
      setScanMessage({ type: 'success', text: response.data.message });
      setBlockToScan('');
    } catch (err) {
      setScanMessage({ type: 'error', text: err.response?.data?.message || 'Failed to scan block.' });
    } finally {
      setIsScanning(false);
    }
  };

  // --- NEW HANDLER for User Wallet Scan ---
  const handleScanUserWallet = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    setScanMessage({ text: 'Scanning user wallet history...' });
    try {
      const response = await api.post('/admin/scan-user-wallet', { userId: userToScan });
      setScanMessage({ type: 'success', text: response.data.message });
      setUserToScan('');
    } catch (err) {
      setScanMessage({ type: 'error', text: err.response?.data?.message || 'Failed to scan wallet.' });
    } finally {
      setIsScanning(false);
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
            <p>ACTION REQUIRED: Ensure funds are returned from the trading desk, then approve for processing.</p>
            <div className="table-responsive">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Description</th>
                    <th className="amount">Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pendingVaultWithdrawals.map(item => (
                    <tr key={item.activity_id}>
                      <td><Link to={`/admin/user/${item.user_id}`} className="admin-table-link">{item.username}</Link></td>
                      <td>{item.description}</td>
                      <td className="amount">${parseFloat(item.amount_primary).toFixed(2)}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn-primary btn-sm" 
                          onClick={() => handleApproveWithdrawal(item.activity_id)}
                          disabled={approvingId === item.activity_id}
                        >
                          {approvingId === item.activity_id ? '...' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {actionMessage.text && <p className={`admin-message ${actionMessage.type}`} style={{marginTop: '16px'}}>{actionMessage.text}</p>}
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
                      <td> <strong> <Link to={`/admin/user/${item.user_id}`} 
                        className="admin-table-link">  {item.username}
          </Link>
        </strong> deposited
      </td>
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
                    <td> <strong>
        <Link to={`/admin/user/${item.user_id}`} className="admin-table-link">
          {item.username}
        </Link>
      </strong> requested
    </td>
    <td className="amount">${parseFloat(item.amount).toFixed(2)}</td>
  </tr>
                ))}
              </tbody>
            </table>
            ) : <p>No recent platform withdrawal requests.</p>}
          </div>
        </div>

        {/* --- THIS IS THE NEW DIAGNOSTIC TOOLS CARD --- */}
        <div className="admin-actions-card">
          <h3>Diagnostic & Repair Tools</h3>
          {scanMessage.text && <p className={`admin-message ${scanMessage.type}`}>{scanMessage.text}</p>}

          <div className="admin-grid" style={{ marginTop: '20px' }}>
            {/* Tool 1: Force Scan Block */}
            <div className="diagnostic-tool">
              <h4>Force Re-Scan Block</h4>
              <p>If the automated scanner missed a deposit, enter the block number here to force a re-scan.</p>
              <form onSubmit={handleForceScanBlock} className="admin-form">
                <div className="form-group">
                  <input type="number" placeholder="Enter Block Number" value={blockToScan} onChange={(e) => setBlockToScan(e.target.value)} required />
                </div>
                <button type="submit" className="btn-secondary" disabled={isScanning || !blockToScan}>
                  {isScanning ? 'Scanning...' : 'Scan Block'}
                </button>
              </form>
            </div>
            
            {/* Tool 2: Scan User Wallet */}
            <div className="diagnostic-tool">
              <h4>Scan User Wallet History</h4>
              <p>If a specific user's deposit is missing, enter their User ID (UUID) to scan their entire wallet history.</p>
              <form onSubmit={handleScanUserWallet} className="admin-form">
                <div className="form-group">
                  <input type="text" placeholder="Enter User ID (UUID)" value={userToScan} onChange={(e) => setUserToScan(e.target.value)} required />
                </div>
                <button type="submit" className="btn-secondary" disabled={isScanning || !userToScan}>
                  {isScanning ? 'Scanning...' : 'Scan Wallet'}
                </button>
              </form>
            </div>
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
            <Link to="/admin/pins" className="btn-primary btn-sm">Pin Management</Link>
            <Link to="/admin/xp-awards" className="btn-primary btn-sm">XP Awards</Link>
          </div>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
