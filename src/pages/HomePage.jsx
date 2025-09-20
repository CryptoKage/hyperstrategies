// /src/pages/HomePage.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useTransform, useScroll } from 'framer-motion';
import Layout from '../components/Layout';
import GalaxyCanvas from '../components/GalaxyCanvas'; // Our 3D background
import { Link } from 'react-router-dom';

const HomePage = () => {
    const { t } = useTranslation();
    const [scrollProgress, setScrollProgress] = useState(0);

    // This is a simpler way to track scroll for the DOM elements
    const { scrollYProgress } = useScroll();
    
    // We can create parallax effects by transforming values based on scroll progress
    const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

    return (
        <Layout showInteractiveBackground={false}> {/* We disable the default background to show our custom one */}
            <div className="home-container">
                
                {/* The 3D Canvas Layer (in the background) */}
                <GalaxyCanvas onScrollUpdate={setScrollProgress} />

                {/* The HTML UI Layer (in the foreground) */}
                <div className="home-content-wrapper">
                    
                    {/* Section 1: Hero */}
                    <motion.section 
                        className="home-section hero-section"
                        style={{ opacity: heroOpacity, y: heroY }}
                    >
                        <h1>{t('home.hero.title')}</h1>
                        <p className="subtitle">{t('home.hero.subtitle')}</p>
                        <div className="cta-buttons">
                            <Link to="/dashboard" className="btn-primary">{t('home.hero.cta_primary')}</Link>
                            <Link to="/faq" className="btn-secondary">{t('home.hero.cta_secondary')}</Link>
                        </div>
                    </motion.section>

                    {/* This is a spacer div. Its height determines the scroll length. */}
                    {/* The height should be roughly (number of cards * 100vh) */}
                    <div style={{ height: '300vh' }} /> 

                    {/* You can add more fixed or scrolling sections here */}
                    <section className="home-section final-section">
                        <h2>{t('home.final.title')}</h2>
                        <p>{t('home.final.subtitle')}</p>
                        <Link to="/register" className="btn-primary">{t('home.final.cta')}</Link>
                    </section>

                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
