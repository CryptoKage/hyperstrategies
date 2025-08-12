// ===================================================================================
// FINAL MERGED VERSION - PASTE THIS OVER THE ENTIRE Profile.jsx
// This version integrates UserPins and the conditional marketplace link.
// ===================================================================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import XpHistoryList from '../components/XpHistoryList';
import UserPins from '../../components/UserPins'; // --- CHANGE 1: Import UserPins instead of UserBadges

const Profile = () => {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [editMessage, setEditMessage] = useState('');

  const [customReferralInput, setCustomReferralInput] = useState('');
  const [isUpdatingReferral, setIsUpdatingReferral] = useState(false);
  const [referralUpdateMessage, setReferralUpdateMessage] = useState({ type: '', text: '' });
  const [copySuccessMessage, setCopySuccessMessage] = useState('');

  useEffect(() => {
    setCopySuccessMessage(t('profile_page.copy_link_button'));
  }, [t]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        setProfileData(response.data);
        setUsername(response.data.username);
      } catch (err) {
        setError(t('profile_page.error_load'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [t]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditMessage('');
    try {
      const response = await api.put('/user/profile', { username });
      setEditMessage(response.data.message);
    } catch (err) {
      setEditMessage(err.response?.data?.error || t('profile_page.error_update'));
    }
  };

  const handleUpdateReferralCode = async (e) => {
    e.preventDefault();
    setIsUpdatingReferral(true);
    setReferralUpdateMessage({ type: '', text: '' });
    try {
      const response = await api.put('/user/referral-code', { desiredCode: customReferralInput });
      setReferralUpdateMessage({ type: 'success', text: response.data.message });
      setProfileData(prevData => ({ ...prevData, referral_code: response.data.referralCode }));
      setCustomReferralInput('');
    } catch (error) {
      const message = error.response?.data?.message || t('profile_page.error_unexpected');
      setReferralUpdateMessage({ type: 'error', text: message });
    } finally {
      setIsUpdatingReferral(false);
    }
  };

  const referralLink = `https://www.hyper-strategies.com/register?ref=${profileData?.referral_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccessMessage(t('profile_page.copied_button'));
    setTimeout(() => {
      setCopySuccessMessage(t('profile_page.copy_link_button'));
    }, 2000);
  };

  if (isLoading) return <Layout><div className="profile-container"><h1>{t('profile_page.loading')}</h1></div></Layout>;
  if (error) return <Layout><div className="profile-container"><p className="error-message">{error}</p></div></Layout>;

  const dailyXpRate = (profileData?.total_staked_capital || 0) / 300;

  return (
    <Layout>
      <div className="profile-container">
        <h1>{t('profile_page.title')}</h1>
        <div className="profile-grid">
          
          <div className="profile-card">
            <h3>{t('profile_page.edit_details_title')}</h3>
            <form onSubmit={handleProfileUpdate}>
              <InputField label={t('profile_page.username_label')} id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <button type="submit" className="btn-primary">{t('profile_page.save_changes_button')}</button>
              {editMessage && <p className="edit-message">{editMessage}</p>}
            </form>
            {/* --- CHANGE 2: Use the new UserPins component and pass it the correct prop --- */}
            <UserPins userPinNames={profileData?.pins} /> 
          </div>

          <div className="profile-card">
            <h3>{t('profile_page.stats_referrals_title')}</h3>
            <div className="stat-display tier-display">
              <span className="stat-label">{t('profile_page.account_tier_label')}</span>
              <span className="stat-value-large tier-value">{t('profile_page.tier_prefix', { tier: profileData.account_tier })}</span>
            </div>

            {/* --- CHANGE 3: Conditional Marketplace Link --- */}
            {/* This block will only render if the user's tier is 2 or higher */}
            {profileData.account_tier >= 2 && (
                <Link to="/pins-marketplace" className="btn-primary marketplace-button">
                    {t('profile_page.pins_marketplace_button')}
                </Link>
            )}

            <Link to="/xpleaderboard" className="stat-display xp-link">
              <span className="stat-label">{t('profile_page.xp_label')}</span>
              <span className="stat-value-large">
                {(parseFloat(profileData.xp) || 0).toFixed(2)} XP
              </span>
              <span className="link-indicator">→</span>
            </Link>
            <div className="stat-display">
              <span className="stat-label">{t('profile_page.xp_rate_label')}</span>
              <span className="stat-value-large xp-rate-value">
                +{dailyXpRate.toFixed(2)}
                <span className="xp-rate-per-day"> / {t('profile_page.xp_rate_per_day')}</span>
              </span>
            </div>
            <div className="stat-display">
              <span className="stat-label">{t('profile_page.referral_code_label')}</span>
              <span className="referral-code">{profileData.referral_code}</span>
              <button onClick={handleCopyLink} className="btn-secondary">
                {copySuccessMessage}
              </button>
            </div>
            <div className="custom-referral-section">
              <h4>{t('profile_page.customize_link_title')}</h4>
              <p className="form-description">{t('profile_page.customize_link_subtitle')}</p>
              <form onSubmit={handleUpdateReferralCode} className="referral-update-form">
                <div className="referral-input-group">
                  <span className="referral-input-prefix">HS-</span>
                  <input
                    type="text"
                    className="referral-update-input"
                    placeholder={t('profile_page.placeholder_your_code')}
                    value={customReferralInput}
                    onChange={(e) => setCustomReferralInput(e.target.value)}
                    disabled={isUpdatingReferral}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isUpdatingReferral || !customReferralInput}>
                  {isUpdatingReferral ? t('profile_page.saving_button') : t('profile_page.save_code_button')}
                </button>
              </form>
              {referralUpdateMessage.text && (
                <p className={`referral-message ${referralUpdateMessage.type}`}>{referralUpdateMessage.text}</p>
              )}
            </div>
          </div>
          
          <div className="profile-card">
            <XpHistoryList />
          </div>

          <div className="profile-card">
            <h3>{t('profile_page.syndicate_title')}</h3>
            <p className="form-description">
              {t('profile_page.syndicate_description')}
            </p>
            <a 
              href="https://hyper-strategies.gitbook.io/hyper-strategies-docs/user-guide/user-guide-getting-started/syndicate"
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary"
            >
              {t('profile_page.learn_more_button')}
            </a>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;
