// src/pages/admin/UserDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';

const UserDetailPage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State specifically for bonus points
  const [bonusPoints, setBonusPoints] = useState(0);

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // We now fetch the main user details and their bonus points in parallel for speed
      const [userResponse, bonusPointsResponse] = await Promise.all([
        api.get(`/admin/users/${userId}`),
        api.get(`/admin/users/${userId}/bonus-points`) // This is the new, small endpoint
      ]);
      
      setUserData(userResponse.data);
      setBonusPoints(bonusPointsResponse.data.totalBonusPoints);

    } catch (err) {
      setError('Failed to fetch user details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  if (loading) {
    return <Layout><div className="admin-container"><h1>Loading User Details...</h1></div></Layout>;
  }

  if (error) {
    return <Layout><div className="admin-container"><p className="error-message">{error}</p></div></Layout>;
  }

  if (!userData) {
    return <Layout><div className="admin-container"><h1>User not found.</h1></div></Layout>;
  }

  const { details, positions, activity } = userData;

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>User Profile: {details.username}</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Account Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <strong>User ID:</strong>
                <span>{details.user_id}</span>
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{details.email}</span>
              </div>
              <div className="detail-item full-width">
                <strong>Wallet:</strong>
                <span className="address-span">{details.eth_address}</span>
              </div>
              <div className="detail-item">
                <strong>XP:</strong>
                <span>{details.xp}</span>
              </div>
              <div className="detail-item">
                <strong>Tier:</strong>
                <span>{details.account_tier}</span>
              </div>
              <div className="detail-item">
                <strong>Balance:</strong>
                <span>${parseFloat(details.balance).toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <strong>Bonus Points:</strong>
                <span>${parseFloat(bonusPoints).toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <strong>Referral:</strong>
                <span>{details.referral_code}</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3>Vault Positions ({positions.length})</h3>
            {positions.length > 0 ? (
              <div className="table-responsive-wrapper">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Vault ID</th><th>Capital</th><th>Status</th><th>Unlock Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(p => (
                      <tr key={p.position_id}>
                        <td>{p.vault_id}</td>
                        <td>${parseFloat(p.tradable_capital).toFixed(2)}</td>
                        <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                        <td>{p.lock_expires_at ? new Date(p.lock_expires_at).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No active vault positions.</p>}
          </div>
        </div>

        <div className="admin-card">
          <h3>Recent Activity (Last 50)</h3>
          {activity.length > 0 ? (
            <div className="table-responsive-wrapper">
              <table className="activity-table">
                 <thead>
                  <tr>
                    <th>Date</th><th>Type</th><th>Description</th><th className="amount">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map(a => (
                    <tr key={a.activity_id}>
                      <td>{new Date(a.created_at).toLocaleString()}</td>
                      <td>{a.activity_type}</td>
                      <td>{a.description}</td>
                      <td className="amount">
                        {a.amount_primary ? `${parseFloat(a.amount_primary).toFixed(2)} ${a.symbol_primary || ''}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p>No recent activity found.</p>}
        </div>
      </div>
    </Layout>
  );
};

export default UserDetailPage;