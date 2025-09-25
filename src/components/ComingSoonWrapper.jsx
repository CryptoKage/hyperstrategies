// /src/components/ComingSoonWrapper.jsx

import React from 'react';
import { useFeatureFlags } from '../context/FeatureFlagContext';

const ComingSoonWrapper = ({ flagName, children }) => {
    const flags = useFeatureFlags();
    const isEnabled = flags[flagName] === true;

    // If the feature flag is enabled, just render the content normally.
    if (isEnabled) {
        return children;
    }

    // If the flag is not enabled, wrap the content in our "Coming Soon" UI.
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
