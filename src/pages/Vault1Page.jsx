// ==============================================================================
// START: Cleaned up src/pages/Vault1Page.jsx
// ==============================================================================
import React from 'react';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sampleChartData = [
  { name: 'Jan', pnl: 4.2, btc: 2.4, eth: 2.1 },
  { name: 'Feb', pnl: 3.1, btc: 2.2, eth: 2.5 },
  { name: 'Mar', pnl: 5.5, btc: 3.2, eth: 3.1 },
  { name: 'Apr', pnl: 4.8, btc: 2.8, eth: 2.9 },
];

const VaultDetailPage = () => { // Renamed for clarity
  return (
    <Layout>
      <div className="vault-detail-container">
        <h1>Core Vault Performance</h1>
        <p className="vault-detail-subtitle">Detailed breakdown of strategy performance and holdings.</p>

        <div className="vault-detail-grid">
          <div className="profile-card">
            <h3>Portfolio Weights</h3>
            {/* We will build a component to fetch and display this later */}
            <p>BTC: 60%</p>
            <p>ETH: 20%</p>
            <p>SOL: 20%</p>
          </div>

          <div className="profile-card chart-card">
            <h3>Performance (Normalized)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sampleChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)' 
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="pnl" name="Overall PnL" stroke="#4ade80" strokeWidth={2} />
                <Line type="monotone" dataKey="btc" name="BTC" stroke="#f7931a" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="eth" name="ETH" stroke="#627eea" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="profile-card full-width">
            <h3>Completed Trades</h3>
            <p>Trade history will be displayed here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VaultDetailPage;
// ==============================================================================
// END OF FILE
// ==============================================================================
