import React from 'react';
import { motion } from 'framer-motion';
import GalaxyCanvas from './GalaxyCanvas';
import '../styles/components.css';

const ConstellationSection = ({ icon, title, description, buttonText, onClick, seed }) => {
  return (
    <section className="constellation-section">
      <GalaxyCanvas seed={seed} />
      <motion.div
        className="constellation-content"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {icon && <div className="constellation-icon">{icon}</div>}
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
        {buttonText && (
          <button className="btn-primary" onClick={onClick}>
            {buttonText}
          </button>
        )}
      </motion.div>
    </section>
  );
};

export default ConstellationSection;
