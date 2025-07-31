// src/components/CardSection.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CardSection = ({ cards }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="card-section">
      <div className="card-section__wrapper">
        {cards.map((card, idx) => (
          <div key={idx} className="card card--clickable" onClick={() => navigate(card.route)}>
            <div className="card__icon">{card.icon}</div>
            <div className="card__content">
              {/* Note: title and description are already passed in as translated values from Home.jsx */}
              <h3 className="card__title">{card.title}</h3>
              <p className="card__description">{card.description}</p>
            </div>
            <div className="card__footer">
                <button className="btn-primary">{t('card_section.select_button')}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;