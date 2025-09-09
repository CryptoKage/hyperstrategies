
// START: PASTE THIS ENTIRE BLOCK into your new src/pages/RewardsCenter.jsx 

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import CountUp from 'react-countup'; // <-- Import the animation library

const RewardsCenter = () => {
  const { t } = useTranslation();

  const [rewardsData, setRewardsData] = useState({ unclaimedXp: 0, claimedHistory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const fetchRewardsData = useCallback(async () => {
    try {
      const response = await api.get('/user/rewards');
      setRewardsData(response.data);
    } catch (err) {
      console.error("Failed to fetch rewards data:", err);
      setError("Could not load your rewards data at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewardsData();
  }, [fetchRewardsData]);

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimMessage('');
    try {
      const response = await api.post('/user/rewards/claim');
      setClaimMessage(response.data.message || "XP Claimed!");
      // Re-fetch data to update the UI with new totals
      await fetchRewardsData();
    } catch (err) {
      setClaimMessage(err.response?.data?.error || "Failed to claim XP.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading) {
    return <Layout><div className="rewards-container"><h1>Loading Rewards...</h1></div></Layout>;
  }
  if (error) {
    return <Layout><div className="rewards-container"><p className="error-message">{error}</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="rewards-container">
        <h1>Rewards Center</h1>

        <div className="rewards-grid">
          {/* --- Claim XP Card --- */}
          <div className="profile-card rewards-card">
            <h3>Unclaimed XP</h3>
            <div className="xp-counter">
              <CountUp 
                start={0}
                end={rewardsData.unclaimedXp}
                duration={2.5}
                decimals={4}
                suffix=" XP"
              />
            </div>
            <p>This is XP you've earned from bounties and special events. Claim it to add it to your total balance.</p>
            <button 
              className="btn-primary" 
              onClick={handleClaim} 
              disabled={isClaiming || rewardsData.unclaimedXp <= 0}
            >
              {isClaiming ? "Claiming..." : "Claim All XP"}
            </button>
            {claimMessage && <p className="claim-message">{claimMessage}</p>}
          </div>

          {/* --- Presale Card --- */}
          <div className="profile-card presale-card">
            <h3>Platform Presale</h3>
            <p>Your total XP balance determines your allocation in our upcoming token presale. Secure your spot!</p>
            {/* This link should go to your future presale page */}
            <Link to="/presale-info" className="btn-secondary">
              Learn More About the Presale
            </Link>
          </div>
        </div>

        {/* --- XP History Section --- */}
        <div className="xp-history-section">
          <h2>XP Ledger</h2>
          <p>A breakdown of all XP you have earned and claimed so far.</p>
          <div className="xp-history-grid">
            {rewardsData.claimedHistory.length > 0 ? (
              rewardsData.claimedHistory.map((item, index) => (
                <div key={index} className="xp-source-card">
                  <span className="xp-source-title">{item.source.replace(/_/g, ' ')}</span>
                  <span className="xp-source-amount">+{item.total.toLocaleString(undefined, {maximumFractionDigits: 2})} XP</span>
                </div>
              ))
            ) : (
              <p>You have no claimed XP history yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RewardsCenter;
