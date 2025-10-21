import React, { useState } from 'react';
import '../../styles/how-it-works.css';

const FAQAccordion = ({ items, ariaLabels }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items || items.length === 0) {
    return null;
  }

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="hiw-faq" role="region" aria-live="polite">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div className="hiw-faq__item" key={item.q}>
            <button
              type="button"
              className="hiw-faq__trigger"
              id={`faq-trigger-${index}`}
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              aria-label={`${item.q} — ${isOpen ? ariaLabels?.collapse || 'Collapse' : ariaLabels?.expand || 'Expand'}`}
            >
              <span>{item.q}</span>
              <span className="hiw-faq__icon" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-panel-${index}`}
              className="hiw-faq__panel"
              role="region"
              aria-hidden={!isOpen}
              aria-labelledby={`faq-trigger-${index}`}
            >
              {isOpen && <p>{item.a}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
