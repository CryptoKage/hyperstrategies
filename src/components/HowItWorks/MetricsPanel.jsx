import React from 'react';
import CountUp from 'react-countup';
import '../../styles/how-it-works.css';

const MetricsPanel = ({ metrics, reducedMotion }) => (
  <div className="hiw-metrics" role="list">
    {metrics.map((metric) => (
      <div className="hiw-metric" key={metric.label} role="listitem">
        <span className="hiw-metric__label">{metric.label}</span>
        <span className="hiw-metric__value">
          {reducedMotion ? metric.value : (
            <CountUp end={metric.value} suffix={metric.suffix || ''} duration={1.6} separator="," />
          )}
        </span>
        {metric.description && <p className="hiw-metric__description">{metric.description}</p>}
      </div>
    ))}
  </div>
);

export default MetricsPanel;
