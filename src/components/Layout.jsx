import React from 'react';
import Header from './Header';
import Footer from './Footer';
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

const Layout = ({ children, showInteractiveBackground = true, showPlasmaBackground = true, showFooter = true }) => {
  const { settings } = useAnimationSettings();
  const {
    general: { showPlasma, showNetwork },
  } = settings;

  const shouldShowPlasma = showPlasmaBackground && showPlasma;
  const shouldShowNetwork = showInteractiveBackground && showNetwork;

  return (
    <div className="layout-wrapper" style={{ backgroundColor: 'var(--color-background)' }}>
      {shouldShowPlasma && <PlasmaEffect />}
      {shouldShowNetwork && <InteractiveBackground />}
      <Header />
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
