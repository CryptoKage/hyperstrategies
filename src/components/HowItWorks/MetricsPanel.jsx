import React from 'react';
import CountUp from 'react-countup';
import '../../styles/how-it-works.css';

const MetricsPanel = ({ metrics, reducedMotion, labelMap, tooltips, legend, chartAriaLabel }) => (
  <div className="hiw-metrics-block">
    <div className="hiw-metrics" role="list" aria-label={chartAriaLabel}>
      {metrics.map((metric) => {
        const label = labelMap?.[metric.key] || metric.label || metric.key;
        const tooltipText = metric.tooltipKey && tooltips?.[metric.tooltipKey];
        return (
          <div className="hiw-metric" key={metric.key || label} role="listitem">
            <span className="hiw-metric__label">
              {label}
              {tooltipText && (
                <span
                  className="hiw-metric__tooltip"
                  aria-label={tooltipText}
                  role="note"
                  title={tooltipText}
                >
                  ⓘ
                </span>
              )}
            </span>
            <span className="hiw-metric__value">
              {metric.prefix && <span className="hiw-metric__prefix">{metric.prefix}</span>}
              {reducedMotion ? (
                metric.value
              ) : (
                <CountUp
                  end={metric.value}
                  suffix={metric.suffix || ''}
                  duration={1.6}
                  separator="," 
                  decimals={metric.decimals || 0}
                />
              )}
            </span>
            {metric.description && <p className="hiw-metric__description">{metric.description}</p>}
          </div>
        );
      })}
    </div>

    {legend && legend.length > 0 && (
      <ul className="hiw-chart-legend" aria-label="Chart legend">
        {legend.map((item) => (
          <li key={item.key}>
            <span className="hiw-chart-legend__swatch" aria-hidden="true" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default MetricsPanel;
