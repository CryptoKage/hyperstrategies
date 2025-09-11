// ==============================================================================
// START: REPLACE the entire contents of TierProgressBar.jsx
// ==============================================================================
import React from 'react';
import { useAuth } from '../context/AuthContext';
import useWindowSize from '../hooks/useWindowSize'; // We will create this simple hook

const TierProgressBar = () => {
  const { user } = useAuth();
  const { width } = useWindowSize();
  const isMobile = width < 900; // Use the same breakpoint as your header CSS

  if (!user) return null;

  const { account_tier, xp, currentTierXp, nextTierXp } = user;
  
  // Calculate progress percentage, handling the max tier case
  const progress = (nextTierXp > currentTierXp)
    ? ((xp - currentTierXp) / (nextTierXp - currentTierXp)) * 100
    : 100;

  const xpTooltip = `${xp.toFixed(0)} / ${nextTierXp.toLocaleString()} XP`;

  // Render the mobile "gem" version
  if (isMobile) {
    return (
      <div className="tier-gem" onClick={() => alert(xpTooltip)}>
        <div className="tier-gem-icon">T{account_tier}</div>
      </div>
    );
  }

  // Render the desktop full-bar version
  return (
    <div className="xp-bar-container">
      <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
      <div className="xp-bar-tooltip">{xpTooltip}</div>
    </div>
  );
};

export default TierProgressBar;
// ==============================================================================
// END OF REPLACEMENT
// ==============================================================================
