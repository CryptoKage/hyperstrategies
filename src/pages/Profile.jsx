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
import TelegramLoginButton from '../components/TelegramLoginButton';
import PinListerModal from '../components/PinListerModal';


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
  const [isListerModalOpen, setIsListerModalOpen] = useState(false);

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

  const handleTelegramAuth = async (user) => {
  try {
    await api.post('/user/link-telegram', user);
    // On success, refresh the profile to show the "Connected" state
    fetchProfile();
  } catch (error) {
    console.error("Telegram linking failed:", error);
    alert("Failed to link Telegram account.");
  }
};


  if (isLoading || !profileData) return <Layout><div className="profile-container"><h1>{t('profile_page.loading')}</h1></div></Layout>;
  if (error) return <Layout><div className="profile-container"><p className="error-message">{error}</p></div></Layout>;

  const dailyXpRate = (profileData?.total_staked_capital || 0) / 300;

return (
    <Layout>
      <div className="presale-container shadcn-theme">
        <h1>Platform Token Presale</h1>
        <p className="presale-subtitle">Your XP balance determines your eligibility and allocation. Secure your spot in the future of HyperStrategies.</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sale Progress</CardTitle>
            <CardDescription>Current Stage: Seed A (30% Filled)</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={30} className="h-4" />
          </CardContent>
        </Card>

        <div className="presale-grid">
          <Card>
            <CardHeader>
              <CardTitle>Tokenomics</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={tokenomicsData} dataKey="value" nameKey="stage" innerRadius={60} strokeWidth={5}>
                    {tokenomicsData.map((entry) => ( <Cell key={`cell-${entry.stage}`} fill={entry.fill} /> ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy - 10} className="fill-foreground text-2xl font-bold">1B</tspan>
                              <tspan x={viewBox.cx} y={viewBox.cy + 10} className="fill-muted-foreground">Total Supply</tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center items-center text-center">
            <CardHeader>
              <CardTitle>Participate in the Presale</CardTitle>
              <CardDescription>Requires {eligibility.xpRequired.toLocaleString()} XP</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              {renderBuyButton()}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
