import React from 'react';
import '../../styles/how-it-works.css';

const SceneNavigation = ({ scenes, activeScene, onJump }) => (
  <nav className="hiw-nav" aria-label="How it works scene navigation">
    <ul>
      {scenes.map((scene, index) => (
        <li key={scene.id}>
          <button
            type="button"
            className={index === activeScene ? 'is-active' : ''}
            onClick={() => onJump(index)}
          >
            <span className="hiw-nav__index">{index + 1}</span>
            <span className="hiw-nav__label">{scene.headline}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default SceneNavigation;
