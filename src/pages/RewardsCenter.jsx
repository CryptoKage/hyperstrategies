// FILE: src/pages/RewardsCenter.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import CountUp from 'react-countup';

const RewardsCenter = () => {
  const { t } = useTranslation();

  const [rewardsData, setRewardsData] = useState({ unclaimedXp: 0, claimedHistory: [], totalXp: 0 });
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [platformTotalXp, setPlatformTotalXp] = useState(0);
  const [verifyingBountyId, setVerifyingBountyId] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState({ id: null, type: '', text: '' });

  const renderDescription = (description) => {
    try {
      const payload = JSON.parse(description);
      if (payload && payload.key) {
        return t(payload.key, payload.vars || {});
      }
      return description;
    } catch (e) {
      return description;
    }
  };

  const fetchData = useCallback(async () => {
    try {
      if (loading) setLoading(true);

      const [rewardsRes, bountiesRes, statsRes] = await Promise.all([
        api.get('/user/rewards'),
        api.get('/bounties'),
        api.get('/stats/total-xp-awarded') 
      ]);
      setPlatformTotalXp(statsRes.data.totalXpAwarded);
      setRewardsData(rewardsRes.data);
      setBounties(bountiesRes.data);
    } catch (err) {
      setError(t('rewards_center.error_loading'));
    } finally {
      setLoading(false);
    }
  }, [t, loading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleVerifyBounty = async (bountyId) => {
    setVerifyingBountyId(bountyId);
    setVerificationMessage({ id: bountyId, text: t('rewards_center.bounty_verifying_button') });
    try {
      const response = await api.post(`/bounties/${bountyId}/verify`);
      setVerificationMessage({ 
        id: bountyId, 
        type: response.data.success ? 'success' : 'error', 
        text: t(response.data.messageKey) 
      });
      if (response.data.success) {
        setTimeout(() => {
            fetchData();
            setVerificationMessage({ id: null, type: '', text: '' });
        }, 2000);
      }
    } catch (err) {
      const key = err.response?.data?.messageKey || 'rewards_center.bounty_failed';
      setVerificationMessage({ id: bountyId, type: 'error', text: t(key) });
    } finally {
      setVerifyingBountyId(null);
    }
  };

  if (loading) {
      return <Layout><div className="rewards-container"><h1>{t('rewards_center.loading')}</h1></div></Layout>;
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
            <CountUp end={platformTotalXp} duration={2} separator="," decimals={0} />
          </div>
          <Link to="/xpleaderboard" className="btn-outline">{t('rewards_center.leaderboard_button')}</Link>
        </div>

        <div className="rewards-grid">
          <div className="profile-card rewards-card">
            <h3>{t('profile_page.xp_label')}</h3>
            <div className="xp-counter">
              <CountUp 
                start={0} 
                end={rewardsData.totalXp} 
                duration={2.5} 
                decimals={4} 
                suffix=" XP" 
              />
            </div>
            {/* --- FIX: Use new translation key --- */}
            <p>{t('rewards_center.total_xp_description')}</p>
            <button className="btn-primary" disabled={true} title="Coming Soon">
              {/* --- FIX: Use new translation key --- */}
              {t('rewards_center.convert_button_text')}
            </button>
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
                    {bounty.target_url && (
                      // --- FIX: Use new translation key and remove arrow ---
                      <a href={bounty.target_url} target="_blank" rel="noopener noreferrer" className="bounty-link">{t('rewards_center.bounty_task_link')}</a>
                    )}
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
