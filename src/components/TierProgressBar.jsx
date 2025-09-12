// ==============================================================================
// START: REPLACE the entire contents of TierProgressBar.jsx
// ==============================================================================
import React from 'react';
import { useAuth } from '../context/AuthContext';
import useWindowSize from '../hooks/useWindowSize';

const TierProgressBar = () => {
  const { user } = useAuth();
  const { width } = useWindowSize();

    if (!user) {
    return null;
   
  }

   const {
    account_tier,
    xp = 0,
    currentTierXp = 0,
    nextTierXp = 0,
  } = user;

  const isMobile = width < 900;
  
  const progress = (nextTierXp > currentTierXp)
    ? ((xp - currentTierXp) / (nextTierXp - currentTierXp)) * 100
    : 10;

  const xpTooltip = `${xp.toFixed(0)} / ${nextTierXp.toLocaleString()} XP`;

  if (isMobile) {
    return (
      <div className="tier-gem" onClick={() => alert(xpTooltip)}>
        <div className="tier-gem-icon">T{account_tier}</div>
      </div>
    );
  }

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
      <div className="xp-bar-tooltip">{xpTooltip}</div>
    </div>
  );
};

export default TierProgressBar;
