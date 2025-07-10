// src/pages/Router.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Page Components ---
import Home from './Home';
import Airdrop from './Airdrop';
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
      {/* These pages can be viewed by anyone, logged in or not. */}
      <Route path="/" element={<Home />} />
      <Route path="/airdrop" element={<Airdrop />} />
      <Route path="/self-serve" element={<SelfServe />} />
      <Route path="/managed" element={<Managed />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/faq" element={<FAQ />} />

      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* --- Guest-Only Routes --- */}
      {/* These pages are ONLY for logged-out users. */}
      {/* If a logged-in user tries to visit /login, they will be redirected to /dashboard. */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>}/>
      <Route         path="/register"        element={          <GuestRoute>            <Register />          </GuestRoute>        }       />
      

      {/* --- Protected Routes --- */}
      {/* These pages are ONLY for logged-in users. */}
      {/* If a logged-out user tries to visit /dashboard, they will be redirected to /login. */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      {/* ✅ 2. ADD THE NEW PROTECTED ROUTE FOR THE WALLET */}
      <Route 
        path="/wallet" 
        element={<ProtectedRoute><Wallet /></ProtectedRoute>} 
      />
    </Routes>
  );
};

export default Router;