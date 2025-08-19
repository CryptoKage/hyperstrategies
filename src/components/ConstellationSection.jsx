import React from 'react';
import { motion } from 'framer-motion';
import '../styles/components.css';

const ConstellationSection = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <motion.div
      className="home-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {icon && <div className="home-card-icon">{icon}</div>}
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {buttonText && (
        <button className="btn-primary" onClick={onClick}>
          {buttonText}
        </button>
      )}
    </motion.div>
  );
};

export default ConstellationSection;
