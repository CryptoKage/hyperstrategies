// src/pages/Vault1Page.jsx (The new "Router" component) - CORRECTED

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

// Import the new view components
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
      
    // Don't reset loading to true here, let the initial state handle it
    try {
      const [vaultDetailsResponse, dashboardResponse] = await Promise.all([
          api.get(apiUrl),
          api.get('/dashboard')
      ]);

      const combinedData = {
          ...vaultDetailsResponse.data,
          dashboardData: dashboardResponse.data
      };
      
      setPageData(combinedData);
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

  // --- THIS IS THE NEW, ROBUST RENDER LOGIC ---
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return <p className="error-message">{error}</p>;
    }

    // This is the key check: Do we have the data we need to make a decision?
    if (!pageData || !pageData.vaultInfo) {
      return <p className="error-message">Could not retrieve vault data.</p>;
    }

    // If we have data, we can safely run the switch statement.
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

  return (
    <Layout>
      <div className="vault-detail-container">
        {renderContent()}
      </div>
    </Layout>
  );
  // --- END OF NEW LOGIC ---
};

export default Vault1Page;
