import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import GalaxyCanvas from '../GalaxyCanvas';
import '../../styles/cinematic-3d.css';

const CinematicScrollLayout = ({ sections = [], hero }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef(null);
  const sectionRefs = useRef([]);

  const safeSections = useMemo(() => sections.filter(Boolean), [sections]);

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, safeSections.length);
  }, [safeSections.length]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (safeSections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.sectionIndex || 0);
            if (safeSections.length > 1) {
              setScrollProgress(index / (safeSections.length - 1));
            } else {
              setScrollProgress(0);
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [safeSections.length]);

  const registerSection = (index) => (element) => {
    sectionRefs.current[index] = element;
    if (element) {
      element.dataset.sectionIndex = String(index);
    }
  };

  return (
    <div className="cinematic-3d-shell">
      <div className="cinematic-3d-canvas-container">
        <GalaxyCanvas scrollProgress={scrollProgress} />
      </div>

      <div className="cinematic-3d-overlay">
        {hero && <div className="cinematic-3d-hero">{hero}</div>}
        <div className="cinematic-3d-sections">
          {safeSections.map((section, index) => (
            <section key={section.id || index} ref={registerSection(index)} className="cinematic-3d-section">
              {section.eyebrow && <p className="cinematic-3d-eyebrow">{section.eyebrow}</p>}
              {section.title && <h2>{section.title}</h2>}
              {section.body && <p>{section.body}</p>}

              {Array.isArray(section.chips) && section.chips.length > 0 && (
                <div className="cinematic-3d-chip-row">
                  {section.chips.map((chip) => (
                    <span key={chip} className="cinematic-3d-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {Array.isArray(section.bullets) && section.bullets.length > 0 && (
                <ul className="cinematic-3d-bullets">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={`${section.id || index}-bullet-${bulletIndex}`}>
                      <span className="cinematic-3d-bullet-icon">{bulletIndex + 1}</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.children}

              {Array.isArray(section.actions) && section.actions.length > 0 && (
                <div className="cinematic-3d-actions">
                  {section.actions.map((action) => (
                    <a
                      key={action.label}
                      href={action.href}
                      className={action.variant || 'btn-outline'}
                      target={action.target}
                      rel={action.target === '_blank' ? 'noreferrer' : undefined}
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              )}

              {section.footnote && <p className="cinematic-3d-footnote">{section.footnote}</p>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

CinematicScrollLayout.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      eyebrow: PropTypes.string,
      title: PropTypes.node,
      body: PropTypes.node,
      bullets: PropTypes.arrayOf(PropTypes.node),
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.node.isRequired,
          href: PropTypes.string.isRequired,
          variant: PropTypes.string,
          target: PropTypes.string,
        })
      ),
      footnote: PropTypes.node,
      chips: PropTypes.arrayOf(PropTypes.node),
      children: PropTypes.node,
    })
  ),
  hero: PropTypes.node,
};

export default CinematicScrollLayout;
