import React from 'react';
import '../../styles/how-it-works.css';

const FlowDiagram = ({ data, reducedMotion, ariaLabel, tooltip }) => {
  if (!data) return null;

  return (
    <div
      className={`hiw-flow ${reducedMotion ? 'hiw-flow--static' : ''}`}
      role="img"
      aria-label={ariaLabel || 'Deposit flow diagram'}
    >
      <div className="hiw-flow__column">
        <div className="hiw-flow__node hiw-flow__node--source">
          <span className="hiw-flow__label">{data.depositLabel}</span>
        </div>
      </div>

      <div className="hiw-flow__pipe" aria-hidden="true">
        <div className="hiw-flow__line" />
        {!reducedMotion && <div className="hiw-flow__token" />}
      </div>

      <div className="hiw-flow__column">
        <div className="hiw-flow__node hiw-flow__node--primary">
          <span className="hiw-flow__label">{data.mainFlowLabel}</span>
          <span className="hiw-flow__percent">{data.mainPercent}%</span>
        </div>
        <div className="hiw-flow__branches" role="list">
          {data.sideFlows?.map((flow) => (
            <div className="hiw-flow__branch" role="listitem" key={flow.label}>
              <div className="hiw-flow__branch-line" style={{ backgroundColor: flow.color }} aria-hidden="true" />
              <div className="hiw-flow__branch-card">
                <span className="hiw-flow__branch-label">{flow.label}</span>
                <span className="hiw-flow__branch-percent">{flow.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <p className="hiw-flow__tooltip" role="note">
          <span aria-hidden="true">ⓘ</span>
          <span>{tooltip}</span>
        </p>
      )}
    </div>
  );
};

export default FlowDiagram;
