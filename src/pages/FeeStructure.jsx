// src/pages/FeeStructure.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTranslation, Trans } from 'react-i18next';

const FeeStructure = () => {
   const { t } = useTranslation();
  // Helper function for smooth scrolling
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // We account for the sticky header height to not obscure the title
      const headerOffset = 80; // Adjust this value based on your header's height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

 return (
    <Layout>
      <div className="faq-container">
        <h1>{t('fees_page.title')}</h1>
        <p className="faq-intro">{t('fees_page.intro')}</p>
        
        <div className="jump-nav">
          <button onClick={() => scrollToSection('tiers')}>{t('fees_page.nav_tiers')}</button>
          <button onClick={() => scrollToSection('fees')}>{t('fees_page.nav_fees')}</button>
          <button onClick={() => scrollToSection('xp')}>{t('fees_page.nav_xp')}</button>
          <Link to="/faq">{t('fees_page.nav_faq')}</Link>
        </div>

        <div id="tiers" className="info-section">
          <h2>{t('fees_page.tiers_title')}</h2>
          <p>{t('fees_page.tiers_subtitle')}</p>
          <table className="info-table">
            <thead>
              <tr>
                <th>{t('fees_page.table_header_tier')}</th>
                <th>{t('fees_page.table_header_xp')}</th>
                <th>{t('fees_page.table_header_benefits')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Tier 1</td><td>{t('fees_page.tier1_xp')}</td><td>{t('fees_page.tier1_benefit')}</td></tr>
              <tr><td>Tier 2</td><td>{t('fees_page.tier2_xp')}</td><td>{t('fees_page.tier2_benefit')}</td></tr>
              <tr><td>Tier 3</td><td>{t('fees_page.tier3_xp')}</td><td>{t('fees_page.tier3_benefit')}</td></tr>
              <tr><td>Tier 4</td><td>{t('fees_page.tier4_xp')}</td><td>{t('fees_page.tier4_benefit')}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div id="fees" className="info-section">
          <h2>{t('fees_page.fees_title')}</h2>
          <p>{t('fees_page.fees_subtitle')}</p>
          <div className="fee-card">
            <h3>{t('fees_page.core_vault_title')}</h3>
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('fees_page.core_vault_desc_1') }} />
              <li dangerouslySetInnerHTML={{ __html: t('fees_page.core_vault_desc_2') }} />
              <li dangerouslySetInnerHTML={{ __html: t('fees_page.core_vault_desc_3') }} />
            </ul>
          </div>
          <div className="fee-card">
            <h3>{t('fees_page.ape_vault_title')}</h3>
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('fees_page.ape_vault_desc_1') }} />
              <li dangerouslySetInnerHTML={{ __html: t('fees_page.ape_vault_desc_2') }} />
              <li dangerouslySetInnerHTML={{ __html: t('fees_page.ape_vault_desc_3') }} />
            </ul>
          </div>
        </div>

        <div id="xp" className="info-section">
          <h2>{t('fees_page.xp_title')}</h2>
          <p>
            <Trans i18nKey="fees_page.xp_subtitle">
              XP is your measure of contribution to the ecosystem. See your rank on the <Link to="/xpleaderboard">XP Leaderboard</Link>.
            </Trans>
          </p>
          <ul className="info-list">
            <li>
              <strong>{t('fees_page.xp_rule_1_title')}</strong>
              {t('fees_page.xp_rule_1_desc')}
            </li>
            <li>
              <strong>{t('fees_page.xp_rule_2_title')}</strong>
              {t('fees_page.xp_rule_2_desc')}
            </li>
            <li>
              <strong>{t('fees_page.xp_rule_3_title')}</strong>
              {t('fees_page.xp_rule_3_desc')}
            </li>
            <li>
              <strong dangerouslySetInnerHTML={{ __html: t('fees_page.xp_rule_4_title') }} />
              <span dangerouslySetInnerHTML={{ __html: t('fees_page.xp_rule_4_desc') }} />
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default FeeStructure;