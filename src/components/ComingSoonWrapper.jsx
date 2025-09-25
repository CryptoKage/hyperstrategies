// /src/components/ComingSoonWrapper.jsx

import React from 'react';
import { useFeatureFlags } from '../context/FeatureFlagContext';
// The import for the CSS is correctly removed as it's in global.css

const ComingSoonWrapper = ({ flagName, children }) => {
    const flags = useFeatureFlags();

    // --- THE FINAL FIX: A "Guard Clause" ---
    // This checks if flags exists before trying to access a property on it.
    // If flags is not yet loaded, it will safely default to isEnabled = false.
    const isEnabled = flags && flags[flagName] === true;
    // --- END OF FIX ---

    // If the feature flag is enabled, just render the content normally.
    if (isEnabled) {
        return children;
    }

    // If the flag is not enabled or not yet loaded, show the "Coming Soon" version.
    return (
        <div className="coming-soon-wrapper">
            <div className="coming-soon-content">
                {children}
            </div>
            <div className="coming-soon-overlay">
                <span>COMING SOON</span>
            </div>
        </div>
    );
};

export default ComingSoonWrapper;
