// src/pages/Router.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Page Components ---
import Home from './Home';
import XPLeaderboard from './XPLeaderboard'; // ✅ Correctly import the renamed component
import Profile from './Profile';           // ✅ Import the new Profile page
import SelfServe from './SelfServe';
import Managed from './Managed';
import Investor from './Investor';
import Legal from './Legal';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Wallet from './Wallet';
import OAuthSuccess from './OAuthSuccess';
import FAQ from './FAQ';


// --- Guard Components ---
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';

const Router = () => {
  return (
    <Routes>
      {/* --- Publicly Accessible Routes --- */}
      <Route path="/" element={<Home />} />
      <Route path="/leaderboard" element={<XPLeaderboard />} /> {/* ✅ Use the correct path and component */}
      <Route path="/self-serve" element={<SelfServe />} />
      <Route path="/managed" element={<Managed />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* --- Guest-Only Routes (for logged-out users) --- */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* --- Protected Routes (for logged-in users) --- */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/wallet" 
        element={<ProtectedRoute><Wallet /></ProtectedRoute>} 
      />
      <Route 
        path="/profile" 
        element={<ProtectedRoute><Profile /></ProtectedRoute>} 
      />
    </Routes>
  );
};

export default Router;