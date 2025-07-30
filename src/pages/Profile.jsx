// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added for linking
import api from '../api/api';
import { useAuth } from '../context/AuthContext'; // Corrected import path
import Layout from '../components/Layout';
import InputField from '../components/InputField';

const Profile = () => {
  const { user, login } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  // 1. The 'bio' state is no longer needed.
  // const [bio, setBio] = useState(''); 
  
  const [editMessage, setEditMessage] = useState('');

  const [customReferralInput, setCustomReferralInput] = useState('');
  const [isUpdatingReferral, setIsUpdatingReferral] = useState(false);
  const [referralUpdateMessage, setReferralUpdateMessage] = useState({ type: '', text: '' });
  const [copySuccessMessage, setCopySuccessMessage] = useState('Copy Referral Link');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        setProfileData(response.data);
        setUsername(response.data.username);
        // We no longer set the bio state
      } catch (err) {
        setError('Could not load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditMessage('');
    try {
      // 1. The 'bio' field is removed from the request payload.
      const response = await api.put('/user/profile', { username });
      setEditMessage(response.data.message);
    } catch (err) {
      setEditMessage(err.response?.data?.error || 'Update failed.');
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
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      setReferralUpdateMessage({ type: 'error', text: message });
    } finally {
      setIsUpdatingReferral(false);
    }
  };

  const referralLink = `https://www.hyper-strategies.com/register?ref=${profileData?.referral_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccessMessage('Copied!');
    setTimeout(() => {
      setCopySuccessMessage('Copy Referral Link');
    }, 2000);
  };

  if (isLoading) return <Layout><div className="profile-container"><h1>Loading Profile...</h1></div></Layout>;
  if (error) return <Layout><div className="profile-container"><p className="error-message">{error}</p></div></Layout>;

  return (
    <Layout>
      <div className="profile-container">
        <h1>Your Profile</h1>
        <div className="profile-grid">
          
          <div className="profile-card">
            <h3>Edit Details</h3>
            <form onSubmit={handleProfileUpdate}>
              <InputField label="Username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              
              {/* 1. The entire div containing the bio textarea has been removed. */}

              <button type="submit" className="btn-primary">Save Changes</button>
              {editMessage && <p className="edit-message">{editMessage}</p>}
            </form>
          </div>

          <div className="profile-card">
            <h3>Stats & Referrals</h3>

            {/* 2. ADDED: A new card to display the user's Account Tier. */}
            <div className="stat-display tier-display">
              <span className="stat-label">Account Tier</span>
              <span className="stat-value-large tier-value">Tier {profileData.account_tier}</span>
            </div>
            
            {/* 3. MODIFIED: The XP display is now a clickable Link. */}
            <Link to="/leaderboard" className="stat-display xp-link">
              <span className="stat-label">Your XP</span>
              <span className="stat-value-large">{profileData.xp} XP</span>
              <span className="link-indicator">→</span>
            </Link>

            <div className="stat-display">
              <span className="stat-label">Your Referral Code</span>
              <span className="referral-code">{profileData.referral_code}</span>
              <button onClick={handleCopyLink} className="btn-secondary">
                {copySuccessMessage}
              </button>
            </div>

            <div className="custom-referral-section">
              <h4>Customize Your Referral Link</h4>
              <p className="form-description">Create a unique code. Must be 3-15 alphanumeric characters.</p>
              <form onSubmit={handleUpdateReferralCode} className="referral-update-form">
                <div className="referral-input-group">
                  <span className="referral-input-prefix">HS-</span>
                  <input
                    type="text"
                    className="referral-update-input"
                    placeholder="your-code"
                    value={customReferralInput}
                    onChange={(e) => setCustomReferralInput(e.target.value)}
                    disabled={isUpdatingReferral}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={isUpdatingReferral || !customReferralInput}>
                  {isUpdatingReferral ? 'Saving...' : 'Save Code'}
                </button>
              </form>
              {referralUpdateMessage.text && (
                <p className={`referral-message ${referralUpdateMessage.type}`}>
                  {referralUpdateMessage.text}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;