// /src/pages/Investor.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Investor = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Use the auth context to check if the user is logged in

  return (
    <Layout>
      <div className="home-container"> {/* We can reuse the main container for consistent spacing */}
        <section className="hero-section">
          <h1 className="hero-headline">{t('investor.title')}</h1>
          <p className="hero-subtext">{t('investor.subtitle')}</p>
        </section>

        <section className="card-section">
          {/* Card 1: Seed Investment */}
          <div className="home-card">
            <h3>{t('investor.seed.title')}</h3>
            <p>{t('investor.seed.description')}</p>
            <div className="card__footer">
              <a 
                href="https://t.me/cryptokage" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary" 
                style={{ marginBottom: '1rem', display: 'block' }} // Added inline style for spacing
              >
                {t('investor.seed.cta_telegram')}
              </a>
              <a 
                href="https://x.com/cryptokage" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-outline" 
                style={{ display: 'block' }}
              >
                {t('investor.seed.cta_x')}
              </a>
            </div>
          </div>

          {/* Card 2: Presale Investment */}
          <div className="home-card">
            <h3>{t('investor.presale.title')}</h3>
            <p>{t('investor.presale.description')}</p>
            <div className="card__footer">
              {user ? (
                // If the user is logged in, link directly to the presale info page
                <Link to="/presale-info" className="btn-primary">
                  {t('investor.presale.cta_loggedin')}
                </Link>
              ) : (
                // If the user is logged out, link them to the login page
                <Link to="/login" className="btn-primary">
                  {t('investor.presale.cta_loggedout')}
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Investor;
