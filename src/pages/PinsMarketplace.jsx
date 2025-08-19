// FILE: /src/pages/PinsMarketplace.jsx
// V1.0 VERSION: This is a polished "Coming Soon" showcase page.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

// You correctly swapped the pins to the ones you liked!
import bugFinderImg from '../assets/Decals/BUGFINDER.png';
import dmtImg from '../assets/Decals/DMT.png';
import earlySupporterImg from '../assets/Decals/EARLYSUPPORTER.png';

const PinsMarketplace = () => {
  const { t } = useTranslation();
  
  // Create a static array with the correct imported images
  const [showcasePins] = useState([
    { name: 'BUG FINDER', image_url: bugFinderImg },
    { name: 'DMT', image_url: dmtImg },
    { name: 'EARLY SUPPORTER', image_url: earlySupporterImg }
  ]);

  return (
    <Layout>
      <div className="pins-market-container">
        <h2 className="market-title gradient-text">{t('pins_market.title')}</h2>
        
        <div className="coming-soon-showcase">
          <div className="showcase-images">
            {showcasePins.map((pin, index) => (
              <motion.img 
                key={pin.name}
                src={pin.image_url} 
                alt={`${pin.name} Pin`} 
                className="showcase-pin"
                animate={{ y: [0, -5 + (index * 3), 0] }} // Give each a slightly different bounce
                transition={{ duration: 2.5 + index, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
          
          <h3>{t('pins_market.coming_soon_title')}</h3>
          <p>{t('pins_market.coming_soon_desc')}</p>

          {/* --- THE FIX: Add an inline style to create more space above the button --- */}
          <Link to="/profile" className="btn-primary" style={{ marginTop: '32px', width: 'auto' }}>
            {t('pins_market.view_my_pins')}
          </Link>
        </div>

      </div>
    </Layout>
  );
};

export default PinsMarketplace;
