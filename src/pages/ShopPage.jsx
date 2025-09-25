// /src/pages/ShopPage.jsx

import React from 'react';
import Layout from '../components/Layout';
import ComingSoonWrapper from '../components/ComingSoonWrapper';
import { useTranslation } from 'react-i18next';

const ShopPage = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <div className="rewards-container">
                <h1>{t('shop.title')}</h1>
                <p className="rewards-container-subtitle">{t('shop.subtitle')}</p>
                
                <ComingSoonWrapper flagName="showShop"> {/* <-- Use the new flag name */}
                     <div className="market-grid" style={{ marginTop: '2rem' }}>
                        <div className="profile-card"><h3>Mystery Item</h3><p>...</p></div>
                        <div className="profile-card"><h3>XP Boost</h3><p>...</p></div>
                        <div className="profile-card"><h3>Exclusive Pin</h3><p>...</p></div>
                    </div>
                </ComingSoonWrapper>
            </div>
        </Layout>
    );
};

export default ShopPage;
