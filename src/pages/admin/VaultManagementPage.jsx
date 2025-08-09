import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const StatCard = ({ label, value }) => (
  <div className="stat-card">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

const VaultManagementPage = () => {
  const [vaults, setVaults] = useState([]);
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for the simplified PnL Form
  const [pnlPercentage, setPnlPercentage] = useState('');
  const [beforeTimestamp, setBeforeTimestamp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Set the default timestamp to the current time when the component loads
  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjustedDate = new Date(now.getTime() - (offset * 60 * 1000));
    const formattedDate = adjustedDate.toISOString().substring(0, 16);
    setBeforeTimestamp(formattedDate);
  }, []);

  // Fetch the list of all vaults once on component mount
  useEffect(() => {
    const fetchVaults = async () => {
      try {
        // We get the vault list from the /dashboard endpoint as it's already available
        const response = await api.get('/dashboard'); 
        setVaults(response.data.vaults);
        if (response.data.vaults.length > 0) {
          setSelectedVaultId(response.data.vaults[0].vault_id);
        }
      } catch (err) {
        setError('Could not fetch list of vaults.');
      }
    };
    fetchVaults();
  }, []);

  // Fetch the detailed data for the selected vault whenever the ID changes
  const fetchVaultDetails = useCallback(async () => {
    if (!selectedVaultId) return;
    setLoading(true);
    setError('');
    setVaultData(null);
    try {
      const response = await api.get(`/admin/vaults/${selectedVaultId}/details`);
      setVaultData(response.data);
    } catch (err) {
      setError(`Failed to fetch details for vault #${selectedVaultId}.`);
    } finally {
      setLoading(false);
    }
  }, [selectedVaultId]);

  useEffect(() => {
    fetchVaultDetails();
  }, [fetchVaultDetails]);

  // Handler for the new simplified PnL tool
  const handleApplyPnl = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/admin/vaults/${selectedVaultId}/apply-manual-pnl`, { 
        pnlPercentage,
        beforeTimestamp: new Date(beforeTimestamp).toISOString()
      });
      setMessage({ type: 'success', text: response.data.message });
      setPnlPercentage(''); // Reset form
      fetchVaultDetails();
    } catch(err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentVaultCapital = vaultData?.stats?.totalCapital || 0;

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Vault Management</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

        <div className="admin-card">
          <h3>Select Vault</h3>
          <select value={selectedVaultId} onChange={(e) => setSelectedVaultId(e.target.value)} className="admin-vault-select">
            {vaults.map(v => (
              <option key={v.vault_id} value={v.vault_id}>{v.name} (ID: {v.vault_id})</option>
            ))}
          </select>
        </div>

        {loading && <p>Loading vault data...</p>}
        {error && <p className="error-message">{error}</p>}

        {vaultData && (
          <>
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <StatCard label="Total Capital in Vault" value={`$${currentVaultCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                <StatCard label="Total Realized PnL" value={`$${(vaultData.stats.totalPnl || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                <StatCard label="Participant Count" value={vaultData.stats.participantCount} />
            </div>
            
            <div className="admin-actions-card">
              <h3>Apply Manual PnL</h3>
              <p>Distribute a percentage-based PnL to all users whose capital was deposited before the specified cutoff time. This creates a permanent ledger entry.</p>
              
              <form onSubmit={handleApplyPnl} className="admin-form">
                <div className="form-group">
                  <label htmlFor="pnl-percent">PnL to Distribute (%)</label>
                  <input id="pnl-percent" type="number" step="0.01" value={pnlPercentage} onChange={e => setPnlPercentage(e.target.value)} placeholder="e.g., 5.5 for +5.5% or -2.1 for -2.1%" required/>
                </div>

                <div className="form-group">
                  <label htmlFor="before-timestamp">Apply to deposits made before:</label>
                  <input id="before-timestamp" type="datetime-local" value={beforeTimestamp} onChange={e => setBeforeTimestamp(e.target.value)} required />
                </div>

                <button type="submit" className="btn-primary" disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Apply PnL to Eligible Capital'}</button>
              </form>
              {message.text && <p className={`admin-message ${message.type}`}>{message.text}</p>}
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Participants in {vaultData.vault.name}</h3>
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Principal Capital</th>
                      <th>Total PnL</th>
                      <th>Total Capital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.participants.map(p => (
                      <tr key={p.user_id}>
                        <td><Link to={`/admin/user/${p.user_id}`} className="admin-table-link">{p.username}</Link></td>
                        <td>${parseFloat(p.principal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className={parseFloat(p.pnl) >= 0 ? 'text-positive' : 'text-negative'}>${parseFloat(p.pnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>${parseFloat(p.total_capital).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default VaultManagementPage;
