// src/components/CardSection.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const CardSection = ({ cards }) => {
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    if (card.type === 'link') {
      // Open external links in a new tab
      window.open(card.url, '_blank', 'noopener,noreferrer');
    } else if (card.route) {
      // Navigate to internal routes
      navigate(card.route);
    }
    // Do nothing if it's a 'coming_soon' card
  };

  return (
    <section className="card-section">
      <div className="card-section__wrapper">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`card ${card.type !== 'coming_soon' ? 'card--clickable' : ''}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="card__icon">{card.icon}</div>
            <div className="card__content">
              <h3 className="card__title">{card.title}</h3>
              <p className="card__description">{card.description}</p>
            </div>
            <div className="card__footer">
              <button 
                className={card.type === 'coming_soon' ? 'btn-secondary' : 'btn-primary'}
                disabled={card.type === 'coming_soon'}
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;