// src/hooks/useDomainRedirects.js

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming this provides isAuthenticated
import { useLocation, useNavigate } from 'react-router-dom';

const APP_DOMAIN = 'app.hyper-strategies.com';
const WWW_DOMAIN = 'www.hyper-strategies.com';

const useDomainRedirects = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine the current state
    const currentDomain = window.location.hostname;
    const isRootOrWww = currentDomain === 'hyper-strategies.com' || currentDomain === WWW_DOMAIN;
    const isApp = currentDomain === APP_DOMAIN;
    
    // --- 1. Redirect Logic ---
    useEffect(() => {
        if (isLoading) return; // Wait for authentication status to resolve

        const path = location.pathname;
        
        // Scenario A: Logged in user is on the marketing domain (www or root)
        if (isAuthenticated && isRootOrWww) {
            // We only need to redirect them if they aren't looking at a purely public page.
            // Since all your app routes are protected, let's keep it simple: redirect them to the DApp dashboard.
            window.location.replace(`https://${APP_DOMAIN}/dashboard`);
            return;
        }

        // Scenario B: Logged out user tries to access the DApp domain (app)
        // If they are not authenticated and they hit a protected app route, redirect to the www marketing page.
        if (!isAuthenticated && isApp) {
            // If they are explicitly trying to go to the app, send them to the login page on the app subdomain
            // This allows the app.hyper-strategies.com to be the dedicated login/register interface
            if (path !== '/login' && path !== '/register' && path !== '/forgot-password' && path !== '/reset-password') {
                navigate('/login');
                return;
            }
        }

    }, [isAuthenticated, isLoading, isRootOrWww, isApp, navigate, location.pathname]);
};

export default useDomainRedirects;
