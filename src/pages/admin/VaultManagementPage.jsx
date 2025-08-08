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

  const [newTotalValueInput, setNewTotalValueInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  // --- NEW: State for the Harvest tool ---
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestMessage, setHarvestMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchVaults = async () => {
      try {
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

  const handleUpdateVaultValue = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/admin/vaults/${selectedVaultId}/finalize-pnl`, { newTotalValue: newTotalValueInput });
      setUpdateMessage({ type: 'success', text: response.data.message });
      setNewTotalValueInput('');
      fetchVaultDetails();
    } catch(err) {
      setUpdateMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // --- NEW: Handler for the Harvest button ---
  const handleHarvest = async () => {
    setIsHarvesting(true);
    setHarvestMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/admin/vaults/${selectedVaultId}/harvest`);
      setHarvestMessage({ type: 'success', text: response.data.message });
      fetchVaultDetails(); // Refresh data after harvest
    } catch (err) {
      setHarvestMessage({ type: 'error', text: err.response?.data?.message || 'Harvesting failed.' });
    } finally {
      setIsHarvesting(false);
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
                <StatCard label="Total Unrealized PnL" value={`$${(vaultData.stats.totalPnl || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                <StatCard label="Participant Count" value={vaultData.stats.participantCount} />
                <StatCard label="Current PnL %" value={`${(vaultData.stats.currentPnlPercentage || 0).toFixed(2)}%`} />
            </div>
            
            <div className="admin-grid">
              <div className="admin-actions-card">
                <h3>Finalize Period & Distribute PnL</h3>
                <p>Enter the new total value of all assets. This will permanently record the gain/loss on every user's ledger.</p>
                <div className="stat-card" style={{ marginBottom: '16px' }}>
                  <span className="stat-label">Current Total Vault Value</span>
                  <span className="stat-value">${currentVaultCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <form onSubmit={handleUpdateVaultValue} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="new-total-value">New Final Total Value (USDC)</label>
                    <input id="new-total-value" type="number" step="0.01" value={newTotalValueInput} onChange={e => setNewTotalValueInput(e.target.value)} placeholder="e.g., 150000.00" required/>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isUpdating}>{isUpdating ? 'Finalizing...' : 'Finalize & Distribute'}</button>
                </form>
                {updateMessage.text && <p className={`admin-message ${updateMessage.type}`}>{updateMessage.text}</p>}
              </div>

              {/* --- NEW HARVEST TOOL --- */}
              <div className="admin-actions-card">
                <h3>Process Profit Harvesting</h3>
                <p>Find all users in this vault with auto-compound disabled and move their accumulated profits to their main balance.</p>
                <button onClick={handleHarvest} className="btn-secondary" disabled={isHarvesting}>
                  {isHarvesting ? 'Processing...' : 'Harvest All Profits'}
                </button>
                {harvestMessage.text && <p className={`admin-message ${harvestMessage.type}`}>{harvestMessage.text}</p>}
              </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Participants in {vaultData.vault.name}</h3>
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Total Capital</th>
                      <th>Total PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.participants.map(p => (
                      <tr key={p.user_id}>
                        <td><Link to={`/admin/user/${p.user_id}`} className="admin-table-link">{p.username}</Link></td>
                        <td>${parseFloat(p.capital).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className={parseFloat(p.pnl) >= 0 ? 'text-positive' : 'text-negative'}>${parseFloat(p.pnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
