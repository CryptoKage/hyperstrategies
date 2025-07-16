// src/pages/XPLeaderboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Layout from '../components/Layout';
import InfoModal from '../components/InfoModal';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItem } from '../components/Accordion';

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

  // This is the text block for content creators to share
  const xpInfoText = `
🚀 How to Earn XP on HyperStrategies 🚀

- Early Adopter Bonus: Get up to 25 XP for being one of the first 1000 users to allocate funds!
- Successful Referral: Earn 50 XP when a friend you refer makes their first vault allocation.
- Capital Allocation: Earn 1 XP for every $100 you allocate to a vault.

Join with my referral link and get a head start! 👇
[Your Referral Link Here]
  `;

  // This is the full "copy logic"
  const handleCopyClick = () => {
    // If the user is logged in, we personalize the message with their link.
    const shareableText = user 
      ? xpInfoText.replace('[Your Referral Link Here]', `https://www.hyper-strategies.com/register?ref=${user.referral_code}`)
      : xpInfoText.replace('[Your Referral Link Here]', 'https://www.hyper-strategies.com');
      
    // Use the browser's Clipboard API to copy the text
    navigator.clipboard.writeText(shareableText.trim());
    
    // Provide visual feedback
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess('Copy Info for Sharing'), 2000); // Reset after 2 seconds
  };

  const formatAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anonymous';

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
                      <tr key={player.eth_address || index} className={isCurrentUser ? 'current-user-row' : ''}>
                        <td>{index + 1}</td>
                        <td>{formatAddress(player.eth_address)}</td>
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
<Accordion>
          <AccordionItem title="🚀 Early Adopter Sign-Up Bonus (First 500 Users)">
            <p>A one-time XP bonus is awarded to the first 500 users upon registration to reward our earliest supporters. The bonus is tiered:</p>
            <ul className="reward-list">
              <li><strong>Users 1-100:</strong> 25 XP</li>
              <li><strong>Users 101-200:</strong> 20 XP</li>
              <li><strong>Users 201-300:</strong> 15 XP</li>
              <li><strong>Users 301-400:</strong> 10 XP</li>
              <li><strong>Users 401-500:</strong> 5 XP</li>
            </ul>
          </AccordionItem>
          
          <AccordionItem title="💰 Capital Allocation: 1 XP per $10">
            <p>You earn XP by putting your capital to work. For every $10 you allocate to any vault (minimum $100 allocation), you will earn 1 XP. An allocation of $1,000 earns you 100 XP.</p>
          </AccordionItem>
          
          <AccordionItem title="🤝 Successful Referral: Dynamic (10%)">
            <p>When a new user signs up with your referral code and makes their first vault allocation (minimum $100), you, the referrer, will earn XP equal to 10% of their allocated amount. If they allocate $1,000, you get 100 XP.</p>
          </AccordionItem>

          <AccordionItem title="⏳ Weekly Staking Bonus: Coming Soon">
            <p>A future feature will reward users with XP for every week they keep their capital allocated in a vault, rewarding long-term commitment.</p>
          </AccordionItem>
          
          <AccordionItem title="💸 Bonus Point Buy-Back: 1-to-1 XP">
            <p>When the platform buys back your Bonus Points, you will receive an equal amount of XP. A buy-back of 200 Bonus Points also grants you 200 XP.</p>
          </AccordionItem>
        </Accordion>
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