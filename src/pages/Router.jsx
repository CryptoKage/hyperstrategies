// src/pages/Router.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Page Components ---
import Home from './Home';
import XPLeaderboard from './XPLeaderboard';
import Profile from './Profile';
import Pins from './Pins';
import Investor from './Investor';
import Legal from './Legal';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Wallet from './Wallet';
import OAuthSuccess from './OAuthSuccess';
import FAQ from './FAQ';
import FeeStructure from './FeeStructure';
import PinsMarketplace from './PinsMarketplace';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

import AdminDashboard from './admin/AdminDashboard';
import FinancialsPage from './admin/FinancialsPage';
import UserDetailPage from './admin/UserDetailPage';
import TreasuryPage from './admin/TreasuryPage';
import VaultManagementPage from './admin/VaultManagementPage';
import PinManagementPage from './admin/PinManagementPage';
import XPAwardsPage from './admin/XPAwardsPage';
import RewardsCenter from './RewardsCenter';
import Presale from './Presale';
import Vault1Page from './Vault1Page';
import ShopPage from './ShopPage';
import AnimationControlsPage from './admin/AnimationControlsPage';


// --- Guard Components ---
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import AdminRoute from '../components/AdminRoute';
import TierRoute from '../components/TierRoute';

const Router = () => {
  return (
    <Routes>
      {/* --- Publicly Accessible Routes --- */}
      <Route path="/" element={<Home />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/xpleaderboard" element={<XPLeaderboard />} /> 
      <Route path="/fees" element={<FeeStructure />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> 
      <Route path="/reset-password" element={<ResetPassword />} /> 

      {/* --- Guest-Only Routes --- */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* --- Standard Protected Routes --- */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/pins" element={<ProtectedRoute><Pins /></ProtectedRoute>} />
      <Route path="/marketplace" element={<TierRoute minTier={2}><PinsMarketplace /></TierRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><RewardsCenter /></ProtectedRoute>} />
      <Route path="/presale-info" element={<ProtectedRoute><Presale /></ProtectedRoute>} />
      <Route path="/vaults/:vaultId" element={<ProtectedRoute><Vault1Page /></ProtectedRoute>} />
      <Route path="/shop" element={<ShopPage />} />
          
      {/* --- ADMIN-ONLY Protected Routes --- */}
      {/* --- ANNOTATION --- I've standardized the main admin route to just /admin for simplicity */}
      <Route 
        path="/admin" 
        element={<AdminRoute><AdminDashboard /></AdminRoute>} 
      />
      {/* --- NEW --- This is the new route for the user detail page */}
      <Route
        path="/admin/user/:userId"
        element={<AdminRoute><UserDetailPage /></AdminRoute>}
      />
      <Route
        path="/admin/financials"  
        element={<AdminRoute><FinancialsPage /></AdminRoute>}
      />
      <Route  
        path="/admin/treasury"
        element={<AdminRoute><TreasuryPage /></AdminRoute>}
      />
      <Route
        path="/admin/vaults"
        element={<AdminRoute><VaultManagementPage /></AdminRoute>}
      />
      <Route
            path="/admin/pins"
            element={<AdminRoute><PinManagementPage /></AdminRoute>}
      />
      <Route path="/admin/xp-awards" element={<AdminRoute><XPAwardsPage /></AdminRoute>} />
       <Route path="/admin/animations" element={<AdminRoute><AnimationControlsPage /></AdminRoute>} />
       
    </Routes>
  );
};

export default Router;
