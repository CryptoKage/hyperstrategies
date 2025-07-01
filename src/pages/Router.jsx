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
import OAuthSuccess from './OAuthSuccess';


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
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* 
        In the future, you can add more protected routes here easily:
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> 
      */}
    </Routes>
  );
};

export default Router;