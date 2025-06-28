import React from 'react';
import { useNavigate } from 'react-router-dom';

const cardData = [
  {
    title: "I just want to be included",
    description: "Join the airdrop — no experience needed.",
    route: "/airdrop",
  },
  {
    title: "I want to use the platform myself",
    description: "For traders, testers, and early builders.",
    route: "/self-serve",
  },
  {
    title: "I want the system to trade for me",
    description: "Managed fund interest — passive investing.",
    route: "/managed",
  },
  {
    title: "I want to invest in the project",
    description: "For pre-seed or seed investors.",
    route: "/investor",
  },
];

const CardSection = () => {
  const navigate = useNavigate();

  return (
    <section style={styles.section}>
      <div style={styles.wrapper}>
        {cardData.map((card, idx) => (
          <div key={idx} className="card" onClick={() => navigate(card.route)} style={{ cursor: 'pointer' }}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <button className="btn-primary" style={{ marginTop: '12px' }}>Select</button>
          </div>
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '40px 24px',
    backgroundColor: '#f3f4f6',
  },
  wrapper: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  }
};

export default CardSection;
