// src/pages/XPLeaderboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Layout from '../components/Layout';
// We need a placeholder for your infographic for now
import XpInfographic from '../assets/xp-infographic-placeholder.png'; 

const XPLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('Copy Referral Link');

  // Fetch the leaderboard data when the page loads
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await api.get('/user/leaderboard');
      setLeaderboard(response.data);
    } catch (err) {
      console.error("Could not load leaderboard.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleShareClick = () => {
    if (user?.referral_code) {
      const referralLink = `https://www.hyper-strategies.com/register?ref=${user.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      setCopySuccess('Link Copied!');
      setTimeout(() => setCopySuccess('Copy Referral Link'), 2000);
    } else {
      // If user is not logged in, maybe navigate them to login
      setCopySuccess('Log in to get your link!');
      setTimeout(() => setCopySuccess('Copy Referral Link'), 2000);
    }
  };

  return (
    <Layout>
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>XP & Leaderboard</h1>
          <p>Earn XP by participating in the ecosystem and climb the ranks!</p>
        </div>

        {/* The Shareable Infographic Section */}
        <div className="infographic-section">
          <h3>How to Earn XP</h3>
          <div className="infographic-wrapper" onClick={handleShareClick} title="Click to copy your referral link!">
            <img src={XpInfographic} alt="How to earn XP infographic" />
            <div className="infographic-overlay">
              <span>{copySuccess}</span>
            </div>
          </div>
        </div>
        
        {/* The Leaderboard Table Section */}
        <div className="leaderboard-table-section">
          <h3>Top 25 Users</h3>
          {loading ? (
            <p>Loading leaderboard...</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr key={player.username}>
                    <td>{index + 1}</td>
                    <td>{player.username}</td>
                    <td>{parseInt(player.xp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default XPLeaderboard;