// src/components/WelcomeCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WelcomeCard = () => {
    const { t } = useTranslation();

    return (
        <div className="welcome-card">
            <h2>{t('dashboard.welcome_title', "Let's Get Started!")}</h2>
            <p>{t('dashboard.welcome_subtitle', "Your journey begins with your first deposit. Head to your wallet to fund your account and start exploring strategies.")}</p>
            <Link to="/wallet" className="btn-primary" style={{ marginTop: '1rem', width: 'auto', padding: '12px 24px' }}>
                {t('dashboard.welcome_cta', 'Fund Your Wallet')}
            </Link>
        </div>
    );
};

export default WelcomeCard;
