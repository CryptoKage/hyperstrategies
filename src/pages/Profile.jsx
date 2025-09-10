// ==============================================================================
// FINAL, FULL VERSION (v3): PASTE THIS to replace your entire Profile.jsx file
// This version preserves all functions and fixes the disabled toggle bug.
// ==============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import XpHistoryList from '../components/XpHistoryList';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PinDetailModal from '../components/PinDetailModal';
import { PinImage } from '../components/UserPins';
import { createPkcePair } from '../utils/pkce';

const Profile = () => {
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePins, setActivePins] = useState([]);
  const [inactivePins, setInactivePins] = useState([]);
  const [isSavingLoadout, setIsSavingLoadout] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [isAutoEquip, setIsAutoEquip] = useState(true);
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
      setIsAutoEquip(data.auto_equip_pins);
      const activeIds = new Set(data.activePinIds);
      setActivePins(data.ownedPins.filter(p => activeIds.has(p.pin_id)));
      setInactivePins(data.ownedPins.filter(p => !activeIds.has(p.pin_id)));
    } catch (err) { setError(t('profile_page.error_load')); } 
    finally { setIsLoading(false); }
  }, [t]);

  useEffect(() => {
    fetchProfile();
    setCopySuccessMessage(t('profile_page.copy_link_button'));
  }, [fetchProfile, t]);

  const handleToggleAutoEquip = async () => {
    const newState = !isAutoEquip;
    setIsAutoEquip(newState);
    try {
      await api.put('/user/pins/auto-equip', { isEnabled: newState });
      if (newState) { fetchProfile(); }
    } catch (error) {
      console.error("Failed to toggle auto-equip", error);
      setIsAutoEquip(!newState);
    }
  };

  const handleEquipPin = (pinToEquip) => {
    if (activePins.length >= profileData.totalPinSlots) {
      alert("All slots are full. Unequip a pin first.");
      return;
    }
    setActivePins([...activePins, pinToEquip]);
    setInactivePins(inactivePins.filter(p => p.pin_id !== pinToEquip.pin_id));
    setSelectedPin(null);
  };

  const handleUnequipPin = (pinToUnequip) => {
    setInactivePins([...inactivePins, pinToUnequip]);
    setActivePins(activePins.filter(p => p.pin_id !== pinToUnequip.pin_id));
    setSelectedPin(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === 'inactive' && destination.droppableId.startsWith('active-slot')) {
      if (activePins.length >= profileData.totalPinSlots) return;
      const itemToMove = inactivePins[source.index];
      const newInactive = Array.from(inactivePins); newInactive.splice(source.index, 1);
      const newActive = Array.from(activePins); newActive.push(itemToMove);
      setActivePins(newActive); setInactivePins(newInactive);
    }
    if (source.droppableId.startsWith('active-slot') && destination.droppableId === 'inactive') {
      const itemToMove = activePins[source.index];
      const newActive = Array.from(activePins); newActive.splice(source.index, 1);
      const newInactive = Array.from(inactivePins); newInactive.push(itemToMove);
      setActivePins(newActive); setInactivePins(newInactive);
    }
  };

  const handleSaveChanges = async () => {
    setIsSavingLoadout(true);
    setEditMessage({ type: '', text: '' });
    try {
      const activePinIds = activePins.map(p => p.pin_id);
      await api.post('/user/active-pins', { activePinIds });
      setEditMessage({ type: 'success', text: 'Pin loadout saved successfully!' });
    } catch (error) {
      setEditMessage({ type: 'error', text: 'Failed to save loadout. Please try again.' });
      console.error("Failed to save pin loadout", error);
    } finally {
      setIsSavingLoadout(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });
    try {
      await api.put('/user/profile', { username });
      setEditMessage({ type: 'success', text: t('profile_page.success_update') });
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('profile_page.error_update');
      setEditMessage({ type: 'error', text: errorMessage });
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
      // 1. Generate the verifier and challenge
      const { verifier, challenge } = await createPkcePair();

      // 2. IMPORTANT: Save the verifier to the backend session
      // This is a new, simple endpoint we will need to add.
      await api.post('/user/session-store', { key: 'x_code_verifier', value: verifier });

      // 3. Construct the authorization URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.REACT_APP_X_CLIENT_ID, // Your X Client ID from .env
        redirect_uri: process.env.REACT_APP_X_CALLBACK_URL, // Your callback URL from .env
        scope: 'tweet.read users.read like.read offline.access',
        state: 'state', // A random string for security
        code_challenge: challenge,
        code_challenge_method: 'S256'
      });
      
      // 4. Redirect the user to X to authorize the app
      window.location.href = `https://twitter.com/i/oauth2/authorize?${params}`;
    } catch (error) {
      console.error("Failed to start X connection flow:", error);
      // You could set an error message state here to show the user
    }
  };

  if (isLoading || !profileData) return <Layout><div className="profile-container"><h1>{t('profile_page.loading')}</h1></div></Layout>;
  if (error) return <Layout><div className="profile-container"><p className="error-message">{error}</p></div></Layout>;

  const dailyXpRate = (profileData?.total_staked_capital || 0) / 300;

  return (
    <Layout>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="profile-container">
          <h1>{t('profile_page.title')}</h1>
          <div className="profile-pin-layout-grid">
            
            <div className="profile-card pin-manager-card">
              <h3>Pin Loadout</h3>
              <div className="auto-equip-toggle-wrapper">
                <span>Auto-Equip Best Pins</span>
                <label className="switch">
                  <input type="checkbox" checked={isAutoEquip} onChange={handleToggleAutoEquip} />
                  <span className="slider round"></span>
                </label>
              </div>
              
              <div className={`loadout-content-wrapper ${isAutoEquip ? 'disabled' : ''}`}>
                <p>Equip pins to activate their bonuses. Slots are unlocked by your Account Tier.</p>
                <h4>Active Slots ({activePins.length} / {profileData.totalPinSlots})</h4>
                <div className="active-slots-container">
                  {Array.from({ length: profileData.totalPinSlots }).map((_, index) => {
                    const pinInSlot = activePins[index];
                    return (
                      <Droppable key={`slot-${index}`} droppableId={`active-slot-${index}`} isDropDisabled={isAutoEquip}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className={`pin-slot ${snapshot.isDraggingOver ? 'over' : ''}`} onClick={() => !isAutoEquip && pinInSlot && setSelectedPin(pinInSlot)}>
                            {pinInSlot ? (<Draggable draggableId={pinInSlot.pin_id.toString()} index={index} isDragDisabled={isAutoEquip}>{(p) => (<div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}><PinImage pinName={pinInSlot.pin_name} imageFilename={pinInSlot.image_filename} /></div>)}</Draggable>) : (<span className="empty-slot-text">Empty Slot</span>)}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                  {profileData.account_tier < 10 && (<div className="pin-slot locked" title={`Unlocks at Tier ${profileData.account_tier + 1}`}><span>Locked</span></div>)}
                </div>
                <button className="btn-primary" onClick={handleSaveChanges} disabled={isSavingLoadout || isAutoEquip}>
                  {isSavingLoadout ? 'Saving...' : 'Save Loadout'}
                </button>
              </div>
            </div>
            
            <div className={`profile-card pin-collection-card ${isAutoEquip ? 'disabled' : ''}`}>
              <div className="profile-card">
  <h3>Connect Accounts & Wallets</h3>
  <p className="form-description">
    Link your social and Web3 accounts to unlock exclusive bounties and rewards.
  </p>
  <div className="connection-buttons-container">
<button className="btn-secondary connection-button" onClick={handleConnectX}>
  <span>Connect X (Twitter)</span>
</button>
    <button className="btn-secondary connection-button" disabled>
      {/* We can add an icon here later */}
      <span>Connect Telegram</span>
    </button>
    <button className="btn-secondary connection-button" disabled>
      {/* We can add an icon here later */}
      <span>Connect EVM Wallet</span>
    </button>
  </div>
</div>
              <h3>Your Pin Collection ({inactivePins.length})</h3>
              <Droppable droppableId="inactive" direction="horizontal" isDropDisabled={isAutoEquip}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="inactive-pins-container">
                    {inactivePins.map((pin, index) => (
                      <Draggable key={pin.pin_id} draggableId={pin.pin_id.toString()} index={index} isDragDisabled={isAutoEquip}>
                        {(p) => (<div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} onClick={() => !isAutoEquip && setSelectedPin(pin)}><PinImage pinName={pin.pin_name} imageFilename={pin.image_filename} /></div>)}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {inactivePins.length === 0 && <p>You have no inactive pins.</p>}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="profile-card">
              <h3>{t('profile_page.stats_referrals_title')}</h3>
              <div className="stat-display tier-display"><span className="stat-label">{t('profile_page.account_tier_label')}</span><span className="stat-value-large tier-value">{t('profile_page.tier_prefix', { tier: profileData.account_tier })}</span></div>
              {profileData.account_tier >= 2 && (<Link to="/pins-marketplace" className="btn-primary marketplace-button">{t('profile_page.pins_marketplace_button')}</Link>)}
              <Link to="/xpleaderboard" className="stat-display xp-link"><span className="stat-label">{t('profile_page.xp_label')}</span><span className="stat-value-large">{(parseFloat(profileData.xp) || 0).toFixed(2)} XP</span><span className="link-indicator">→</span></Link>
              <Link to="/rewards" className="btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
  Claim XP / View Bounties
</Link>
              <div className="stat-display"><span className="stat-label">{t('profile_page.xp_rate_label')}</span><span className="stat-value-large xp-rate-value">+{dailyXpRate.toFixed(2)}<span className="xp-rate-per-day"> / {t('profile_page.xp_rate_per_day')}</span></span></div>
              <div className="stat-display"><span className="stat-label">{t('profile_page.referral_code_label')}</span><span className="referral-code">{profileData.referral_code}</span><button onClick={handleCopyLink} className="btn-secondary">{copySuccessMessage}</button></div>
              <div className="custom-referral-section">
                <h4>{t('profile_page.customize_link_title')}</h4>
                <p className="form-description">{t('profile_page.customize_link_subtitle')}</p>
                <form onSubmit={handleUpdateReferralCode} className="referral-update-form">
                  <div className="referral-input-group"><span className="referral-input-prefix">HS-</span><input type="text" className="referral-update-input" placeholder={t('profile_page.placeholder_your_code')} value={customReferralInput} onChange={(e) => setCustomReferralInput(e.target.value)} disabled={isUpdatingReferral}/></div>
                  <button type="submit" className="btn-primary" disabled={isUpdatingReferral || !customReferralInput}>{isUpdatingReferral ? t('profile_page.saving_button') : t('profile_page.save_code_button')}</button>
                </form>
                {referralUpdateMessage.text && (<p className={`referral-message ${referralUpdateMessage.type}`}>{referralUpdateMessage.text}</p>)}
              </div>
            </div>
            
            <div className="profile-card"><XpHistoryList /></div>

          </div>
        </div>
      </DragDropContext>
      <PinDetailModal 
        isOpen={!!selectedPin}
        onClose={() => setSelectedPin(null)}
        pin={selectedPin}
        isActive={activePins.some(p => p.pin_id === selectedPin?.pin_id)}
        onEquip={handleEquipPin}
        onUnequip={handleUnequipPin}
      />
    </Layout>
  );
};

export default Profile;
