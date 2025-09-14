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
  const [isProcessingPnl, setIsProcessingPnl] = useState(false);
  const [pnlMessage, setPnlMessage] = useState({ type: '', text: '' });

  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState('');

  // --- NEW: State for Asset Management ---
  const [vaultAssets, setVaultAssets] = useState([]);
 const [newAssetWeight, setNewAssetWeight] = useState({ symbol: '', weight: '', contract_address: '', chain: 'ETHEREUM' });
const [newTrade, setNewTrade] = useState({ asset_symbol: '', direction: 'LONG', quantity: '', entry_price: '' });
  const [isAssetLoading, setIsAssetLoading] = useState(false);

const [isUpdatingPerf, setIsUpdatingPerf] = useState(false);
const [perfMessage, setPerfMessage] = useState('');

  const [tradeToClose, setTradeToClose] = useState(null); // This will hold the trade object for the modal
  const [exitPrice, setExitPrice] = useState('');
  const [isClosingTrade, setIsClosingTrade] = useState(false);

  
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
    setVaultAssets([]);
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
    setIsProcessingPnl(true);
    setPnlMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/admin/vaults/${selectedVaultId}/apply-manual-pnl`, { pnlPercentage, beforeTimestamp: new Date(beforeTimestamp).toISOString() });
      setPnlMessage({ type: 'success', text: response.data.message });
      setPnlPercentage('');
      fetchVaultDetails();
    } catch(err) {
      setPnlMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setIsProcessingPnl(false);
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

  const handleTriggerPerformanceUpdate = async () => {
  setIsUpdatingPerf(true);
  setPerfMessage('Triggering job...');
  try {
    const response = await api.post('/admin/jobs/trigger/vault-performance');
    setPerfMessage(response.data.message);
  } catch (err) {
    setPerfMessage('Failed to trigger job.');
    console.error(err);
  } finally {
    setIsUpdatingPerf(false);
  }
};

   const handleAssetWeightChange = (e) => {
    const { name, value } = e.target;
    setNewAssetWeight(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleAddOrUpdateAssetWeight = async (e) => {
    e.preventDefault();
    setIsAssetLoading(true);
    try {
      await api.post(`/admin/vaults/${selectedVaultId}/assets`, newAssetWeight);
      fetchVaultDetails();
      setNewAssetWeight({ symbol: '', weight: '', contract_address: '', chain: 'ETHEREUM' });
    } catch (err) { alert('Failed to add/update asset weight.'); console.error(err); } 
    finally { setIsAssetLoading(false); }
  };

   const handleRemoveAssetWeight = async (symbol) => {
    if (!window.confirm(`Are you sure you want to remove ${symbol}?`)) return;
    try {
      await api.delete(`/admin/vaults/${selectedVaultId}/assets/${symbol}`);
      fetchVaultDetails();
    } catch (err) {
      alert('Failed to remove asset.');
      console.error(err);
    }
  };

   const handleNewTradeChange = (e) => {
    const { name, value } = e.target;
    setNewTrade(prev => ({ ...prev, [name]: value }));
  };

  const handleLogTrade = async (e) => {
    e.preventDefault();
    setIsAssetLoading(true);
    try {
      await api.post(`/admin/vaults/${selectedVaultId}/trades`, newTrade);
      fetchVaultDetails();
      setNewTrade({ asset_symbol: '', direction: 'LONG', quantity: '', entry_price: '' });
      alert('New trade successfully logged as OPEN.');
    } catch (err) {
      alert('Failed to log new trade.');
      console.error(err);
    } finally {
      setIsAssetLoading(false);
    }
  };
  
  const handleCloseTrade = async (e) => {
    e.preventDefault();
    if (!tradeToClose) return;
    setIsClosingTrade(true);
    try {
      await api.patch(`/admin/trades/${tradeToClose.trade_id}/close`, { exit_price: exitPrice });
      setTradeToClose(null); // Close the modal on success
      setExitPrice('');
      fetchVaultDetails(); // Refresh all data
      alert('Trade successfully closed!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close trade.');
      console.error(err);
    } finally {
      setIsClosingTrade(false);
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
                <p>Distribute a percentage-based PnL to all users...</p>
                <form onSubmit={handleApplyPnl} className="admin-form">
                  {/* ... PnL form inputs ... */}
                  <button type="submit" className="btn-primary" disabled={isProcessingPnl}>{isProcessingPnl ? 'Processing...' : 'Apply PnL'}</button>
                </form>
                {pnlMessage.text && <p className={`admin-message ${pnlMessage.type}`}>{pnlMessage.text}</p>}
              </div>
              <div className="admin-actions-card">
                <h3>Capital Sweep</h3>
                <p>Move pending deposits to the trading desk.</p>
                <button onClick={handleTriggerSweep} className="btn-secondary" disabled={isSweeping}>{isSweeping ? '...' : 'Sweep Deposits'}</button>
                {sweepMessage && <p className="admin-message success">{sweepMessage}</p>}
              </div>
              <div className="admin-actions-card">
                <h3>Performance Tracker</h3>
                <p>Manually trigger the hourly job to update the performance chart.</p>
                 <button onClick={handleTriggerPerformanceUpdate} className="btn-secondary" disabled={isUpdatingPerf}>{isUpdatingPerf ? '...' : 'Update Performance'}</button>
                {perfMessage && <p className="admin-message success">{perfMessage}</p>}
              </div>
            </div>

            <div className="admin-actions-card">
              <h3>Log New Trade</h3>
              <p>Record a new open position for this vault.</p>
              <form onSubmit={handleLogTrade} className="admin-form-inline">
                <input name="asset_symbol" value={newTrade.asset_symbol} onChange={handleNewTradeChange} placeholder="Symbol (e.g., BTC)" required />
                <input name="quantity" value={newTrade.quantity} onChange={handleNewTradeChange} placeholder="Quantity" type="number" step="any" required />
                <input name="entry_price" value={newTrade.entry_price} onChange={handleNewTradeChange} placeholder="Entry Price ($)" type="number" step="any" required />
                <select name="direction" value={newTrade.direction} onChange={handleNewTradeChange} required>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
                <button type="submit" className="btn-primary" disabled={isAssetLoading}>{isAssetLoading ? '...' : 'Log Trade'}</button>
              </form>
            </div>

            <div className="admin-actions-card">
              <h3>Manage Target Asset Allocation</h3>
              <p>Define the target asset weights for display on the vault detail page.</p>
              <table className="activity-table" style={{ marginBottom: '24px' }}>
                <thead><tr><th>Symbol</th><th>Weight</th><th>Actions</th></tr></thead>
                <tbody>
                  {vaultAssets.map(asset => (
                    <tr key={asset.asset_id}>
                      <td>{asset.symbol}</td>
                      <td>{(parseFloat(asset.weight) * 100).toFixed(2)}%</td>
                      <td><button className="btn-danger-small" onClick={() => handleRemoveAssetWeight(asset.symbol)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <form onSubmit={handleAddOrUpdateAssetWeight} className="admin-form-inline">
                <input name="symbol" value={newAssetWeight.symbol} onChange={handleAssetWeightChange} placeholder="Symbol (e.g., BTC)" required />
                <input name="weight" value={newAssetWeight.weight} onChange={handleAssetWeightChange} placeholder="Weight (0.0-1.0)" type="number" step="0.01" required />
                <input name="contract_address" value={newAssetWeight.contract_address} onChange={handleAssetWeightChange} placeholder="0x... Contract Address" />
                <input name="chain" value={newAssetWeight.chain} onChange={handleAssetWeightChange} placeholder="Chain (e.g., ETHEREUM)" required />
                <button type="submit" className="btn-primary" disabled={isAssetLoading}>{isAssetLoading ? '...' : 'Add/Update Weight'}</button>
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
                <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Open Trades</h3>
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Opened</th><th>Symbol</th><th>Direction</th><th>Quantity</th><th>Entry Price</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.openTrades.map(trade => (
                      <tr key={trade.trade_id}>
                        <td>{new Date(trade.trade_opened_at).toLocaleString()}</td>
                        <td>{trade.asset_symbol}</td>
                        <td>{trade.direction}</td>
                        <td>{parseFloat(trade.quantity)}</td>
                        <td>${parseFloat(trade.entry_price).toFixed(2)}</td>
                        <td>
                          <button className="btn-secondary btn-sm" onClick={() => setTradeToClose(trade)}>
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- NEW: Trade History Table --- */}
            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Trade History (Last 50)</h3>
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Closed</th><th>Symbol</th><th>Direction</th><th>Entry</th><th>Exit</th><th>P&L (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.tradeHistory.slice(0, 50).map(trade => (
                      <tr key={trade.trade_id}>
                        <td>{new Date(trade.trade_closed_at).toLocaleString()}</td>
                        <td>{trade.asset_symbol}</td>
                        <td>{trade.direction}</td>
                        <td>${parseFloat(trade.entry_price).toFixed(2)}</td>
                        <td>${parseFloat(trade.exit_price).toFixed(2)}</td>
                        <td className={parseFloat(trade.pnl_usd) >= 0 ? 'text-positive' : 'text-negative'}>
                          {parseFloat(trade.pnl_usd).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

    {tradeToClose && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setTradeToClose(null)} className="modal-close-btn">×</button>
            <h3>Close Trade: {tradeToClose.direction} {tradeToClose.asset_symbol}</h3>
            <p>Enter the exit price to close this position and realize the P&L.</p>
            <form onSubmit={handleCloseTrade} className="admin-form">
              <div className="form-group">
                <label>Entry Price</label>
                <input type="text" value={`$${parseFloat(tradeToClose.entry_price).toFixed(2)}`} disabled />
              </div>
              <div className="form-group">
                <label htmlFor="exit-price">Exit Price ($)</label>
                <input 
                  id="exit-price"
                  type="number"
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="Enter the final price"
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setTradeToClose(null)} className="btn-secondary" disabled={isClosingTrade}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isClosingTrade}>
                  {isClosingTrade ? 'Processing...' : 'Confirm & Close Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VaultManagementPage;
