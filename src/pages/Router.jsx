// src/pages/Router.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MetaPixelTracker from '../components/MetaPixelTracker'; 

// --- Page Components ---
import Home from './Home';
import XPLeaderboard from './XPLeaderboard';
import Profile from './Profile';
import Investor from './Investor';
import Legal from './Legal';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Wallet from './Wallet';
import OAuthSuccess from './OAuthSuccess';
import FAQ from './FAQ';
import FeeStructure from './FeeStructure';
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
import AnimationControlsPage from './admin/AnimationControlsPage';
import ReportBuilderPage from './admin/ReportBuilderPage';
import ReportsPage from './ReportsPage';
import DeskResultsPage from './admin/DeskResultsPage';
import FarmingPipelinePage from './admin/FarmingPipelinePage';
import HowItWorks from './HowItWorks';


// --- Guard Components ---
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import AdminRoute from '../components/AdminRoute';

const Router = () => {
  return (
    <> 
      <MetaPixelTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/xpleaderboard" element={<XPLeaderboard />} /> 
      <Route path="/fees" element={<FeeStructure />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> 
      <Route path="/reset-password" element={<ResetPassword />} /> 

      {/* --- Guest-Only Routes (primarily for app.domain) --- */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* --- Standard Protected Routes (will be forced to app.domain) --- */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      {/* Pins, marketplace, and shop are temporarily disabled for launch */}
      <Route path="/rewards" element={<ProtectedRoute><RewardsCenter /></ProtectedRoute>} />
      <Route path="/presale-info" element={<ProtectedRoute><Presale /></ProtectedRoute>} />
      <Route path="/vaults/:vaultId" element={<ProtectedRoute><Vault1Page /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          
      {/* --- ADMIN-ONLY Protected Routes --- */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/user/:userId" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
      <Route path="/admin/financials" element={<AdminRoute><FinancialsPage /></AdminRoute>} />
      <Route path="/admin/treasury" element={<AdminRoute><TreasuryPage /></AdminRoute>} />
      <Route path="/admin/vaults" element={<AdminRoute><VaultManagementPage /></AdminRoute>} />
      <Route path="/admin/pins" element={<AdminRoute><PinManagementPage /></AdminRoute>} />
      <Route path="/admin/xp-awards" element={<AdminRoute><XPAwardsPage /></AdminRoute>} />
      <Route path="/admin/animations" element={<AdminRoute><AnimationControlsPage /></AdminRoute>} />
      <Route path="/admin/reports/builder" element={<AdminRoute><ReportBuilderPage /></AdminRoute>} />
      <Route path="/admin/desk-results" element={<AdminRoute><DeskResultsPage /></AdminRoute>} />
      <Route path="/admin/farming-pipeline" element={<AdminRoute><FarmingPipelinePage /></AdminRoute>} />
    </Routes>
     </> 
  );
};

export default Router;
