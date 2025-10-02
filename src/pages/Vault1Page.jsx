// src/pages/Vault1Page.jsx (The new "Router" component)

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
  
  // This parent component will now be responsible for fetching all data
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
      const response = await api.get(apiUrl);
      setPageData(response.data);
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

  if (loading) {
    return (
      <Layout>
        <div className="vault-detail-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !pageData || !pageData.vaultInfo) {
    return (
      <Layout>
        <div className="vault-detail-container">
          <p className="error-message">{error}</p>
        </div>
      </Layout>
    );
  }

  // The conditional rendering logic (The "Router")
  // We pass the full pageData object as a prop to the appropriate view
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

// Rename the export to match the new purpose
export default Vault1Page;
