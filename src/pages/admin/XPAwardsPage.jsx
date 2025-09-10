// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK into your new src/pages/admin/XPAwardsPage.jsx
// ==============================================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const XPAwardsPage = () => {
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
      // Basic JSON validation on the frontend
      const bounties = JSON.parse(jsonInput);
      if (!Array.isArray(bounties)) {
        throw new Error("Input must be a valid JSON array.");
      }
      
      const response = await api.post('/admin/bulk-award-xp', { bounties });
      setResults(response.data.results);
      
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your input.");
      } else {
        setError(err.response?.data?.error || "An unexpected error occurred.");
      }
      console.error("Bulk award failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Bulk XP Awards</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

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
                <ul>
                  {results.success.map((item, index) => (
                    <li key={index}>Awarded {item.xp_awarded.toFixed(2)} XP to Telegram user '{item.telegram_id}' (User ID: {item.userId})</li>
                  ))}
                </ul>
              ) : <p>No successful awards.</p>}

              <h4 style={{ marginTop: '24px' }}>Failed Awards ({results.failed.length})</h4>
              {results.failed.length > 0 ? (
                <ul>
                  {results.failed.map((item, index) => (
                    <li key={index}>Failed for Telegram user '{item.telegram_id}': {item.reason}</li>
                  ))}
                </ul>
              ) : <p>No failed awards.</p>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default XPAwardsPage;
// ==============================================================================
// END OF FILE
// ==============================================================================
