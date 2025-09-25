// /src/components/ComingSoonWrapper.jsx

import React from 'react';
import { useFeatureFlagsContext } from '../context/FeatureFlagContext'; // Use the new context hook

const ComingSoonWrapper = ({ flagName, children }) => {
    // --- THE FIX: Get both flags and the loading state ---
    const { flags, isLoading } = useFeatureFlagsContext();

    // If the flags are still loading from the API, don't render anything yet.
    // This prevents the component from making a decision based on stale data.
    if (isLoading) {
        return null; // Or a loading spinner, but null is safest
    }

    const isEnabled = flags && flags[flagName] === true;

    if (isEnabled) {
        return children;
    }

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
