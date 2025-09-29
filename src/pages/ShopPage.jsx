// /src/pages/ShopPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon'; // Import the new component

const ShopPage = () => {
    const { t } = useTranslation();
    return (
        <Layout>
            <div className="rewards-container">
                <h1>{t('shop.title')}</h1>
                <p className="rewards-container-subtitle">{t('shop.subtitle')}</p>
                <ComingSoon featureKey="shop" />
            </div>
        </Layout>
    );
};
export default ShopPage;
