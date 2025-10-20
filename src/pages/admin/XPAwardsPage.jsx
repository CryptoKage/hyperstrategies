// src/pages/admin/XPAwardsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

// --- NEW COMPONENT: Reward Distribution Form ---
const RewardDistributionForm = () => {
  const [vaults, setVaults] = useState([]);
  const [totalRewardUsd, setTotalRewardUsd] = useState('');
  const [participatingVaultIds, setParticipatingVaultIds] = useState([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch all active, investable vaults
    api.get('/dashboard') // Re-using the dashboard endpoint is efficient
      .then(res => {
        const investableVaults = res.data.vaults.filter(v => v.status === 'active');
        setVaults(investableVaults);
      })
      .catch(err => {
        console.error("Could not fetch vaults for reward distribution form.", err);
        setStatus({ message: 'Failed to load vault list.', type: 'error' });
      });
  }, []);

  const handleCheckboxChange = (vaultId) => {
    setParticipatingVaultIds(prev =>
      prev.includes(vaultId)
        ? prev.filter(id => id !== vaultId)
        : [...prev, vaultId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to distribute these rewards? This action is irreversible.")) {
      return;
    }
    setIsProcessing(true);
    setStatus({ message: '', type: '' });

    try {
      const payload = {
        totalRewardUsd: parseFloat(totalRewardUsd),
        participatingVaultIds,
        description,
      };
      const response = await api.post('/admin/rewards/distribute-by-xp', payload);
      setStatus({ message: response.data.message, type: 'success' });
      // Clear form on success
      setTotalRewardUsd('');
      setParticipatingVaultIds([]);
      setDescription('');
    } catch (err) {
      setStatus({ message: err.response?.data?.error || 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="admin-card" style={{ marginTop: '24px' }}>
      <h3>XP-Weighted Reward Distribution</h3>
      <p>Distribute a total USDC amount as PNL to users currently invested in the selected vaults. Each user's share is proportional to their XP relative to the total XP of all other eligible users.</p>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="total-reward">Total Reward to Distribute (USDC)</label>
          <input
            id="total-reward"
            type="number"
            step="0.01"
            value={totalRewardUsd}
            onChange={(e) => setTotalRewardUsd(e.target.value)}
            placeholder="e.g., 10000.00"
            required
          />
        </div>
        <div className="form-group">
          <label>Distribute to Users In:</label>
          <div className="checkbox-group">
            {vaults.length > 0 ? (
              vaults.map(vault => (
                <label key={vault.vault_id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={participatingVaultIds.includes(vault.vault_id)}
                    onChange={() => handleCheckboxChange(vault.vault_id)}
                  />
                  {vault.name}
                </label>
              ))
            ) : <p>Loading vaults...</p>}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="reward-description">Description for User Activity Log</label>
          <input
            id="reward-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Q2 Farming Profits"
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isProcessing || participatingVaultIds.length === 0}>
          {isProcessing ? 'Distributing...' : 'Distribute Rewards'}
        </button>
        {status.message && <p className={`admin-message ${status.type}`}>{status.message}</p>}
      </form>
    </div>
  );
};

// --- Your Existing Bulk XP Awards Component ---
const BulkXPAwards = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setResults(null);
    setError('');
    try {
      const bounties = JSON.parse(jsonInput);
      if (!Array.isArray(bounties)) throw new Error("Input must be a valid JSON array.");
      const response = await api.post('/admin/bulk-award-xp', { bounties });
      setResults(response.data.results);
    } catch (err) {
      if (err instanceof SyntaxError) setError("Invalid JSON format. Please check your input.");
      else setError(err.response?.data?.error || "An unexpected error occurred.");
      console.error("Bulk award failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="admin-card">
      <h3>Award XP from JSON</h3>
      <p>Paste a JSON array of bounties to award unclaimed XP to users based on their Telegram ID. The required format is: <br /><code>[{"{ \"telegram_id\": \"user1\", \"usd_value\": 100.50 }"}, ...]</code></p>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="bounty-json">Bounty JSON Data</label>
          <textarea
            id="bounty-json"
            rows="10"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"telegram_id": "some_user", "usd_value": 50.00}]'
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Process & Award XP'}
        </button>
        {error && <p className="admin-message error">{error}</p>}
      </form>
      {results && (
        <div className="admin-results-section">
          <h3>Processing Results</h3>
          <h4>Successful Awards ({results.success.length})</h4>
          {results.success.length > 0 ? (
            <ul>{results.success.map((item, index) => <li key={index}>Awarded {item.xp_awarded.toFixed(2)} XP to Telegram user '{item.telegram_id}' (User ID: {item.userId})</li>)}</ul>
          ) : <p>No successful awards.</p>}
          <h4 style={{ marginTop: '24px' }}>Failed Awards ({results.failed.length})</h4>
          {results.failed.length > 0 ? (
            <ul>{results.failed.map((item, index) => <li key={index}>Failed for Telegram user '{item.telegram_id}': {item.reason}</li>)}</ul>
          ) : <p>No failed awards.</p>}
        </div>
      )}
    </div>
  );
};


const XPAwardsPage = () => {
  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>XP & Reward Tools</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>
        <BulkXPAwards />
        <RewardDistributionForm />
      </div>
    </Layout>
  );
};

export default XPAwardsPage;
