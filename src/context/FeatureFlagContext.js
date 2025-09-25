// /src/context/FeatureFlagContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/api';

const FeatureFlagContext = createContext({
    flags: {},
    isLoading: true, // Default to loading
});

export const FeatureFlagProvider = ({ children }) => {
    const [flags, setFlags] =
    useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/system/feature-flags')
            .then(response => {
                setFlags(response.data);
            })
            .catch(err => {
                console.error("CRITICAL: Could not load feature flags.", err);
                setFlags({});
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const value = useMemo(() => ({ flags, isLoading }), [flags, isLoading]);

    return (
        <FeatureFlagContext.Provider value={value}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlagsContext = () => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlagsContext must be used within a FeatureFlagProvider');
    }
    return context;
};
