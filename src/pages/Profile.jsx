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
      
      // ✅ This is where we would ideally get a new token with the updated name
      // and call auth.login(newToken) to update the global state instantly.
      // For now, a page refresh will show the new name in the header.
      
    } catch (err) {
      setEditMessage(err.response?.data?.error || 'Update failed.');
    }
  };

  const referralLink = `https://www.hyper-strategies.com/register?ref=${profileData?.referral_code}`;

  if (isLoading) return <Layout><div className="profile-container"><h1>Loading Profile...</h1></div></Layout>;
  if (error) return <Layout><div className="profile-container"><p className="error-message">{error}</p></div></Layout>;

  return (
    <Layout>
      <div className="profile-container">
        <h1>Your Profile</h1>
        <div className="profile-grid">
          
          {/* Left Side: Edit Form */}
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
              <button onClick={() => navigator.clipboard.writeText(referralLink)} className="btn-secondary">
                Copy Referral Link
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;