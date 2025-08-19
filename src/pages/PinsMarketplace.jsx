// FILE: /src/pages/PinsMarketplace.jsx
// V1.0 VERSION: This is a polished "Coming Soon" showcase page.

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

// We can import a few of the pin images to make the showcase more visual
import bugFinderImg from '../assets/Decals/BUGFINDER.png';
import DMTImg from '../assets/Decals/DMT.png';
import EARLYSUPPORTERImg from '../assets/Decals/EARLYSUPPORTER.png';

const PinsMarketplace = () => {
  const { t } = useTranslation();

  // We no longer need to fetch data, so the useEffect and state are removed.

  return (
    <Layout>
      <div className="pins-market-container">
        <h2 className="market-title gradient-text">{t('pins_market.title')}</h2>
        
        {/* --- THIS IS THE NEW SHOWCASE SECTION --- */}
        <div className="coming-soon-showcase">
          <div className="showcase-images">
            <motion.img 
              src={bugFinderImg} 
              alt="Bug Finder Pin" 
              className="showcase-pin"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img 
              src={DMTImg} 
              alt="DMT Pin" 
              className="showcase-pin"
              initial={{ scale: 1.1 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img 
              src={EARLYSUPPORTERImg} 
              alt="EARLYSUPPORTER Pin" 
              className="showcase-pin"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <h3>{t('pins_market.coming_soon_title')}</h3>
          <p>{t('pins_market.coming_soon_desc')}</p>

          <Link to="/profile" className="btn-primary" style={{marginTop: '24px', width: 'auto'}}>
            {t('pins_market.view_my_pins')}
          </Link>
        </div>

      </div>
    </Layout>
  );
};

export default PinsMarketplace;
