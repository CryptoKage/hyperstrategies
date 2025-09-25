import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import XpHistoryList from '../components/XpHistoryList';
import { createPkcePair } from '../utils/pkce';
import TelegramLoginButton from '../components/TelegramLoginButton';

const Profile = () => {
  const { t } = useTranslation();
  const { refreshToken } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [customReferralInput, setCustomReferralInput] = useState('');
  const [isUpdatingReferral, setIsUpdatingReferral] = useState(false);
  const [referralUpdateMessage, setReferralUpdateMessage] = useState({ type: '', text: '' });
  const [copySuccessMessage, setCopySuccessMessage] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/user/profile');
      const data = response.data;
      setProfileData(data);
      setUsername(data.username);
    } catch (err) {
      console.error('Failed to load profile', err);
      setError(t('profile_page.error_load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await refreshToken();
        await fetchProfile();
      } catch (err) {
        console.error('Failed to refresh token before fetching profile', err);
        setError(t('profile_page.error_load'));
        setIsLoading(false);
      }
    };

    loadProfile();
    setCopySuccessMessage(t('profile_page.copy_link_button'));
  }, [refreshToken, fetchProfile, t]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });

    try {
      const response = await api.put('/user/profile', { username });
      setEditMessage({ type: 'success', text: t(response.data.messageKey) });
      refreshToken();
    } catch (err) {
      const messageKey = err.response?.data?.messageKey || 'profile_page.error_unexpected';
      setEditMessage({ type: 'error', text: t(messageKey) });
    }
  };

  const handleUpdateReferralCode = async (e) => {
    e.preventDefault();
    setIsUpdatingReferral(true);
    setReferralUpdateMessage({ type: '', text: '' });

    try {
      const response = await api.put('/user/referral-code', { desiredCode: customReferralInput });
      setReferralUpdateMessage({ type: 'success', text: t(response.data.messageKey) });
      setProfileData((prev) => ({ ...prev, referral_code: response.data.referralCode }));
      setCustomReferralInput('');
    } catch (err) {
      const messageKey = err.response?.data?.messageKey || 'profile_page.error_unexpected';
      setReferralUpdateMessage({ type: 'error', text: t(messageKey) });
    } finally {
      setIsUpdatingReferral(false);
    }
  };

  const handleCopyLink = () => {
    const referralLink = `https://www.hyper-strategies.com/register?ref=${profileData?.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopySuccessMessage(t('profile_page.copied_button'));
    setTimeout(() => {
      setCopySuccessMessage(t('profile_page.copy_link_button'));
    }, 2000);
  };

  const handleConnectX = async () => {
    try {
      const { verifier, challenge } = await createPkcePair();
      await api.post('/user/session-store', { key: 'x_code_verifier', value: verifier });
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.REACT_APP_X_CLIENT_ID,
        redirect_uri: process.env.REACT_APP_X_CALLBACK_URL,
        scope: 'tweet.read users.read like.read offline.access',
        state: 'state',
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });
      window.location.href = `https://twitter.com/i/oauth2/authorize?${params}`;
    } catch (err) {
      console.error('Failed to start X connection flow:', err);
    }
  };

  const handleTelegramAuth = async (user) => {
    try {
      await api.post('/user/link-telegram', user);
      fetchProfile();
    } catch (err) {
      console.error('Telegram linking failed:', err);
      alert('Failed to link Telegram account.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="profile-container">
          <h1>{t('profile_page.loading')}</h1>
        </div>
      </Layout>
    );
  }

  if (error || !profileData) {
    return (
      <Layout>
        <div className="profile-container">
          <p className="error-message">{error || t('profile_page.error_load')}</p>
        </div>
      </Layout>
    );
  }

  const dailyXpRate = (profileData?.total_staked_capital || 0) / 300;

  return (
    <Layout>
      <div className="profile-container profile-container--modern">
        <header className="profile-page-header">
          <span className="eyebrow-text">{t('profile_page.eyebrow', 'Your journey')}</span>
          <h1>{t('profile_page.modern_title', 'Shape your Hyper Strategies identity')}</h1>
          <p>
            {t(
              'profile_page.modern_subtitle',
              'Complete the steps below to unlock the full ecosystem — from personalised referrals to collectible pins and seasonal rewards.'
            )}
          </p>
        </header>

        <section className="profile-journey" aria-labelledby="profile-journey-title">
          <div className="profile-section-heading">
            <h2 id="profile-journey-title">{t('profile_page.journey_title', 'Your activation journey')}</h2>
            <p>
              {t(
                'profile_page.journey_caption',
                'We curated three simple milestones so you always know the next best action to take.'
              )}
            </p>
          </div>
          <div className="profile-journey__grid">
            <article className="profile-journey__step">
              <span className="profile-journey__badge">1</span>
              <h3>{t('profile_page.journey_step_one', 'Complete your profile')}</h3>
              <p>
                {t(
                  'profile_page.journey_step_one_copy',
                  'Update your username and link messaging accounts so teammates can recognise you instantly.'
                )}
              </p>
              <div className="profile-journey__actions">
                <a href="#profile-settings" className="btn-link">
                  {t('profile_page.journey_step_one_cta', 'Edit details')}
                </a>
              </div>
            </article>
            <article className="profile-journey__step">
              <span className="profile-journey__badge">2</span>
              <h3>{t('profile_page.journey_step_two', 'Curate your pins')}</h3>
              <p>
                {t(
                  'profile_page.journey_step_two_copy',
                  'Move pins into your loadout, list duplicates, and prepare for seasonal challenges from one dedicated hub.'
                )}
              </p>
              <div className="profile-journey__actions">
                <Link to="/pins" className="btn-link">
                  {t('profile_page.journey_step_two_cta', 'Go to pins hub')}
                </Link>
              </div>
            </article>
            <article className="profile-journey__step">
              <span className="profile-journey__badge">3</span>
              <h3>{t('profile_page.journey_step_three', 'Earn & celebrate')}</h3>
              <p>
                {t(
                  'profile_page.journey_step_three_copy',
                  'Track XP momentum, claim seasonal drops, and share your referral link once everything is set.'
                )}
              </p>
              <div className="profile-journey__actions">
                <Link to="/rewards" className="btn-link">
                  {t('profile_page.journey_step_three_cta', 'Open rewards center')}
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="profile-overview-grid" aria-labelledby="profile-overview-title">
          <h2 id="profile-overview-title" className="sr-only">
            {t('profile_page.overview_title', 'Account overview')}
          </h2>
          <article className="profile-card profile-card--spotlight" aria-labelledby="profile-stats-heading">
            <h3 id="profile-stats-heading">{t('profile_page.stats_referrals_title')}</h3>
            <div className="stat-display tier-display">
              <span className="stat-label">{t('profile_page.account_tier_label')}</span>
              <span className="stat-value-large tier-value">
                {t('profile_page.tier_prefix', { tier: profileData.account_tier })}
              </span>
            </div>
            <div className="stat-display">
              <span className="stat-label">{t('profile_page.xp_label')}</span>
              <span className="stat-value-large">{(parseFloat(profileData.xp) || 0).toFixed(2)} XP</span>
            </div>
            <div className="stat-display">
              <span className="stat-label">{t('profile_page.xp_rate_label')}</span>
              <span className="stat-value-large xp-rate-value">
                +{dailyXpRate.toFixed(2)}<span className="xp-rate-per-day"> / {t('profile_page.xp_rate_per_day')}</span>
              </span>
            </div>
            <Link to="/xpleaderboard" className="btn-secondary btn-sm">
              {t('profile_page.view_leaderboard', 'View XP leaderboard')}
            </Link>
            <Link to="/rewards" className="btn-primary">
              {t('profile_page.claim_xp_button')}
            </Link>
          </article>

          <article className="profile-card profile-card--referral" aria-labelledby="profile-referral-heading">
            <h3 id="profile-referral-heading">{t('profile_page.referral_title', 'Referral toolkit')}</h3>
            <p className="form-description">
              {t(
                'profile_page.referral_copy',
                'Share your personalised link and customise your invite code to match your brand.'
              )}
            </p>
            <div className="stat-display">
              <span className="stat-label">{t('profile_page.referral_code_label')}</span>
              <span className="referral-code">{profileData.referral_code}</span>
            </div>
            <button onClick={handleCopyLink} className="btn-secondary">
              {copySuccessMessage}
            </button>
            <form onSubmit={handleUpdateReferralCode} className="referral-update-form">
              <div className="referral-input-group">
                <span className="referral-input-prefix">HS-</span>
                <input
                  type="text"
                  className="referral-update-input"
                  placeholder={t('profile_page.placeholder_your_code')}
                  value={customReferralInput}
                  onChange={(event) => setCustomReferralInput(event.target.value)}
                  disabled={isUpdatingReferral}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUpdatingReferral || !customReferralInput}
              >
                {isUpdatingReferral
                  ? t('profile_page.saving_button')
                  : t('profile_page.save_code_button')}
              </button>
            </form>
            {referralUpdateMessage.text && (
              <p className={`referral-message ${referralUpdateMessage.type}`}>
                {referralUpdateMessage.text}
              </p>
            )}
          </article>

          <article
            className="profile-card profile-card--connections"
            aria-labelledby="profile-connections-heading"
          >
            <h3 id="profile-connections-heading">{t('profile_page.connect_title')}</h3>
            <p className="form-description">
              {t(
                'profile_page.connect_description',
                'Link social accounts so we can deliver alerts, announcements, and bonus missions.'
              )}
            </p>
            <div className="connection-buttons-container">
              <button className="btn-secondary connection-button" onClick={handleConnectX}>
                <span>{t('profile_page.connect_x_button')}</span>
              </button>
              <div className="telegram-button-wrapper">
                <TelegramLoginButton onAuth={handleTelegramAuth} />
              </div>
              <button className="btn-secondary connection-button" disabled>
                <span>{t('profile_page.connect_evm_button')}</span>
              </button>
            </div>
          </article>

          <article
            id="profile-settings"
            className="profile-card profile-card--form"
            aria-labelledby="profile-settings-heading"
          >
            <h3 id="profile-settings-heading">{t('profile_page.edit_details_title')}</h3>
            <p className="form-description">
              {t(
                'profile_page.profile_form_copy',
                'Your username is visible in leaderboards and on the upcoming social layers.'
              )}
            </p>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="username">{t('profile_page.username_label')}</label>
                <input
                  id="username"
                  type="text"
                  className="input-field"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                {t('profile_page.save_changes_button')}
              </button>
              {editMessage.text && (
                <p className={`edit-message ${editMessage.type}`}>{editMessage.text}</p>
              )}
            </form>
          </article>

          <article className="profile-card profile-card--syndicate" aria-labelledby="profile-syndicate-heading">
            <h3 id="profile-syndicate-heading">{t('profile_page.syndicate_title')}</h3>
            <p className="form-description">{t('profile_page.syndicate_description')}</p>
            <a
              href="https://hyper-strategies.gitbook.io/hyper-strategies-docs/user-guide/user-guide-getting-started/syndicate"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('profile_page.learn_more_button')}
            </a>
          </article>

          <article className="profile-card profile-card--history" aria-label={t('profile_page.history_heading', 'Recent XP activity')}>
            <XpHistoryList />
          </article>
        </section>
      </div>
    </Layout>
  );
};

export default Profile;
