// src/pages/admin/FinancialsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import Pagination from '../../components/Pagination'; // We will create this component next

const FinancialsPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] =useState(true);
  const [error, setError] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      // Pass the current page to the API
      const response = await api.get(`/admin/deposits?page=${currentPage}`);
      setDeposits(response.data.deposits);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch deposit data.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]); // Refetch when currentPage changes

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const formatAddress = (address) => address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'N/A';

  return (
    <Layout>
      <div className="admin-container">
        <div className="wallet-header">
          <h1>Financial Auditing</h1>
          <Link to="/admin" className="btn-secondary">← Back to Mission Control</Link>
        </div>

        {/* We can add tabs here later */}
        <div className="admin-card">
          <h3>All Platform Deposits</h3>
          {loading && <p>Loading deposits...</p>}
          {error && <p className="error-message">{error}</p>}
          
          {!loading && !error && (
            <>
              <div className="table-responsive">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map(deposit => (
                      <tr key={deposit.id}>
                        <td>{new Date(deposit.detected_at).toLocaleString()}</td>
                        <td>
                          <Link to={`/admin/user/${deposit.user_id}`} className="admin-table-link">
                            {deposit.username}
                          </Link>
                        </td>
                        <td>{deposit.email}</td>
                        <td className="amount">${parseFloat(deposit.amount).toFixed(2)}</td>
                        <td>
                          <a 
                            href={`https://etherscan.io/tx/${deposit.tx_hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="etherscan-link"
                          >
                            {formatAddress(deposit.tx_hash)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FinancialsPage;