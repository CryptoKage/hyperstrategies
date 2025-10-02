// /src/pages/ShopPage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ComingSoon from '../components/ComingSoon'; // Use our simple ComingSoon component

const ShopPage = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <div className="pins-market-container"> {/* <-- 1. Reuse the container from the marketplace */}
                
                {/* --- 2. THE FIX: Reuse the header style from the marketplace --- */}
                <div className="market-header">
                    <h1 className="market-title gradient-text">{t('shop.title')}</h1>
                    <p className="presale-subtitle" style={{ maxWidth: '700px' }}>{t('shop.subtitle')}</p>
                </div>
                {/* --- END OF FIX --- */}
                
                <ComingSoon 
                    title={t('comingSoon.shop.title')} 
                    description={t('comingSoon.shop.description')} 
                />
            </div>
        </Layout>
    );
};

export default ShopPage;
