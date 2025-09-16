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
  
  // --- NEW: State to track which link is being copied ---
  const [copiedLink, setCopiedLink] = useState(null);

  const fetchData = useCallback(async () => {
    // --- BUG FIX: Removed 'user' from the dependency array to prevent a potential loop ---
    setLoading(true);
    try {
      // We can safely read 'user' from the outer scope here without listing it as a dependency.
      const [leaderboardRes, myRankRes] = await Promise.all([
        api.get('/user/leaderboard'),
        user ? api.get('/user/my-rank') : Promise.resolve(null)
      ]);
      
      setLeaderboard(leaderboardRes.data);
      if (myRankRes) setMyRank(myRankRes.data);

    } catch (err) {
      console.error("Could not load leaderboard data.", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // --- NEW: Function to handle copying a specific referral link ---
  const handleCopyLink = (referralCode) => {
    const link = `https://www.hyper-strategies.com/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(referralCode);
    setTimeout(() => setCopiedLink(null), 2000); // Reset after 2 seconds
  };
  
  const formatReferralCode = (code) => {
    return code ? code.replace('HS-', '') : 'Anonymous';
  };

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
                    <th style={{ textAlign: 'right' }}>{t('xp_leaderboard.referral_link')}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => {
                    const isCurrentUser = user && user.referral_code === player.referral_code;
                    return (
                      <tr key={player.referral_code || index} className={isCurrentUser ? 'current-user-row' : ''}>
                        <td>{index + 1}</td>
                        {/* --- THE FIX: Display formatted referral code --- */}
                        <td>{formatReferralCode(player.referral_code)}</td>
                        <td>{parseInt(player.xp).toLocaleString()}</td>
                        {/* --- THE FIX: Add a Copy Link button to each row --- */}
                        <td style={{ textAlign: 'right' }}>
                           <button 
                             onClick={() => handleCopyLink(player.referral_code)}
                             className="btn-secondary btn-sm"
                           >
                             {copiedLink === player.referral_code ? t('xp_leaderboard.copied_button') : t('xp_leaderboard.copy_button')}
                           </button>
                        </td>
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
      </InfoModal>
    </>
  );
};

export default XPLeaderboard;
