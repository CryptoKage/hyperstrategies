// src/pages/FeeStructure.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const FeeStructure = () => {
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
        <h1>Platform Tiers & Fees</h1>
        <p className="faq-intro">
          Our system is designed to reward participation and long-term commitment through Account Tiers, XP, and a dynamic fee structure.
        </p>
        
        {/* --- Jump-To Navigation Menu --- */}
        <div className="jump-nav">
          <button onClick={() => scrollToSection('tiers')}>Account Tiers</button>
          <button onClick={() => scrollToSection('fees')}>Vault Fees</button>
          <button onClick={() => scrollToSection('xp')}>Earning XP</button>
          <Link to="/faq">View FAQ</Link>
        </div>

        {/* --- Account Tiers Section --- */}
        <div id="tiers" className="info-section">
          <h2>Account Tiers (Capped at Tier 4)</h2>
          <p>Your Account Tier is determined by your total XP. Higher tiers unlock significant benefits on select vaults.</p>
          <table className="info-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>XP Required</th>
                <th>Key Benefits</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Tier 1</td><td>0 - 749 XP</td><td>Standard Access</td></tr>
              <tr><td>Tier 2</td><td>750 - 1,499 XP</td><td>-2% Deposit Fee Discount on Core Vault</td></tr>
              <tr><td>Tier 3</td><td>1,500 - 2,999 XP</td><td>-4% Deposit Fee Discount on Core Vault</td></tr>
              <tr><td>Tier 4</td><td>3,000+ XP</td><td>-6% Deposit Fee (Core) & -10% Performance Fee (ApeCoin)</td></tr>
            </tbody>
          </table>
        </div>
        
        {/* --- Vault Fees Section --- */}
        <div id="fees" className="info-section">
          <h2>Vault Fees Explained</h2>
          <p>Each vault has a unique fee structure tailored to its strategy. Fees are split between platform operations, liquidity provision, and future development.</p>
          
          <div className="fee-card">
            <h3>Core Vault (Vault 1)</h3>
            <ul>
              <li><strong>Deposit Fee:</strong> <strong>20% (Reduces with Tier)</strong>. The full fee amount is credited to your Bonus Points balance.</li>
              <li><strong>Performance Fee:</strong> Flat <strong>20%</strong> charged only on generated profits.</li>
              <li><strong>Lock-in Period:</strong> 1 month on all new capital allocated.</li>
            </ul>
          </div>
          
          <div className="fee-card">
            <h3>ApeCoin EMA Vault (Vault 2)</h3>
            <ul>
              <li><strong>Deposit Fee:</strong> Flat <strong>10%</strong> (Not affected by Tier). Credited as Bonus Points.</li>
              <li><strong>Performance Fee:</strong> <strong>40% (Reduces with Tier)</strong>. This fee is reduced to 30% for Tier 4+ users.</li>
              <li><strong>Lock-in Period:</strong> None. Capital is liquid.</li>
            </ul>
          </div>
        </div>

        {/* --- How to Earn XP Section --- */}
        <div id="xp" className="info-section">
          <h2>How to Earn XP</h2>
          <p>XP is your measure of contribution to the ecosystem. See your rank on the <Link to="/xpleaderboard">XP Leaderboard</Link>.</p>
          <ul className="info-list">
            <li>
              <strong>Capital Allocation:</strong> Earn 1 XP for every $10 of capital allocated to any vault.
            </li>
            <li>
              <strong>Time-Staked Bonus:</strong> Earn daily XP based on the amount of capital you have active in vaults.
            </li>
            <li>
              <strong>Successful Referrals:</strong> Earn bonus XP when a user you refer makes their first capital allocation.
            </li>
            <li>
              <strong>Bonus Point Buy-Back:</strong> Earn <strong>0.1 XP</strong> for every 1 Bonus Point the platform buys back from you.
            </li>
          </ul>
        </div>

      </div>
    </Layout>
  );
};

export default FeeStructure;