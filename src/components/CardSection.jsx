// src/components/CardSection.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const CardSection = ({ cards }) => {
  const navigate = useNavigate();

  return (
    <section className="card-section">
      <div className="card-section__wrapper">
        {cards.map((card, idx) => (
          // We add a 'card--clickable' class to handle hover effects on the whole card
          <div key={idx} className="card card--clickable" onClick={() => navigate(card.route)}>
            {/* A dedicated element for the icon makes styling much easier */}
            <div className="card__icon">{card.icon}</div>
            
            <div className="card__content">
              <h3 className="card__title">{card.title}</h3>
              <p className="card__description">{card.description}</p>
            </div>
            
            {/* The button is now visually separate */}
            <div className="card__footer">
                <button className="btn-primary">Select</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;