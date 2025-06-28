import React from 'react';
import './styles/global.css';
import './styles/components.css';

import Header from './components/Header';
import Hero from './components/Hero';
import CardSection from './components/CardSection';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <Hero />
      <CardSection />
      <Footer />
    </>
  );
}

export default App;
