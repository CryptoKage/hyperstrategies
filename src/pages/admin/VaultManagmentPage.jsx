// src/pages/admin/VaultManagementPage.jsx

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

  // State for the PnL Update Form
  const [pnlInput, setPnlInput] = useState('');
  const [isPnlUpdating, setIsPnlUpdating] = useState(false);
  const [pnlMessage, setPnlMessage] = useState({ type: '', text: '' });
  
  // State for the Profit Distribution Form
  const [profitInput, setProfitInput] = useState('');
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributeMessage, setDistributeMessage] = useState({ type: '', text: '' });


  // Fetch the list of all vaults once on component mount
  useEffect(() => {
    const fetchVaults = async () => {
      try {
        // We'll use the public dashboard API to get the list of vaults
        const response = await api.get('/dashboard'); 
        setVaults(response.data.vaults);
        if (response.data.vaults.length > 0) {
          setSelectedVaultId(response.data.vaults[0].vault_id); // Default to the first vault
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

  // Handler for PnL Update
  const handleUpdatePnl = async (e) => {
    e.preventDefault();
    setIsPnlUpdating(true);
    setPnlMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/admin/vaults/${selectedVaultId}/update-pnl`, { pnlPercentage: pnlInput });
      setPnlMessage({ type: 'success', text: response.data.message });
      fetchVaultDetails(); // Refresh data on success
    } catch(err) {
      setPnlMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setIsPnlUpdating(false);
    }
  };

  // Handler for Profit Distribution
  const handleDistributeProfit = async (e) => {
    e.preventDefault();
    setIsDistributing(true);
    setDistributeMessage({ type: '', text: '' });
    try {
        const response = await api.post('/admin/distribute-profit', { vault_id: selectedVaultId, total_profit_amount: profitInput });
        setDistributeMessage({ type: 'success', text: response.data.message });
        fetchVaultDetails(); // Refresh data on success
    } catch (err) {
        setDistributeMessage({ type: 'error', text: err.response?.data?.message || 'Distribution failed.' });
    } finally {
        setIsDistributing(false);
    }
  };


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
                <StatCard label="Total Capital in Vault" value={`$${(vaultData.stats.totalCapital || 0).toFixed(2)}`} />
                <StatCard label="Total Unrealized PnL" value={`$${(vaultData.stats.totalPnl || 0).toFixed(2)}`} />
                <StatCard label="Participant Count" value={vaultData.stats.participantCount} />
            </div>

            <div className="admin-grid">
              <div className="admin-actions-card">
                <h3>Update Unrealized PnL</h3>
                <p>Set the current unrealized PnL for all users in this vault as a percentage of their capital.</p>
                <form onSubmit={handleUpdatePnl} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="pnl-percent">Current PnL (%)</label>
                    <input id="pnl-percent" type="number" step="0.01" value={pnlInput} onChange={e => setPnlInput(e.target.value)} placeholder="e.g., 8.5 for +8.5%" required/>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isPnlUpdating}>{isPnlUpdating ? 'Updating...' : 'Update All PnLs'}</button>
                </form>
                {pnlMessage.text && <p className={`admin-message ${pnlMessage.type}`}>{pnlMessage.text}</p>}
              </div>

              <div className="admin-actions-card">
                  <h3>Distribute Realized Profits</h3>
                  <p>Distribute realized profits to users. This will apply performance fees and HWM logic.</p>
                  <form onSubmit={handleDistributeProfit} className="admin-form">
                      <div className="form-group">
                          <label htmlFor="profit-amount">Total Realized Profit (USDC)</label>
                          <input id="profit-amount" type="number" step="0.01" value={profitInput} onChange={e => setProfitInput(e.target.value)} placeholder="e.g., 10000.00" required />
                      </div>
                      <button type="submit" className="btn-primary" disabled={isDistributing}>{isDistributing ? 'Distributing...' : 'Distribute Profits'}</button>
                  </form>
                  {distributeMessage.text && <p className={`admin-message ${distributeMessage.type}`}>{distributeMessage.text}</p>}
              </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Participants in {vaultData.vault.name}</h3>
              <div className="table-responsive-wrapper">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>User</th><th>Capital</th><th>Unrealized PnL</th><th>Auto-Compound</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.participants.map(p => (
                      <tr key={p.position_id}>
                        <td><Link to={`/admin/user/${p.user_id}`} className="admin-table-link">{p.username}</Link></td>
                        <td>${parseFloat(p.tradable_capital).toFixed(2)}</td>
                        <td className={parseFloat(p.pnl) >= 0 ? 'text-positive' : 'text-negative'}>${parseFloat(p.pnl).toFixed(2)}</td>
                        <td>{p.auto_compound ? 'ON' : 'OFF'}</td>
                        <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
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