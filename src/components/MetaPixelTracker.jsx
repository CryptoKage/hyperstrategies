// src/components/MetaPixelTracker.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactPixel from 'react-facebook-pixel';

const MetaPixelTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // This effect will run on the initial page load AND every time the URL changes.
        // The 'init' function in index.js already handles the first page view, 
        // but calling it again is harmless and ensures tracking on all subsequent navigations.
        ReactPixel.pageView();
    }, [location]);

    return null; // This component renders nothing to the screen.
};

export default MetaPixelTracker;
