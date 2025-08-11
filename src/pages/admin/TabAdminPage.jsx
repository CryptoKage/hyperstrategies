// src/pages/admin/TabAdminPage.jsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/api';

const TabAdminPage = () => {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [mintError, setMintError] = useState(null);

  const fetchData = async () => {
    try {
      const [invRes, statRes, logRes] = await Promise.all([
        api.get('/admin/tabs/inventory'),
        api.get('/admin/tabs/stats'),
        api.get('/tabs/logs')
      ]);
      setInventory(invRes.data);
      setStats(statRes.data);
      setLogs(logRes.data);
    } catch (err) {
      console.error('Failed to fetch tab data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMint = async (e) => {
    e.preventDefault();
    try {
      setMintError(null);
      await api.post('/tabs/mint', { name, price: parseFloat(price) });
      setName('');
      setPrice('');
      fetchData();
    } catch (err) {
      const message = err?.response?.data?.error || 'Mint failed';
      setMintError(message);
      console.error('Mint failed', err);
    }
  };

  const handleBurn = async (id) => {
    try {
      await api.post(`/tabs/${id}/burn`);
      fetchData();
    } catch (err) {
      console.error('Burn failed', err);
    }
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Tab Management</h1>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Minted</span>
              <span className="stat-value">{stats.totalMinted}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Burned</span>
              <span className="stat-value">{stats.totalBurned}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Tabs</span>
              <span className="stat-value">{stats.active}</span>
            </div>
          </div>
        )}

        <div className="admin-actions-card">
          <h3>Mint New Tab</h3>
          {mintError && <p className="error-message">{mintError}</p>}
          <form onSubmit={handleMint} className="admin-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Mint</button>
          </form>
        </div>

        <div className="admin-grid">
          <div className="activity-card">
            <h3>Tab Inventory</h3>
            <div className="table-responsive">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th className="amount">Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(tab => (
                    <tr key={tab.id}>
                      <td>{tab.id}</td>
                      <td>{tab.name}</td>
                      <td className="amount">${tab.price}</td>
                      <td className="actions-cell">
                        <button className="btn-icon" onClick={() => handleBurn(tab.id)}>Burn</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="activity-card">
            <h3>Transaction History</h3>
            <div className="table-responsive">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Tab ID</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{log.id}</td>
                      <td>{log.action}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TabAdminPage;

