import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import AvailableListings from '../components/AvailableListings';
import UserListings from '../components/UserListings';

const TabsMarketplace = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="tabs-market">
        <h2 className="market-title gradient-text">{t('tabs_market.title')}</h2>
        <AvailableListings />
        <UserListings />
      </div>
    </Layout>
  );
};

export default TabsMarketplace;
