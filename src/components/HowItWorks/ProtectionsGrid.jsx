import React from 'react';
import { IconContext } from 'react-icons';
import { FiShield, FiRefreshCw, FiActivity } from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import '../../styles/how-it-works.css';

const iconMap = {
  shield: <FiShield aria-hidden="true" />,
  leaf: <GiPlantRoots aria-hidden="true" />,
  refresh: <FiRefreshCw aria-hidden="true" />,
  activity: <FiActivity aria-hidden="true" />,
};

const ProtectionsGrid = ({ protections }) => (
  <IconContext.Provider value={{ size: '1.5rem' }}>
    <div className="hiw-protections" role="list">
      {protections.map((protection) => (
        <article className="hiw-protection" key={protection.title} role="listitem">
          <div className="hiw-protection__icon" aria-hidden="true">
            {iconMap[protection.icon] || iconMap.shield}
          </div>
          <h3>{protection.title}</h3>
          <p>{protection.body}</p>
        </article>
      ))}
    </div>
  </IconContext.Provider>
);

export default ProtectionsGrid;
