import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import PresaleBuyModal from '../components/PresaleBuyModal';

const rounds = [
  { name: 'Private', allocation: 20, price: '-' },
  { name: 'Round A', allocation: 20, price: '$0.20' },
  { name: 'Round B', allocation: 40, price: '$0.22' },
  { name: 'Public', allocation: 20, price: '$0.25' },
];

const Presale = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEligible = user && parseFloat(user.xp || 0) >= 1000;
  const progress = 20; // Placeholder showing private round completion
  const availableBalance = parseFloat(user?.availableBalance || user?.balance || 0);

  return (
    <Layout>
      <div className="presale-container">
        <h1>Platform Token Presale</h1>
        <p className="presale-subtitle">
          Your XP balance determines your eligibility and allocation. Secure your spot in the future of HyperStrategies.
        </p>

        <div className="presale-progress">
          <div className="presale-progress-fill" style={{ width: `${progress}%` }} />
                  </div>

        <table className="rounds-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Allocation</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.allocation}%</td>
                <td>{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isEligible ? (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Buy Tokens</button>
        ) : (
          <div style={{ marginTop: '24px' }}>
            {user ? (
              <p>You need at least 1,000 XP to participate in the presale.</p>
            ) : (
              <Link to="/login" className="btn-primary">Login to Check Your Eligibility</Link>
            )}
          </div>
        )}

        <PresaleBuyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableBalance={availableBalance}
        />
      </div>
    </Layout>
  );
};

export default Presale;
