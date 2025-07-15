// src/components/InfoModal.jsx

import React from 'react';
import { Accordion, AccordionItem } from './Accordion';

const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">×</button>
        <h2>{title}</h2>
        
        <Accordion>
          <AccordionItem title="🚀 Early Adopter Bonus (Limited Time)">
            <p>To reward our first supporters, we are offering a one-time XP bonus for the first 1000 users who sign up and make their first vault allocation.</p>
            <ul className="reward-list">
              <li><strong>First 150 Users:</strong> 25 XP</li>
              <li><strong>Users 151-250:</strong> 20 XP</li>
              <li><strong>Users 251-500:</strong> 10 XP</li>
              <li><strong>Users 501-1000:</strong> 5 XP</li>
            </ul>
            <p className="disclaimer-text">
              Note: We reserve the right to withhold this bonus from any accounts suspected of violating the spirit of this promotion (e.g., creating multiple accounts).
            </p>
          </AccordionItem>
          
          <AccordionItem title="Capital Allocated: Dynamic">
            <p>You earn 1 XP for every $100 of capital allocated to a vault. This is calculated on the total amount of your allocation.</p>
          </AccordionItem>

          <AccordionItem title="Successful Referral: 50 XP">
            <p>You receive 50 XP when a new user, who signed up with your referral code, makes their first vault allocation. This rewards meaningful conversions.</p>
          </AccordionItem>
          
          <AccordionItem title="Weekly Staking Bonus: Coming Soon">
            <p>A future feature will reward users with XP for every week they keep their capital allocated in a vault, rewarding long-term commitment.</p>
          </AccordionItem>
        </Accordion>
        
        {children}
      </div>
    </div>
  );
};

export default InfoModal;