import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import PresaleBuyModal from '../components/PresaleBuyModal';
import { useTranslation } from 'react-i18next';

const Presale = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rounds = [
    { name: t('presale.round_private'), allocation: 20, price: '-' },
    { name: t('presale.round_a'), allocation: 20, price: '$0.20' },
    { name: t('presale.round_b'), allocation: 40, price: '$0.22' },
    { name: t('presale.round_public'), allocation: 20, price: '$0.25' },
  ];

  const isEligible = user && parseFloat(user.xp || 0) >= 1000;
  const progress = 20; // Placeholder showing private round completion
  const availableBalance = parseFloat(user?.availableBalance || user?.balance || 0);

  return (
      <Layout>
        <div className="presale-container">
          <h1>{t('presale.title')}</h1>
          <p className="presale-subtitle">
            {t('presale.subtitle')}
          </p>

        <div className="presale-progress">
          <div className="presale-progress-fill" style={{ width: `${progress}%` }} />
                  </div>

        <table className="rounds-table">
          <thead>
              <tr>
                <th>{t('presale.table_round')}</th>
                <th>{t('presale.table_allocation')}</th>
                <th>{t('presale.table_price')}</th>
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
             <button className="btn-primary" onClick={() => setIsModalOpen(true)}>{t('presale.button_buy_tokens')}</button>
          ) : (
            <div style={{ marginTop: '24px' }}>
              {user ? (
                <p>{t('presale.needs_xp')}</p>
              ) : (
                <Link to="/login" className="btn-primary">{t('presale.login_to_check')}</Link>
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
