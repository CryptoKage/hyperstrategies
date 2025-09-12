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

  const [pnlPercentage, setPnlPercentage] = useState('');
  const [beforeTimestamp, setBeforeTimestamp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState('');

  // --- NEW: State for Asset Management ---
  const [vaultAssets, setVaultAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({ symbol: '', weight: '', contract_address: '', chain: 'ETHEREUM' });
  const [isAssetLoading, setIsAssetLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjustedDate = new Date(now.getTime() - (offset * 60 * 1000));
    const formattedDate = adjustedDate.toISOString().substring(0, 16);
    setBeforeTimestamp(formattedDate);
  }, []);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const response = await api.get('/dashboard'); 
        setVaults(response.data.vaults);
        if (response.data.vaults.length > 0) {
          setSelectedVaultId(response.data.vaults[0].vault_id);
        }
      } catch (err) { setError('Could not fetch list of vaults.'); }
    };
    fetchVaults();
  }, []);

  const fetchVaultDetails = useCallback(async () => {
    if (!selectedVaultId) return;
    setLoading(true);
    setError('');
    setVaultData(null);
    setVaultAssets([]); // Clear previous assets
    try {
      const [detailsRes, assetsRes] = await Promise.all([
        api.get(`/admin/vaults/${selectedVaultId}/details`),
        api.get(`/admin/vaults/${selectedVaultId}/assets`)
      ]);
      setVaultData(detailsRes.data);
      setVaultAssets(assetsRes.data);
    } catch (err) {
      setError(`Failed to fetch details for vault #${selectedVaultId}.`);
    } finally {
      setLoading(false);
    }
  }, [selectedVaultId]);

  useEffect(() => {
    fetchVaultDetails();
  }, [fetchVaultDetails]);

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
      setPnlPercentage('');
      fetchVaultDetails();
    } catch(err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerSweep = async () => {
    setIsSweeping(true);
    setSweepMessage('Triggering sweep job...');
    try {
      const response = await api.post('/admin/trigger-sweep');
      setSweepMessage(response.data.message);
    } catch (err) {
      setSweepMessage(err.response?.data?.message || 'Failed to trigger sweep.');
    } finally {
      setIsSweeping(false);
    }
  };

  const handleAssetInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setIsAssetLoading(true);
    try {
      await api.post(`/admin/vaults/${selectedVaultId}/assets`, newAsset);
      fetchVaultDetails(); // Refresh all vault data
      setNewAsset({ symbol: '', weight: '', contract_address: '', chain: 'ETHEREUM' });
    } catch (err) {
      alert('Failed to add asset.');
      console.error(err);
    } finally {
      setIsAssetLoading(false);
    }
  };

  const handleRemoveAsset = async (symbol) => {
    if (!window.confirm(`Are you sure you want to remove ${symbol}?`)) return;
    try {
      await api.delete(`/admin/vaults/${selectedVaultId}/assets/${symbol}`);
      fetchVaultDetails(); // Refresh all vault data
    } catch (err) {
      alert('Failed to remove asset.');
      console.error(err);
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
            {vaults.map(v => (<option key={v.vault_id} value={v.vault_id}>{v.name} (ID: {v.vault_id})</option>))}
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
            
            <div className="admin-grid">
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

              <div className="admin-actions-card">
                <h3>Capital Sweep</h3>
                <p>Find all new deposits in the ledger and sweep the total amount to the main trading desk wallet.</p>
                <button onClick={handleTriggerSweep} className="btn-secondary" disabled={isSweeping}>
                  {isSweeping ? 'Sweeping...' : 'Sweep Pending Deposits'}
                </button>
                {sweepMessage && <p className={`admin-message success`}>{sweepMessage}</p>}
              </div>
            </div>

            <div className="admin-actions-card">
              <h3>Manage Vault Assets</h3>
              <p>Define the assets and their target weights (e.g., 0.6 for 60%). The automated performance tracker uses this data.</p>
              <table className="activity-table" style={{ marginBottom: '24px' }}>
                <thead><tr><th>Symbol</th><th>Weight</th><th>Actions</th></tr></thead>
                <tbody>
                  {vaultAssets.map(asset => (
                    <tr key={asset.asset_id}>
                      <td>{asset.symbol}</td>
                      <td>{(asset.weight * 100).toFixed(2)}%</td>
                      <td><button className="btn-danger-small" onClick={() => handleRemoveAsset(asset.symbol)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <form onSubmit={handleAddAsset} className="admin-form-inline">
                <input name="symbol" value={newAsset.symbol} onChange={handleAssetInputChange} placeholder="Symbol (e.g., BITCOIN)" required />
                <input name="weight" value={newAsset.weight} onChange={handleAssetInputChange} placeholder="Weight (e.g., 0.6)" type="number" step="0.01" required />
                <input name="contract_address" value={newAsset.contract_address} onChange={handleAssetInputChange} placeholder="0x... Contract Address" />
                <input name="chain" value={newAsset.chain} onChange={handleAssetInputChange} placeholder="Chain (e.g., ETHEREUM)" required />
                <button type="submit" className="btn-primary" disabled={isAssetLoading}>{isAssetLoading ? '...' : 'Add/Update Asset'}</button>
              </form>
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
                        <td>${(parseFloat(p.principal) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className={parseFloat(p.pnl) >= 0 ? 'text-positive' : 'text-negative'}>${(parseFloat(p.pnl) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>${(parseFloat(p.total_capital) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
