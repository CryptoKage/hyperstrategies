// /src/context/FeatureFlagContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/api';

// Create the context with a default empty object
const FeatureFlagContext = createContext({});

export const FeatureFlagProvider = ({ children }) => {
    const [flags, setFlags] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the flags from our backend API when the app first loads
        api.get('/system/feature-flags')
            .then(response => {
                setFlags(response.data);
            })
            .catch(err => {
                console.error("CRITICAL: Could not load feature flags from the server.", err);
                // In case of an error, we default to an empty object,
                // which means all features will appear "off" by default.
                setFlags({});
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []); // This empty array ensures the effect runs only once on mount

    // We use useMemo to prevent unnecessary re-renders of child components
    const value = useMemo(() => ({ flags, isLoading }), [flags, isLoading]);

    return (
        <FeatureFlagContext.Provider value={value}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

// This is a custom hook that makes it easy for components to access the flags
export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    // Return only the flags object for cleaner usage in components
    return context.flags;
};
