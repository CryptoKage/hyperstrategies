// ==============================================================================
// FINAL, FULL VERSION: PASTE THIS to replace your entire RewardsCenter.jsx FILE
// ==============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import CountUp from 'react-countup';

const RewardsCenter = () => {
  const { t } = useTranslation();

  const [rewardsData, setRewardsData] = useState({ unclaimedXp: 0, claimedHistory: [] });
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const [totalXp, setTotalXp] = useState(0);
  
  const [verifyingBountyId, setVerifyingBountyId] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState({ id: null, type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
     const [rewardsRes, bountiesRes, statsRes] = await Promise.all([
  api.get('/user/rewards'),
  api.get('/bounties'),
  api.get('/stats/total-xp-awarded') 
]);
setTotalXp(statsRes.data.totalXpAwarded);

      setRewardsData(rewardsRes.data);
      setBounties(bountiesRes.data);
    } catch (err) {
      console.error("Failed to fetch page data:", err);
      setError("Could not load your rewards data at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimMessage('');
    try {
      const response = await api.post('/user/rewards/claim');
      setClaimMessage(response.data.message || "XP Claimed!");
      await fetchData();
    } catch (err) {
      setClaimMessage(err.response?.data?.error || "Failed to claim XP.");
    } finally {
      setIsClaiming(false);
    }
  };

  


  const handleVerifyBounty = async (bountyId) => {
    setVerifyingBountyId(bountyId);
    setVerificationMessage({ id: bountyId, text: 'Verifying...' });
    try {
      const response = await api.post(`/bounties/${bountyId}/verify`);
      if (response.data.success) {
        setVerificationMessage({ id: bountyId, type: 'success', text: response.data.message });
        fetchData(); // Refresh all data to update unclaimed total
      } else {
        setVerificationMessage({ id: bountyId, type: 'error', text: response.data.message });
      }
    } catch (err) {
      setVerificationMessage({ id: bountyId, type: 'error', text: err.response?.data?.error || "Verification failed." });
    } finally {
      setVerifyingBountyId(null);
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
         <div className="global-stats-section">
          <div className="stat-box">
            <span>Total XP Awarded on Platform</span>
            <CountUp 
              end={totalXp}
              duration={2}
              separator=","
              decimals={0}
            />
          </div>
          <Link to="/xpleaderboard" className="btn-outline">
            View Leaderboard
          </Link>
        </div>

        <div className="rewards-grid">
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
            <button className="btn-primary" onClick={handleClaim} disabled={isClaiming || rewardsData.unclaimedXp <= 0}>
              {isClaiming ? "Claiming..." : "Claim All XP"}
            </button>
            {claimMessage && <p className="claim-message">{claimMessage}</p>}
          </div>

          <div className="profile-card presale-card">
            <h3>Platform Presale</h3>
            <p>Your total XP balance determines your allocation in our upcoming token presale. Secure your spot!</p>
            <Link to="/presale-info" className="btn-secondary">Learn More About the Presale</Link>
          </div>
        </div>
        
        <div className="bounty-board-section">
          <h2>Available Bounties</h2>
          <p>Complete these tasks to earn more XP, which will be added to your 'Unclaimed XP' total above.</p>
          <div className="bounties-list">
            {bounties.length > 0 ? (
              bounties.map(bounty => (
                <div key={bounty.bounty_id} className="bounty-card">
                  <div className="bounty-content">
                    <h4>{bounty.title}</h4>
                    <p>{bounty.description}</p>
                    <a href={bounty.target_url} target="_blank" rel="noopener noreferrer" className="bounty-link">
                      Go to Task →
                    </a>
                  </div>
                  <div className="bounty-actions">
                    <span className="bounty-reward">+{bounty.xp_reward} XP</span>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleVerifyBounty(bounty.bounty_id)}
                      disabled={verifyingBountyId === bounty.bounty_id}
                    >
                      {verifyingBountyId === bounty.bounty_id ? '...' : 'Verify'}
                    </button>
                  </div>
                  {verificationMessage.id === bounty.bounty_id && (
                    <p className={`bounty-message ${verificationMessage.type}`}>{verificationMessage.text}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No new bounties available right now. Check back soon!</p>
            )}
          </div>
        </div>

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
// ==============================================================================
// END OF FILE
// ==============================================================================
