// src/pages/Vault1Page.jsx (The new "Router" component)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

// Import the view components
import DiscretionaryVaultView from './vaultViews/DiscretionaryVaultView';
import ReserveVaultView from './vaultViews/ReserveVaultView';
import FarmingVaultView from './vaultViews/FarmingVaultView';

const Vault1Page = () => {
  const { vaultId } = useParams();
  const location = useLocation();
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPageData = useCallback(async () => {
    if (!vaultId) return;

    const queryParams = new URLSearchParams(location.search);
    const impersonateUserId = queryParams.get('userId');
    const apiUrl = impersonateUserId 
      ? `/vault-details/${vaultId}?userId=${impersonateUserId}` 
      : `/vault-details/${vaultId}`;
      
    setLoading(true);
    try {
      // --- THIS IS THE FIX ---
      // We will now fetch both the vault details AND the dashboard data in parallel.
      const [vaultDetailsResponse, dashboardResponse] = await Promise.all([
          api.get(apiUrl),
          api.get('/dashboard') // Fetches availableBalance, accountTier, etc.
      ]);

      // Combine both API responses into a single pageData object
      const combinedData = {
          ...vaultDetailsResponse.data, // Contains vaultInfo, userPosition, etc.
          dashboardData: dashboardResponse.data // Contains data for the modal
      };
      
      setPageData(combinedData);
      // --- END OF FIX ---

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load vault information.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [vaultId, location.search]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // ... (Your loading and error states are perfect and do not need to be changed) ...
  if (loading) { /* ... */ }
  if (error || !pageData || !pageData.vaultInfo) { /* ... */ }

  // The conditional rendering logic is also perfect. It will now pass the
  // combined pageData object, including dashboardData, to all child views.
  switch (pageData.vaultInfo.vault_type) {
    case 'RESERVE':
      return <ReserveVaultView pageData={pageData} />;
    case 'FARMING':
      return <FarmingVaultView pageData={pageData} />;
    case 'DISCRETIONARY':
    default:
      return <DiscretionaryVaultView pageData={pageData} />;
  }
};

export default Vault1Page;
