// src/hooks/useDomainRedirects.js - V2, MORE ROBUST

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const APP_DOMAIN = 'app.hyper-strategies.com';
const WWW_DOMAIN = 'www.hyper-strategies.com'; // Or your root domain
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const useDomainRedirects = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    
    useEffect(() => {
        // 1. Do nothing until the authentication status is definitively known.
        if (isLoading) {
            return; 
        }

        // 2. In production, enforce domain rules.
        if (IS_PRODUCTION) {
            const currentDomain = window.location.hostname;
            const targetPath = location.pathname + location.search;
            
            // RULE #1: If the user IS authenticated, they MUST be on the app domain.
            if (isAuthenticated && currentDomain !== APP_DOMAIN) {
                // Exception: Don't redirect if they are in the middle of an OAuth callback.
                if (targetPath.startsWith('/oauth-success')) {
                    return;
                }
                console.log(`Redirecting logged-in user to APP domain...`);
                window.location.replace(`https://${APP_DOMAIN}${targetPath}`);
                return; // Stop further execution
            }
            
            // RULE #2: If the user IS NOT authenticated and is on the app domain...
            if (!isAuthenticated && currentDomain === APP_DOMAIN) {
                // Allow them to be on public/guest pages.
                const allowedGuestPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
                if (!allowedGuestPaths.some(path => targetPath.startsWith(path))) {
                     console.log(`Redirecting logged-out user from APP domain to WWW domain...`);
                     window.location.replace(`https://${WWW_DOMAIN}/`); // Send them to the marketing homepage
                     return; // Stop further execution
                }
            }
        }
    }, [isAuthenticated, isLoading, location]);
};

export default useDomainRedirects;
