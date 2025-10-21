import React from 'react';
import '../../styles/how-it-works.css';

const StrategyGrid = ({ strategies }) => (
  <div className="hiw-strategies" role="list">
    {strategies.map((strategy) => (
      <article className="hiw-strategy" key={strategy.id} role="listitem">
        <header className="hiw-strategy__header">
          <h3>{strategy.name}</h3>
          <span className={`hiw-strategy__risk hiw-strategy__risk--${strategy.risk.toLowerCase()}`}>{strategy.risk}</span>
        </header>
        <p>{strategy.short}</p>
        {strategy.badges?.length > 0 && (
          <ul className="hiw-strategy__badges">
            {strategy.badges.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </ul>
        )}
        {strategy.disclaimer && <p className="hiw-strategy__disclaimer">{strategy.disclaimer}</p>}
      </article>
    ))}
  </div>
);

export default StrategyGrid;
