// src/pages/XPLeaderboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Layout from '../components/Layout';
import InfoModal from '../components/InfoModal';
import { useTranslation } from 'react-i18next';

const XPLeaderboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isXPModalOpen, setIsXPModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('Copy Info for Sharing');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leaderboardRes, myRankRes] = await Promise.all([
        api.get('/user/leaderboard'),
        user ? api.get('/user/my-rank') : Promise.resolve(null)
      ]);
      
      setLeaderboard(leaderboardRes.data);
      if (myRankRes) {
        setMyRank(myRankRes.data);
      }
    } catch (err) {
      console.error("Could not load leaderboard data.", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // The text block for content creators to share
  const xpInfoText = `
🚀 How to Earn XP on HyperStrategies 🚀

- First 1000 Sign-ups: Bonus XP!
- Successful Referral: Earn XP when your friend invests.
- Capital Allocation: Get XP for allocating funds to vaults.

Join with my referral link and get a head start! 👇
[Your Link Will Be Here]
  `;

  const handleCopyClick = () => {
    // A more personalized message if the user is logged in
    const shareableText = user 
      ? xpInfoText.replace('[Your Link Will Be Here]', `https://www.hyper-strategies.com/register?ref=${user.referral_code}`)
      : xpInfoText.replace('[Your Link Will Be Here]', 'https://www.hyper-strategies.com');
      
    navigator.clipboard.writeText(shareableText.trim());
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess('Copy Info for Sharing'), 2000);
  };

  return (
    <>
      <Layout>
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h1>XP & Leaderboard</h1>
            <p>Earn XP by participating in the ecosystem and climb the ranks!</p>
          </div>
          
          <div className="how-to-earn-section">
            <button className="btn-outline" onClick={() => setIsXPModalOpen(true)}>
              How to Earn XP
            </button>
          </div>
          
          {user && myRank && (
            <div className="my-rank-card">
              <h3>Your Rank</h3>
              <div className="my-rank-stats">
                <div className="my-rank-stat">
                  <span>Rank</span>
                  <span>#{myRank.rank}</span>
                </div>
                <div className="my-rank-stat">
                  <span>Total XP</span>
                  <span>{parseInt(myRank.xp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="leaderboard-table-section">
            <h3>Top 25 Users</h3>
            {loading ? (
              <p>Loading leaderboard...</p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr><th>Rank</th><th>User</th><th>XP</th></tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => {
                    const isCurrentUser = user && user.username === player.username;
                    return (
                      <tr key={player.username} className={isCurrentUser ? 'current-user-row' : ''}>
                        <td>{index + 1}</td>
                        <td>{player.username}</td>
                        <td>{parseInt(player.xp).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Layout>

      <InfoModal
        isOpen={isXPModalOpen}
        onClose={() => setIsXPModalOpen(false)}
        title="How to Earn XP"
      >
        {/* We pass the copy button in as a child to the modal */}
        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button className="btn-primary" onClick={handleCopyClick}>
            {copySuccess}
          </button>
        </div>
      </InfoModal>
    </>
  );
};

export default XPLeaderboard;