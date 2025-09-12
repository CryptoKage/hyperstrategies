import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import { PinImage } from '../../components/UserPins'; // Corrected path assuming UserPins is in components

const UserDetailPage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' or 'nameHistory'

  const fetchUserDetails = useCallback(async () => {
    if (!userId) { return; }
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setUserData(response.data);
    } catch (err) {
      setError('Failed to fetch user details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  if (loading) {
    return <Layout><div className="admin-container"><h1>Loading User Details...</h1></div></Layout>;
  }
  if (error) {
    return <Layout><div className="admin-container"><p className="error-message">{error}</p></div></Layout>;
  }
  if (!userData) {
    return <Layout><div className="admin-container"><h1>User not found.</h1></div></Layout>;
  }

  const { details, positions, activity, usernameHistory } = userData;
  const totalStakedCapital = positions.reduce((sum, position) => sum + parseFloat(position.total_capital || 0), 0);
  const dailyXpRate = totalStakedCapital / 300;

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
              <div className="detail-item"><strong>User ID:</strong><span>{details.user_id}</span></div>
              <div className="detail-item"><strong>Email:</strong><span>{details.email}</span></div>
              <div className="detail-item full-width"><strong>Wallet:</strong><span className="address-span">{details.eth_address}</span></div>
              <div className="detail-item"><strong>XP:</strong><span>{(parseFloat(details.xp) || 0).toFixed(2)}</span></div>
              <div className="detail-item"><strong>Tier:</strong><span>{details.account_tier}</span></div>
              <div className="detail-item"><strong>Staking XP Rate:</strong><span>+{dailyXpRate.toFixed(2)} / day</span></div>
              <div className="detail-item"><strong>Available Balance:</strong><span>${(parseFloat(details.balance) || 0).toFixed(2)}</span></div>
              <div className="detail-item"><strong>Bonus Points:</strong><span>${(parseFloat(details.total_bonus_points) || 0).toFixed(2)}</span></div>
              <div className="detail-item"><strong>Referral Code:</strong><span>{details.referral_code}</span></div>
              <div className="detail-item"><strong>Joined:</strong><span>{new Date(details.created_at).toLocaleDateString()}</span></div>
            </div>
            {/* The Pin display needs to use the full pin objects from the API */}
            {/* We will adjust this once the backend sends the full pin objects */}
          </div>

          <div className="admin-card">
            <h3>Vault Positions ({positions.length})</h3>
            {positions.length > 0 ? (
              <div className="table-responsive-wrapper">
                <table className="activity-table">
                  <thead><tr><th>Vault</th><th>Total Capital</th></tr></thead>
                  <tbody>
                    {positions.map(p => (
                      <tr key={p.vault_id}>
                        <td>{p.vault_name} (ID: {p.vault_id})</td>
                        <td>${(parseFloat(p.total_capital) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No active vault positions.</p>}
          </div>
        </div>

 {details.pins && details.pins.length > 0 && (
              <div className="user-pins-admin-list">
                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Owned Pins ({details.pins.length})</h4>
                <ul>
                  {details.pins.map(pinName => (
                    <li key={pinName}>{pinName}</li>
                  ))}
                </ul>
              </div>
            )}

        <div className="admin-card">
          <div className="tabs">
            <button className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Recent Activity</button>
            <button className={`tab-button ${activeTab === 'nameHistory' ? 'active' : ''}`} onClick={() => setActiveTab('nameHistory')}>Username History</button>
          </div>
          <div className="tab-content">
            {activeTab === 'activity' && (
              <>
                <h3>Recent Activity (Last 50)</h3>
                {activity && activity.length > 0 ? (
                  <div className="table-responsive-wrapper">
                    <table className="activity-table">
                      <thead><tr><th>Date</th><th>Type</th><th>Description</th><th className="amount">Amount</th></tr></thead>
                      <tbody>
                        {activity.map(a => (
                          <tr key={a.activity_id}>
                            <td>{new Date(a.created_at).toLocaleString()}</td>
                            <td>{a.activity_type}</td>
                            <td>{a.description}</td>
                            <td className="amount">{a.amount_primary ? `${parseFloat(a.amount_primary).toFixed(2)} ${a.symbol_primary || ''}` : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p>No recent activity found.</p>}
              </>
            )}
            {activeTab === 'nameHistory' && (
              <>
                <h3>Username Change History</h3>
                {usernameHistory && usernameHistory.length > 0 ? (
                  <div className="table-responsive-wrapper">
                    <table className="activity-table">
                      <thead><tr><th>Date Changed</th><th>Old Username</th><th>New Username</th></tr></thead>
                      <tbody>
                        {usernameHistory.map((log, index) => (
                          <tr key={index}>
                            <td>{new Date(log.changed_at).toLocaleString()}</td>
                            <td>{log.old_username}</td>
                            <td>{log.new_username}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p>No username changes on record.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetailPage;
