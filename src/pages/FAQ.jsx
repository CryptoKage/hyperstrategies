// src/pages/FAQ.jsx

import React from 'react';
import Layout from '../components/Layout';

const FAQ = () => {
  return (
    <Layout>
      <div className="faq-container">
        <h1>Frequently Asked Questions</h1>

        <div className="faq-item">
          <h2>What are Bonus Points?</h2>
          <p>
            Bonus Points are our way of rewarding users who allocate capital to our vaults. When you allocate funds to a vault, 20% of that capital is converted into Bonus Points, valued at a 1:1 ratio with USDC. This 20% helps cover the platform's operational and development costs, allowing us to build a better service for you.
          </p>
        </div>

        <div className="faq-item">
          <h2>Can I withdraw my Bonus Points?</h2>
          <p>
            Bonus Points are not directly withdrawable. They represent your contribution to the platform. Over time, as our platform generates revenue from performance fees, we will use a portion of that revenue to "buy back" Bonus Points from users. This process converts your Bonus Points back into USDC, which is then added to your main "Available to Allocate" balance.
          </p>
        </div>

        <div className="faq-item">
          <h2>How are vault withdrawals processed?</h2>
          <p>
            When you withdraw funds from a vault, you are moving your "Tradable Capital" back to your main "Available to Allocate" balance. This is an internal transfer and is typically instant. To withdraw funds from the platform to an external wallet, you must use the "Withdraw Funds" feature on the Wallet page.
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default FAQ;