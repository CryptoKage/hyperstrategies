import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Presale = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="presale-container">
        <h1>Platform Token Presale</h1>
        <p className="presale-subtitle">
          Your XP balance determines your eligibility and allocation. Secure your spot in the future of HyperStrategies.
        </p>

        <div className="profile-card presale-placeholder-card">
          <h3>Coming Soon</h3>
          <p>
            The token presale is currently being finalized. Check back soon for full details on tokenomics, sale progress, and how to participate with your XP.
          </p>
          {!user && (
            <div style={{ marginTop: '24px' }}>
              <Link to="/login" className="btn-primary">Login to Check Your Eligibility</Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Presale;
