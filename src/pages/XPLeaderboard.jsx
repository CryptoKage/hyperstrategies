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
  const [copySuccess, setCopySuccess] = useState('');

  // Set initial button text from translation file
  useEffect(() => {
    setCopySuccess(t('xp_leaderboard.copy_button'));
  }, [t]);

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

  const handleCopyClick = () => {
    // Note: For simplicity, this shareable text block remains in English.
    // It can be internationalized later if needed by building it from translated parts.
    const xpInfoText = `
🚀 How to Earn XP on HyperStrategies 🚀

- Early Adopter Bonus: Get up to 25 XP for being one of the first 1000 users to allocate funds!
- Successful Referral: Earn 50 XP when a friend you refer makes their first vault allocation.
- Capital Allocation: Earn 1 XP for every $100 you allocate to a vault.

Join with my referral link and get a head start! 👇
[Your Referral Link Here]
  `;

    const shareableText = user 
      ? xpInfoText.replace('[Your Referral Link Here]', `https://www.hyper-strategies.com/register?ref=${user.referral_code}`)
      : xpInfoText.replace('[Your Referral Link Here]', 'https://www.hyper-strategies.com');
      
    navigator.clipboard.writeText(shareableText.trim());
    
    setCopySuccess(t('xp_leaderboard.copied_button'));
    setTimeout(() => setCopySuccess(t('xp_leaderboard.copy_button')), 2000);
  };

  const formatAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Anonymous';

  return (
    <>
      <Layout>
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h1>{t('xp_leaderboard.title')}</h1>
            <p>{t('xp_leaderboard.subtitle')}</p>
          </div>
          
          <div className="how-to-earn-section">
            <button className="btn-outline" onClick={() => setIsXPModalOpen(true)}>
              {t('xp_leaderboard.how_to_earn_button')}
            </button>
          </div>
          
          {user && myRank && (
            <div className="my-rank-card">
              <h3>{t('xp_leaderboard.my_rank_title')}</h3>
              <div className="my-rank-stats">
                <div className="my-rank-stat">
                  <span>{t('xp_leaderboard.rank')}</span>
                  <span>#{myRank.rank}</span>
                </div>
                <div className="my-rank-stat">
                  <span>{t('xp_leaderboard.total_xp')}</span>
                  <span>{parseInt(myRank.xp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="leaderboard-table-section">
            <h3>{t('xp_leaderboard.top_users_title')}</h3>
            {loading ? (
              <p>{t('xp_leaderboard.loading')}</p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>{t('xp_leaderboard.rank')}</th>
                    <th>{t('xp_leaderboard.table_user')}</th>
                    <th>XP</th>
                  </tr>
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
        title={t('xp_leaderboard.modal_title')}
      >
        <Accordion>
          <AccordionItem title={t('xp_leaderboard.accordion_title_signup')}>
            <p>{t('xp_leaderboard.accordion_desc_signup')}</p>
            <ul className="reward-list">
              <li dangerouslySetInnerHTML={{ __html: t('xp_leaderboard.signup_tier_1') }} />
              <li dangerouslySetInnerHTML={{ __html: t('xp_leaderboard.signup_tier_2') }} />
              <li dangerouslySetInnerHTML={{ __html: t('xp_leaderboard.signup_tier_3') }} />
              <li dangerouslySetInnerHTML={{ __html: t('xp_leaderboard.signup_tier_4') }} />
              <li dangerouslySetInnerHTML={{ __html: t('xp_leaderboard.signup_tier_5') }} />
            </ul>
          </AccordionItem>
          
          <AccordionItem title={t('xp_leaderboard.accordion_title_allocation')}>
            <p>{t('xp_leaderboard.accordion_desc_allocation')}</p>
          </AccordionItem>
          
          <AccordionItem title={t('xp_leaderboard.accordion_title_referral')}>
            <p>{t('xp_leaderboard.accordion_desc_referral')}</p>
          </AccordionItem>

          <AccordionItem title={t('xp_leaderboard.accordion_title_staking')}>
            <p>{t('xp_leaderboard.accordion_desc_staking')}</p>
          </AccordionItem>
          
          <AccordionItem title={t('xp_leaderboard.accordion_title_buyback')}>
            <p>{t('xp_leaderboard.accordion_desc_buyback')}</p>
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