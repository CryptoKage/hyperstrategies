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

  // --- Asset Management ---
  const [vaultAssets, setVaultAssets] = useState([]);
  const [newAssetWeight, setNewAssetWeight] = useState({
    symbol: '',
    weight: '',
    contract_address: '',
    chain: 'ETHEREUM',
  });
  const [newTrade, setNewTrade] = useState({
    asset_symbol: '',
    direction: 'LONG',
    quantity: '',
    entry_price: '',
  });
  const [isAssetLoading, setIsAssetLoading] = useState(false);

  const [isUpdatingPerf, setIsUpdatingPerf] = useState(false);
  const [perfMessage, setPerfMessage] = useState('');

  const [tradeToClose, setTradeToClose] = useState(null);
  const [exitPrice, setExitPrice] = useState('');
  const [isClosingTrade, setIsClosingTrade] = useState(false);

  // Pre-fill datetime-local with the user's local time (no seconds)
  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjustedDate = new Date(now.getTime() - offset * 60 * 1000);
    const formattedDate = adjustedDate.toISOString().substring(0, 16);
    setBeforeTimestamp(formattedDate);
  }, []);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const response = await api.get('/dashboard');
        const list = response?.data?.vaults || [];
        setVaults(list);
        if (list.length > 0) setSelectedVaultId(list[0].vault_id);
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
    setVaultAssets([]);

    try {
      const [detailsRes, assetsRes, tradesRes] = await Promise.all([
        // This is the correct endpoint for vault details
        api.get(`/admin/vaults/${selectedVaultId}/details`), 
        api.get(`/admin/vaults/${selectedVaultId}/assets`),
        // We also need to fetch the trade data for the new tables
        api.get(`/admin/vaults/${selectedVaultId}/trades`) 
      ]);
      
      const combinedData = {
        ...detailsRes.data,
        openTrades: tradesRes.data.openTrades,
        tradeHistory: tradesRes.data.tradeHistory
      };

      setVaultData(combinedData);
      setVaultAssets(assetsRes.data);

      // Ensure arrays are at least empty arrays to avoid .map on undefined
      const details = detailsRes?.data || {};
      setVaultData({
        ...details,
        participants: details.participants || [],
        openTrades: details.openTrades || [],
        tradeHistory: details.tradeHistory || [],
        stats: details.stats || {},
        vault: details.vault || {},
      });

      setVaultAssets(assetsRes?.data || []);
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
    if (!selectedVaultId) return;

    setIsProcessingPnl(true);
    setPnlMessage({ type: '', text: '' });

    try {
      const payload = {
        pnlPercentage: Number(pnlPercentage), // ensure numeric
        beforeTimestamp: new Date(beforeTimestamp).toISOString(),
      };
      const response = await api.post(
        `/admin/vaults/${selectedVaultId}/apply-manual-pnl`,
        payload
      );
      setPnlMessage({ type: 'success', text: response?.data?.message || 'PnL applied.' });
      setPnlPercentage('');
      fetchVaultDetails();
    } catch (err) {
      setPnlMessage({
        type: 'error',
        text: err.response?.data?.message || 'Update failed.',
      });
    } finally {
      setIsProcessingPnl(false);
    }
  };

  const handleTriggerSweep = async () => {
    setIsSweeping(true);
    setSweepMessage('Triggering sweep job...');
    try {
      const response = await api.post('/admin/trigger-sweep');
      setSweepMessage(response?.data?.message || 'Sweep triggered.');
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
      setPerfMessage(response?.data?.message || 'Job triggered.');
    } catch (err) {
      setPerfMessage(err.response?.data?.message || 'Failed to trigger job.');
      console.error(err);
    } finally {
      setIsUpdatingPerf(false);
    }
  };

  // Only uppercase SYMBOL and CHAIN; keep weight/address as entered (bug fix)
  const handleAssetWeightChange = (e) => {
    const { name, value } = e.target;
    setNewAssetWeight((prev) => {
      if (name === 'symbol' || name === 'chain') {
        return { ...prev, [name]: value.toUpperCase() };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddOrUpdateAssetWeight = async (e) => {
    e.preventDefault();
    if (!selectedVaultId) return;

    setIsAssetLoading(true);
    try {
      const payload = {
        ...newAssetWeight,
        weight: newAssetWeight.weight === '' ? '' : Number(newAssetWeight.weight),
      };
      await api.post(`/admin/vaults/${selectedVaultId}/assets`, payload);
      await fetchVaultDetails();
      setNewAssetWeight({ symbol: '', weight: '', contract_address: '', chain: 'ETHEREUM' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add/update asset weight.');
      console.error(err);
    } finally {
      setIsAssetLoading(false);
    }
  };

  const handleRemoveAssetWeight = async (symbol) => {
    if (!window.confirm(`Are you sure you want to remove ${symbol}?`)) return;
    try {
      await api.delete(`/admin/vaults/${selectedVaultId}/assets/${symbol}`);
      await fetchVaultDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove asset.');
      console.error(err);
    }
  };

  const handleNewTradeChange = (e) => {
    const { name, value } = e.target;
    setNewTrade((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogTrade = async (e) => {
    e.preventDefault();
    if (!selectedVaultId) return;

    setIsAssetLoading(true);
    try {
      const payload = {
        ...newTrade,
        quantity: Number(newTrade.quantity),
        entry_price: Number(newTrade.entry_price),
      };
      await api.post(`/admin/vaults/${selectedVaultId}/trades`, payload);
      await fetchVaultDetails();
      setNewTrade({ asset_symbol: '', direction: 'LONG', quantity: '', entry_price: '' });
      alert('New trade successfully logged as OPEN.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log new trade.');
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
      await api.patch(`/admin/trades/${tradeToClose.trade_id}/close`, {
        exit_price: Number(exitPrice),
      });
      setTradeToClose(null);
      setExitPrice('');
      await fetchVaultDetails();
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
          <Link to="/admin" className="btn-secondary btn-sm">
            ← Back to Mission Control
          </Link>
        </div>

        <div className="admin-card">
          <h3>Select Vault</h3>
          <select
            value={selectedVaultId}
            onChange={(e) => setSelectedVaultId(e.target.value)}
            className="admin-vault-select"
          >
            {vaults.map((v) => (
              <option key={v.vault_id} value={v.vault_id}>
                {v.name} (ID: {v.vault_id})
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Loading vault data...</p>}
        {error && <p className="error-message">{error}</p>}

        {vaultData && !loading && !error && (
          <>
            <div className="stats-grid" style={{ marginTop: '24px' }}>
              <StatCard
                label="Total Capital in Vault"
                value={`$${currentVaultCapital.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
              <StatCard
                label="Total Realized PnL"
                value={`$${(vaultData.stats?.totalPnl || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
              <StatCard
                label="Participant Count"
                value={vaultData.stats?.participantCount ?? 0}
              />
            </div>

            <div className="admin-grid">
              <div className="admin-actions-card">
                <h3>Apply Manual PnL</h3>
                <p>Distribute a percentage-based PnL to all users.</p>

                {/* PnL form inputs were missing before */}
                <form onSubmit={handleApplyPnl} className="admin-form">
                  <div className="form-group">
                    <label htmlFor="pnl-percentage">PnL Percentage (e.g. 2.5 or -1.2)</label>
                    <input
                      id="pnl-percentage"
                      name="pnlPercentage"
                      type="number"
                      step="any"
                      value={pnlPercentage}
                      onChange={(e) => setPnlPercentage(e.target.value)}
                      placeholder="Enter % change (not 0.025)"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="before-timestamp">Apply to positions before</label>
                    <input
                      id="before-timestamp"
                      type="datetime-local"
                      value={beforeTimestamp}
                      onChange={(e) => setBeforeTimestamp(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={isProcessingPnl}>
                    {isProcessingPnl ? 'Processing...' : 'Apply PnL'}
                  </button>
                </form>

                {pnlMessage.text && (
                  <p className={`admin-message ${pnlMessage.type}`}>{pnlMessage.text}</p>
                )}
              </div>

              <div className="admin-actions-card">
                <h3>Capital Sweep</h3>
                <p>Move pending deposits to the trading desk.</p>
                <button
                  onClick={handleTriggerSweep}
                  className="btn-secondary"
                  disabled={isSweeping}
                >
                  {isSweeping ? '...' : 'Sweep Deposits'}
                </button>
                {sweepMessage && <p className="admin-message success">{sweepMessage}</p>}
              </div>

              <div className="admin-actions-card">
                <h3>Performance Tracker</h3>
                <p>Manually trigger the hourly job to update the performance chart.</p>
                <button
                  onClick={handleTriggerPerformanceUpdate}
                  className="btn-secondary"
                  disabled={isUpdatingPerf}
                >
                  {isUpdatingPerf ? '...' : 'Update Performance'}
                </button>
                {perfMessage && <p className="admin-message success">{perfMessage}</p>}
              </div>
            </div>

             <div className="admin-actions-card">
              <h3>Log New Trade</h3>
              <p>Record a new open position for this vault. This will be used to calculate unrealized P&L.</p>
              <form onSubmit={handleLogTrade} className="admin-form-inline">
                <input name="asset_symbol" value={newTrade.asset_symbol} onChange={handleNewTradeChange} placeholder="Symbol (e.g., WBTC)" required />
                <input name="quantity" value={newTrade.quantity} onChange={handleNewTradeChange} placeholder="Quantity" type="number" step="any" required />
                <input name="entry_price" value={newTrade.entry_price} onChange={handleNewTradeChange} placeholder="Entry Price ($)" type="number" step="any" required />
                <select name="direction" value={newTrade.direction} onChange={handleNewTradeChange} required>
                  <option value="LONG">LONG</option>
                  <option value-="SHORT">SHORT</option>
                </select>
                <input name="contract_address" value={newTrade.contract_address} onChange={handleNewTradeChange} placeholder="0x... Contract Address" required />
                <input name="chain" value={newTrade.chain} onChange={handleNewTradeChange} placeholder="Chain (e.g., ETHEREUM)" required />
                <button type="submit" className="btn-primary" disabled={isAssetLoading}>{isAssetLoading ? '...' : 'Log Trade'}</button>
              </form>
            </div>

            <div className="admin-actions-card">
              <h3>Manage Target Asset Allocation</h3>
              <p>Define the target asset weights for display on the vault detail page.</p>
              <table className="activity-table" style={{ marginBottom: '24px' }}>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Weight</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultAssets.map((asset, idx) => (
                    <tr key={asset.asset_id ?? `${asset.symbol}-${idx}`}>
                      <td>{asset.symbol}</td>
                      <td>
                        {Number(asset.weight ?? 0) * 100
                          ? `${(Number(asset.weight) * 100).toFixed(2)}%`
                          : '0.00%'}
                      </td>
                      <td>
                        <button
                          className="btn-danger-small"
                          onClick={() => handleRemoveAssetWeight(asset.symbol)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <form onSubmit={handleAddOrUpdateAssetWeight} className="admin-form-inline">
                <input
                  name="symbol"
                  value={newAssetWeight.symbol}
                  onChange={handleAssetWeightChange}
                  placeholder="Symbol (e.g., BTC)"
                  required
                />
                <input
                  name="weight"
                  value={newAssetWeight.weight}
                  onChange={handleAssetWeightChange}
                  placeholder="Weight (0.0-1.0)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                />
                <input
                  name="contract_address"
                  value={newAssetWeight.contract_address}
                  onChange={handleAssetWeightChange}
                  placeholder="0x... Contract Address"
                />
                <input
                  name="chain"
                  value={newAssetWeight.chain}
                  onChange={handleAssetWeightChange}
                  placeholder="Chain (e.g., ETHEREUM)"
                  required
                />
                <button type="submit" className="btn-primary" disabled={isAssetLoading}>
                  {isAssetLoading ? '...' : 'Add/Update Weight'}
                </button>
              </form>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Participants in {vaultData?.vault?.name ?? 'Vault'}</h3>
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
                    {vaultData.participants.map((p) => {
                      const principal = Number(p.principal) || 0;
                      const pnl = Number(p.pnl) || 0;
                      const total = Number(p.total_capital) || 0;
                      return (
                        <tr key={p.user_id}>
                          <td>
                            <Link to={`/admin/user/${p.user_id}`} className="admin-table-link">
                              {p.username}
                            </Link>
                          </td>
                          <td>
                            $
                            {principal.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className={pnl >= 0 ? 'text-positive' : 'text-negative'}>
                            $
                            {pnl.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td>
                            $
                            {total.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    })}
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
                      <th>Opened</th>
                      <th>Symbol</th>
                      <th>Direction</th>
                      <th>Quantity</th>
                      <th>Entry Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.openTrades.map((trade) => (
                      <tr key={trade.trade_id}>
                        <td>{trade.trade_opened_at ? new Date(trade.trade_opened_at).toLocaleString() : '-'}</td>
                        <td>{trade.asset_symbol}</td>
                        <td>{trade.direction}</td>
                        <td>{Number(trade.quantity)}</td>
                        <td>${Number(trade.entry_price).toFixed(2)}</td>
                        <td>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => setTradeToClose(trade)}
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trade History */}
            <div className="admin-card" style={{ marginTop: '24px' }}>
              <h3>Trade History (Last 50)</h3>
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Closed</th>
                      <th>Symbol</th>
                      <th>Direction</th>
                      <th>Entry</th>
                      <th>Exit</th>
                      <th>P&amp;L (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaultData.tradeHistory.slice(0, 50).map((trade) => {
                      const entry = Number(trade.entry_price);
                      const exit = Number(trade.exit_price);
                      const pnl = Number(trade.pnl_usd);
                      return (
                        <tr key={trade.trade_id}>
                          <td>
                            {trade.trade_closed_at
                              ? new Date(trade.trade_closed_at).toLocaleString()
                              : '-'}
                          </td>
                          <td>{trade.asset_symbol}</td>
                          <td>{trade.direction}</td>
                          <td>${isFinite(entry) ? entry.toFixed(2) : '0.00'}</td>
                          <td>${isFinite(exit) ? exit.toFixed(2) : '0.00'}</td>
                          <td className={pnl >= 0 ? 'text-positive' : 'text-negative'}>
                            {isFinite(pnl) ? pnl.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      );
                    })}
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
            <button onClick={() => setTradeToClose(null)} className="modal-close-btn">
              ×
            </button>
            <h3>
              Close Trade: {tradeToClose.direction} {tradeToClose.asset_symbol}
            </h3>
            <p>Enter the exit price to close this position and realize the P&amp;L.</p>
            <form onSubmit={handleCloseTrade} className="admin-form">
              <div className="form-group">
                <label>Entry Price</label>
                <input
                  type="text"
                  value={`$${Number(tradeToClose.entry_price).toFixed(2)}`}
                  disabled
                />
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
                <button
                  type="button"
                  onClick={() => setTradeToClose(null)}
                  className="btn-secondary"
                  disabled={isClosingTrade}
                >
                  Cancel
                </button>
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
