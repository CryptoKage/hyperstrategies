// src/components/Accordion.jsx

import React, { useState } from 'react';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button className="accordion-title" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? '−' : '+'}</span> {title}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

const Accordion = ({ children }) => {
  return <div className="accordion">{children}</div>;
};

// We export both so we can use them like <Accordion><AccordionItem/></Accordion>
export { Accordion, AccordionItem };