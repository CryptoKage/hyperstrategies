import React from 'react';
import './styles/global.css';
import Header from './components/Header';
import Hero from './components/Hero'; // You will need to re-create or find this component
import CardSection from './components/CardSection'; // You will need to re-create or find this component
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
