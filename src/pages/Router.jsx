// src/pages/Router.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import the new pages
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

// Keep your old imports
import Home from './Home';
import Airdrop from './Airdrop';
import SelfServe from './SelfServe';
import Managed from './Managed';
import Investor from './Investor';
import Legal from './Legal';
import ProtectedRoute from '../components/ProtectedRoute';

// All the unused imports and variables have been removed.

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/airdrop" element={<Airdrop />} />
      <Route path="/self-serve" element={<SelfServe />} />
      <Route path="/managed" element={<Managed />} />
      <Route path="/investor" element={<Investor />} />
      <Route path="/legal" element={<Legal />} />

      {/* Add the new routes for authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
    </Routes>

  );
};

export default Router;