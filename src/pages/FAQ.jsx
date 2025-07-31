// src/pages/FAQ.jsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import
import Layout from '../components/Layout';

const FAQ = () => {
  const { t } = useTranslation(); // 2. Initialize

  return (
    <Layout>
      <div className="faq-container">
        <h1>{t('faq_page.title')}</h1>

        <div className="faq-item">
          <h2>{t('faq_page.q1_title')}</h2>
          <p>{t('faq_page.q1_answer')}</p>
        </div>

        <div className="faq-item">
          <h2>{t('faq_page.q2_title')}</h2>
          <p>{t('faq_page.q2_answer')}</p>
        </div>

        <div className="faq-item">
          <h2>{t('faq_page.q3_title')}</h2>
          <p>{t('faq_page.q3_answer')}</p>
        </div>

        {/* You can easily add more questions here by adding q4_title, q4_answer, etc. to your translation.json */}

      </div>
    </Layout>
  );
};

export default FAQ;