// src/pages/Router.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Page Components ---
import Home from './Home';
import XPLeaderboard from './XPLeaderboard';
import Profile from './Profile';
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
import AdminDashboard from './admin/AdminDashboard';
// The import for AdminRoute is removed from here as it's a guard, not a page.

// --- Guard Components ---
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import AdminRoute from '../components/AdminRoute'; // This is the correct place for it.

const Router = () => {
  return (
    <Routes>
      {/* --- Publicly Accessible Routes --- */}
      <Route path="/" element={<Home />} />
      <Route path="/self-serve" element={<SelfServe />} />
      <Route path="/managed" element={<Managed />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      {/* ✅ Standardized to the cleaner URL */}
      <Route path="/leaderboard" element={<XPLeaderboard />} /> 

      {/* --- Guest-Only Routes --- */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* --- Standard Protected Routes --- */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
      {/* --- ADMIN-ONLY Protected Routes --- */}
      <Route 
        path="/admin/dashboard" 
        element={<AdminRoute><AdminDashboard /></AdminRoute>} 
      />
    </Routes>
  );
};

export default Router;