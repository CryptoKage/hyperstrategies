// src/pages/admin/FinancialsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import Pagination from '../../components/Pagination';

const FinancialsPage = () => {
  // --- NEW --- State to manage the active tab
  const [activeTab, setActiveTab] = useState('deposits'); // 'deposits' or 'positions'

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // --- NEW --- A single, flexible fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setTableData([]); // Clear previous data

    try {
      let endpoint = '';
      if (activeTab === 'deposits') {
        endpoint = `/admin/deposits?page=${currentPage}`;
      } else if (activeTab === 'positions') {
        endpoint = `/admin/vault-positions?page=${currentPage}`;
      }

      if (endpoint) {
        const response = await api.get(endpoint);
        if (activeTab === 'deposits') {
          setTableData(response.data.deposits);
          setTotalPages(response.data.totalPages);
        } else if (activeTab === 'positions') {
          setTableData(response.data.positions);
          setTotalPages(response.data.totalPages);
        }
      }
    } catch (err) {
      setError(`Failed to fetch ${activeTab} data.`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]); // Refetch when tab or page changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Reset to page 1 when switching tabs
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1);
  };

  const formatAddress = (address) => address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'N/A';

  // --- NEW --- Render functions for each table's content
  const renderDepositsTable = () => (
    <table className="activity-table">
      <thead>
        <tr>
          <th>Date</th><th>User</th><th>Amount</th><th>Tx Hash</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map(deposit => (
          <tr key={deposit.id}>
            <td>{new Date(deposit.detected_at).toLocaleString()}</td>
            <td><Link to={`/admin/user/${deposit.user_id}`} className="admin-table-link">{deposit.username}</Link></td>
            <td className="amount">${parseFloat(deposit.amount).toFixed(2)}</td>
            <td><a href={`https://etherscan.io/tx/${deposit.tx_hash}`} target="_blank" rel="noopener noreferrer" className="etherscan-link">{formatAddress(deposit.tx_hash)}</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPositionsTable = () => (
    <table className="activity-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Vault</th>
          <th className="amount">Total Capital</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((pos, index) => (
          // Use a composite key since position_id no longer exists
          <tr key={`${pos.user_id}-${pos.vault_id}`}>
            <td><Link to={`/admin/user/${pos.user_id}`} className="admin-table-link">{pos.username}</Link></td>
            <td>{pos.vault_name}</td>
            <td className="amount">${parseFloat(pos.total_capital).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Financial Auditing</h1>
          <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
        </div>

        <div className="admin-card">
          {/* --- NEW --- Tab Navigation */}
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'deposits' ? 'active' : ''}`}
              onClick={() => handleTabChange('deposits')}
            >
              Deposits
            </button>
            <button 
              className={`tab-button ${activeTab === 'positions' ? 'active' : ''}`}
              onClick={() => handleTabChange('positions')}
            >
              Vault Positions
            </button>
          </div>

          <div className="tab-content">
            {loading && <p>Loading data...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && tableData.length > 0 && (
              <>
                <div className="table-responsive-wrapper">
                  {activeTab === 'deposits' && renderDepositsTable()}
                  {activeTab === 'positions' && renderPositionsTable()}
                </div>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
            {!loading && !error && tableData.length === 0 && (
              <p>No {activeTab} found.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinancialsPage;
