// src/components/ConstellationSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Starfield from './Starfield'; // Import our new component
// import '../styles/components.css'; // Assuming this is where home-card is styled

const ConstellationSection = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <motion.div
      className="home-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* --- THE FIX: Add the Starfield as a background element --- */}
      <div className="home-card__background">
        <Starfield starCount={50} />
      </div>
      
      {/* This content will now render on top of the starfield */}
      <div className="home-card__content">
        {icon && <div className="home-card-icon">{icon}</div>}
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
        {buttonText && (
          <button className="btn-primary" onClick={onClick}>
            {buttonText}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ConstellationSection;
