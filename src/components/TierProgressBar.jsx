// ==============================================================================
// START: REPLACE the entire contents of TierProgressBar.jsx
// ==============================================================================
import React from 'react';
import { useAuth } from '../context/AuthContext';
import useWindowSize from '../hooks/useWindowSize';

const TierProgressBar = () => {
  const { user } = useAuth();
  const { width } = useWindowSize();
  
  // --- THIS IS THE FIX ---
  // If the user object hasn't loaded yet, or if a required value is missing,
  // we render nothing. This prevents the crash.
  if (!user || typeof user.xp !== 'number' || typeof user.nextTierXp !== 'number') {
    return null; 
  }

  const { account_tier, xp, currentTierXp, nextTierXp } = user;
  const isMobile = width < 900;
  
  const progress = (nextTierXp > currentTierXp)
    ? ((xp - currentTierXp) / (nextTierXp - currentTierXp)) * 100
    : 100;

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
// ==============================================================================
// END OF REPLACEMENT
// ==============================================================================
