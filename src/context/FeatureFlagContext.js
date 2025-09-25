// /src/context/FeatureFlagContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/api';

// Create the context with a default value that includes a loading state
const FeatureFlagContext = createContext({
    flags: {},
    isLoading: true, // Default to loading
});

export const FeatureFlagProvider = ({ children }) => {
    const [flags, setFlags] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/system/feature-flags')
            .then(response => {
                setFlags(response.data);
            })
            .catch(err => {
                console.error("CRITICAL: Could not load feature flags from the server.", err);
                setFlags({}); // Default to off on error
            })
            .finally(() => {
                setIsLoading(false); // Set loading to false only after the API call is complete
            });
    }, []);

    const value = useMemo(() => ({ flags, isLoading }), [flags, isLoading]);

    return (
        <FeatureFlagContext.Provider value={value}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

// The hook now returns the entire context object, including the loading state
export const useFeatureFlagsContext = () => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlagsContext must be used within a FeatureFlagProvider');
    }
    return context;
};
