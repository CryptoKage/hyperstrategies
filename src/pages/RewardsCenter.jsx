// PASTE THIS ENTIRE CONTENT TO REPLACE: hyperstrategies/src/pages/RewardsCenter.jsx

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

  const renderDescription = (description) => {
    try {
      const payload = JSON.parse(description);
      return t(payload.key, payload.vars);
    } catch (e) {
      return description;
    }
  };

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
      setError(t('rewards_center.error_loading', 'Could not load your rewards data at this time.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaim = async () => {
    setIsClaiming(true);
    setClaimMessage('');
    try {
      await api.post('/user/rewards/claim');
      setClaimMessage(t('rewards_center.claim_success'));
      await fetchData();
    } catch (err) {
      setClaimMessage(t('rewards_center.claim_failed'));
    } finally {
      setIsClaiming(false);
    }
  };
  
  const handleVerifyBounty = async (bountyId) => {
    setVerifyingBountyId(bountyId);
    setVerificationMessage({ id: bountyId, text: t('rewards_center.bounty_verifying_button') });
    try {
      const response = await api.post(`/bounties/${bountyId}/verify`);
      if (response.data.success) {
        setVerificationMessage({ id: bountyId, type: 'success', text: t(response.data.messageKey) });
        fetchData();
      } else {
        setVerificationMessage({ id: bountyId, type: 'error', text: t(response.data.messageKey) });
      }
    } catch (err) {
      const key = err.response?.data?.messageKey || 'rewards_center.bounty_failed';
      setVerificationMessage({ id: bountyId, type: 'error', text: t(key) });
    } finally {
      setVerifyingBountyId(null);
    }
  };

  if (loading) {
      return <Layout><div className="rewards-container"><h1>{t('rewards_center.loading', 'Loading Rewards...')}</h1></div></Layout>;
  }

  if (error) {
      return <Layout><div className="rewards-container"><p className="error-message">{error}</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="rewards-container">
        <h1>{t('rewards_center.title')}</h1>
        <div className="global-stats-section">
          <div className="stat-box">
            <span>{t('rewards_center.total_xp_label')}</span>
            <CountUp end={totalXp} duration={2} separator="," decimals={0} />
          </div>
          <Link to="/xpleaderboard" className="btn-outline">{t('rewards_center.leaderboard_button')}</Link>
        </div>

        <div className="rewards-grid">
          <div className="profile-card rewards-card">
            <h3>{t('rewards_center.unclaimed_xp_title')}</h3>
            <div className="xp-counter">
              <CountUp start={0} end={rewardsData.unclaimedXp} duration={2.5} decimals={4} suffix=" XP" />
            </div>
            <p>{t('rewards_center.unclaimed_xp_description')}</p>
            <button className="btn-primary" onClick={handleClaim} disabled={isClaiming || rewardsData.unclaimedXp <= 0}>
              {isClaiming ? t('rewards_center.claiming_button') : t('rewards_center.claim_button')}
            </button>
            {claimMessage && <p className="claim-message">{claimMessage}</p>}
          </div>

          <div className="profile-card presale-card">
            <h3>{t('rewards_center.presale_title')}</h3>
            <p>{t('rewards_center.presale_description')}</p>
            <div className="card-action-center">
              <Link to="/presale-info" className="btn-secondary">{t('rewards_center.learn_more_button')}</Link>
            </div>
          </div>
        </div>
        
        <div className="bounty-board-section">
          <h2>{t('rewards_center.bounties_title')}</h2>
          <p>{t('rewards_center.bounties_description')}</p>
          <div className="bounties-list">
            {bounties.length > 0 ? (
              bounties.map(bounty => (
                <div key={bounty.bounty_id} className="bounty-card">
                  <div className="bounty-content">
                    <h4>{t(bounty.title_key)}</h4>
                    <p>{t(bounty.description_key)}</p>
                    <a href={bounty.target_url} target="_blank" rel="noopener noreferrer" className="bounty-link">{t('rewards_center.bounty_task_link')}</a>
                  </div>
                  <div className="bounty-actions">
                    <span className="bounty-reward">+{bounty.xp_reward} XP</span>
                    <button className="btn-secondary" onClick={() => handleVerifyBounty(bounty.bounty_id)} disabled={verifyingBountyId === bounty.bounty_id}>
                      {verifyingBountyId === bounty.bounty_id ? t('rewards_center.bounty_verifying_button') : t('rewards_center.bounty_verify_button')}
                    </button>
                  </div>
                  {verificationMessage.id === bounty.bounty_id && <p className={`bounty-message ${verificationMessage.type}`}>{verificationMessage.text}</p>}
                </div>
              ))
            ) : (<p>{t('rewards_center.no_bounties')}</p>)}
          </div>
        </div>

        <div className="xp-history-section">
          <h2>{t('rewards_center.ledger_title')}</h2>
          <p>{t('rewards_center.ledger_description')}</p>
          <div className="xp-history-list-wrapper">
            {rewardsData.claimedHistory.length > 0 ? (
              <ul className="xp-history-list">
                {rewardsData.claimedHistory.map((item) => (
                  <li key={item.activity_id} className="history-item">
                    <div className="history-item-main">
                      <span className="history-description">{renderDescription(item.description)}</span>
                      <span className="history-xp stat-pnl-positive">+{parseFloat(item.amount_primary).toFixed(2)} XP</span>
                    </div>
                    <span className="history-date">{new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </li>
                ))}
              </ul>
            ) : (<p>{t('rewards_center.ledger_empty')}</p>)}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RewardsCenter;
