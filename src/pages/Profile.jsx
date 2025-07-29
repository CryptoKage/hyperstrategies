// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import InputField from '../components/InputField';

const Profile = () => {
  const { user, login } = useAuth(); // Get the main 'login' function to update the token
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the editable form fields
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  const [editMessage, setEditMessage] = useState('');

  // --- NEW --- State variables for the referral code form
  const [customReferralInput, setCustomReferralInput] = useState('');
  const [isUpdatingReferral, setIsUpdatingReferral] = useState(false);
  const [referralUpdateMessage, setReferralUpdateMessage] = useState({ type: '', text: '' });
  const [copySuccessMessage, setCopySuccessMessage] = useState('Copy Referral Link');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        setProfileData(response.data);
        // Pre-fill the form with the user's current data
        setUsername(response.data.username);
        setBio(response.data.bio || '');
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
      const response = await api.put('/user/profile', { username, bio });
      setEditMessage(response.data.message);
    } catch (err) {
      setEditMessage(err.response?.data?.error || 'Update failed.');
    }
  };

  // --- NEW --- Handler for updating the referral code
  const handleUpdateReferralCode = async (e) => {
    e.preventDefault();
    setIsUpdatingReferral(true);
    setReferralUpdateMessage({ type: '', text: '' });

    try {
      const response = await api.put('/user/referral-code', {
        desiredCode: customReferralInput,
      });

      setReferralUpdateMessage({ type: 'success', text: response.data.message });
      
      // --- NEW --- Update the profile data in our local state to reflect the change instantly
      setProfileData(prevData => ({
        ...prevData,
        referral_code: response.data.referralCode
      }));
      setCustomReferralInput(''); // Clear the input field on success

    } catch (error) {
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      setReferralUpdateMessage({ type: 'error', text: message });
    } finally {
      setIsUpdatingReferral(false);
    }
  };

  const referralLink = `https://www.hyper-strategies.com/register?ref=${profileData?.referral_code}`;

  // --- NEW --- A more robust copy handler with user feedback
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccessMessage('Copied!');
    setTimeout(() => {
      setCopySuccessMessage('Copy Referral Link');
    }, 2000); // Reset after 2 seconds
  };

  if (isLoading) return <Layout><div className="profile-container"><h1>Loading Profile...</h1></div></Layout>;
  if (error) return <Layout><div className="profile-container"><p className="error-message">{error}</p></div></Layout>;

  return (
    <Layout>
      <div className="profile-container">
        <h1>Your Profile</h1>
        <div className="profile-grid">
          
          {/* Left Side: Edit Form and New Referral Form */}
          <div className="profile-card">
            <h3>Edit Details</h3>
            <form onSubmit={handleProfileUpdate}>
              <InputField label="Username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              
              <div className="input-group">
                <label htmlFor="bio" className="input-label">Bio</label>
                <textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="input-field"
                  rows="3"
                  placeholder="Tell us a bit about your trading style..."
                />
              </div>

              <button type="submit" className="btn-primary">Save Changes</button>
              {editMessage && <p className="edit-message">{editMessage}</p>}
            </form>
          </div>

          {/* Right Side: XP and Referrals */}
          <div className="profile-card">
            <h3>Stats & Referrals</h3>
            <div className="stat-display">
              <span className="stat-label">Your XP</span>
              <span className="stat-value-large">{profileData.xp} XP</span>
            </div>
            <div className="stat-display">
              <span className="stat-label">Your Referral Code</span>
              <span className="referral-code">{profileData.referral_code}</span>
              <button onClick={handleCopyLink} className="btn-secondary">
                {copySuccessMessage}
              </button>
            </div>

            {/* --- NEW --- Custom Referral Code Form added here */}
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