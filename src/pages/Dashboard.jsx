// src/pages/Dashboard.jsx
import React from 'react';
import Layout from '../components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Welcome to your Dashboard</h1>
        <p>This page is protected and only visible to logged-in users.</p>
        <p>Your balance and vault information will appear here soon.</p>
      </div>
    </Layout>
  );
};

export default Dashboard;