// /src/components/ComingSoonWrapper.jsx
import React from 'react';
import { useFeatureFlagsContext } from '../context/FeatureFlagContext';

const ComingSoonWrapper = ({ flagName, children }) => {
    const { flags, isLoading } = useFeatureFlagsContext();
    if (isLoading) { return null; }
    const isEnabled = flags && flags[flagName] === true;
    if (isEnabled) { return children; }
    return (
        <div className="coming-soon-wrapper">
            <div className="coming-soon-content">{children}</div>
            <div className="coming-soon-overlay"><span>COMING SOON</span></div>
        </div>
    );
};
export default ComingSoonWrapper;
