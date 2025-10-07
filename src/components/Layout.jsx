import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNavBar from './BottomNavBar';
import { useAuth } from '../context/AuthContext';
import InteractiveBackground from './InteractiveBackground';
import PlasmaEffect from './PlasmaEffect';
import { useAnimationSettings } from '../context/AnimationSettingsContext';

const Layout = ({ children, showInteractiveBackground = true }) => {
  const { settings } = useAnimationSettings();
  const { user } = useAuth();
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
      
      {user && <BottomNavBar />}
    </div>
  );
};

export default Layout;
