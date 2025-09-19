import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

const Layout = ({ children, showInteractiveBackground = true }) => {
  const { settings } = useAnimationSettings();
  const {
    general: { showPlasma, showNetwork },
  } = settings;

  return (
    <div className="layout-wrapper" style={{ backgroundColor: 'var(--color-background)' }}>
      {showPlasma && <PlasmaEffect />}
      {showInteractiveBackground && showNetwork && <InteractiveBackground />}
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
