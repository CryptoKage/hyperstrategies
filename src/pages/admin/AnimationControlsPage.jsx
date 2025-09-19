import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAnimationSettings } from '../../context/AnimationSettingsContext';

const SectionHeading = ({ title, description }) => (
  <header className="animation-section-header">
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </header>
);

const AnimationControlsPage = () => {
  const { settings, updateSettings, resetSettings, defaultSettings } = useAnimationSettings();
  const [colorInputs, setColorInputs] = useState({
    plasmaPrimary: settings.plasma.primaryColor,
    plasmaSecondary: settings.plasma.secondaryColor,
    networkPoint: settings.network.pointColor,
    networkLine: settings.network.lineColor,
  });

  useEffect(() => {
    setColorInputs({
      plasmaPrimary: settings.plasma.primaryColor,
      plasmaSecondary: settings.plasma.secondaryColor,
      networkPoint: settings.network.pointColor,
      networkLine: settings.network.lineColor,
    });
  }, [
    settings.plasma.primaryColor,
    settings.plasma.secondaryColor,
    settings.network.pointColor,
    settings.network.lineColor,
  ]);

  const handleToggle = (event, key) => {
    updateSettings('general', { [key]: event.target.checked });
  };

  const handleColorPickerChange = (section, key, stateKey) => (event) => {
    const value = event.target.value.toLowerCase();
    setColorInputs((prev) => ({ ...prev, [stateKey]: value }));
    updateSettings(section, { [key]: value });
  };

  const handleColorTextChange = (section, key, stateKey) => (event) => {
    const raw = event.target.value.trim().replace(/[^0-9a-fA-F#]/g, '');
    const withoutHash = raw.replace(/#/g, '').slice(0, 6);
    const value = withoutHash ? `#${withoutHash}` : '#';
    setColorInputs((prev) => ({ ...prev, [stateKey]: value }));

    if (withoutHash.length === 6) {
      updateSettings(section, { [key]: `#${withoutHash.toLowerCase()}` });
    }
  };

  const handleColorInputBlur = (section, key, stateKey) => () => {
    const storedValue = settings[section][key];
    setColorInputs((prev) => ({ ...prev, [stateKey]: storedValue }));
  };

  const handleNumberChange = (section, key) => (event) => {
    const value = event.target.value;
    if (value === '') {
      return;
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      updateSettings(section, { [key]: numericValue });
    }
  };

  const handleRangeChange = (section, key) => (event) => {
    updateSettings(section, { [key]: Number(event.target.value) });
  };

  const resetToDefaults = () => {
    resetSettings();
  };

  const renderNumericControl = ({
    label,
    section,
    keyName,
    min,
    max,
    step,
    helper,
    type = 'number',
  }) => (
    <div className="animation-control">
      <label htmlFor={`${section}-${keyName}`}>{label}</label>
      <input
        id={`${section}-${keyName}`}
        type={type}
        min={min}
        max={max}
        step={step}
        value={settings[section][keyName]}
        onChange={handleNumberChange(section, keyName)}
      />
      {helper && <small>{helper}</small>}
    </div>
  );

  const renderRangeControl = ({
    label,
    section,
    keyName,
    min,
    max,
    step,
    helper,
  }) => (
    <div className="animation-control">
      <div className="animation-control__label">
        <label htmlFor={`${section}-${keyName}-range`}>{label}</label>
        <span>{settings[section][keyName]}</span>
      </div>
      <input
        id={`${section}-${keyName}-range`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={settings[section][keyName]}
        onChange={handleRangeChange(section, keyName)}
      />
      {helper && <small>{helper}</small>}
    </div>
  );

  return (
    <Layout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Animation Controls</h1>
          <div className="admin-header-actions">
            <button className="btn-secondary btn-sm" onClick={resetToDefaults}>
              Reset to Defaults
            </button>
            <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
          </div>
        </div>

        <div className="animation-controls-intro">
          <p>
            Fine tune the ambient plasma field and the interactive mesh background without touching code. Changes are
            stored in your browser so you can experiment freely.
          </p>
        </div>

        <div className="animation-settings-grid">
          <section className="animation-settings-card">
            <SectionHeading
              title="Visibility"
              description="Toggle the background layers on or off if the experience is too bold."
            />
            <div className="animation-control toggle">
              <label htmlFor="toggle-plasma">
                <input
                  id="toggle-plasma"
                  type="checkbox"
                  checked={settings.general.showPlasma}
                  onChange={(event) => handleToggle(event, 'showPlasma')}
                />
                Display plasma canvas
              </label>
            </div>
            <div className="animation-control toggle">
              <label htmlFor="toggle-network">
                <input
                  id="toggle-network"
                  type="checkbox"
                  checked={settings.general.showNetwork}
                  onChange={(event) => handleToggle(event, 'showNetwork')}
                />
                Display interactive mesh
              </label>
            </div>
          </section>

          <section className="animation-settings-card">
            <SectionHeading
              title="Plasma Field"
              description="Control the smooth colour wash behind the site content."
            />
            <div className="animation-color-row">
              <div className="animation-control">
                <label htmlFor="plasma-primary">Primary colour</label>
                <div className="color-input-group">
                  <input
                    id="plasma-primary"
                    type="color"
                    value={settings.plasma.primaryColor}
                    onChange={handleColorPickerChange('plasma', 'primaryColor', 'plasmaPrimary')}
                  />
                  <input
                    type="text"
                    value={colorInputs.plasmaPrimary}
                    onChange={handleColorTextChange('plasma', 'primaryColor', 'plasmaPrimary')}
                    onBlur={handleColorInputBlur('plasma', 'primaryColor', 'plasmaPrimary')}
                    placeholder="#rrggbb"
                  />
                </div>
              </div>
              <div className="animation-control">
                <label htmlFor="plasma-secondary">Secondary colour</label>
                <div className="color-input-group">
                  <input
                    id="plasma-secondary"
                    type="color"
                    value={settings.plasma.secondaryColor}
                    onChange={handleColorPickerChange('plasma', 'secondaryColor', 'plasmaSecondary')}
                  />
                  <input
                    type="text"
                    value={colorInputs.plasmaSecondary}
                    onChange={handleColorTextChange('plasma', 'secondaryColor', 'plasmaSecondary')}
                    onBlur={handleColorInputBlur('plasma', 'secondaryColor', 'plasmaSecondary')}
                    placeholder="#rrggbb"
                  />
                </div>
              </div>
            </div>
            {renderRangeControl({
              label: 'Motion speed',
              section: 'plasma',
              keyName: 'timeScale',
              min: 0.00005,
              max: 0.005,
              step: 0.00005,
              helper: 'Smaller values slow the animation; larger values speed it up.',
            })}
            {renderRangeControl({
              label: 'Detail level',
              section: 'plasma',
              keyName: 'noiseScale',
              min: 0.001,
              max: 0.02,
              step: 0.001,
              helper: 'Lower values create smoother gradients; higher values add more texture.',
            })}
            {renderNumericControl({
              label: 'Canvas height ratio',
              section: 'plasma',
              keyName: 'heightRatio',
              min: 0.1,
              max: 1,
              step: 0.05,
              helper: 'Percentage of viewport height used by the plasma canvas.',
            })}
            {renderNumericControl({
              label: 'Render scaling factor',
              section: 'plasma',
              keyName: 'scalingFactor',
              min: 1,
              max: 32,
              step: 1,
              helper: 'Higher values improve performance at the cost of sharpness.',
            })}
          </section>

          <section className="animation-settings-card">
            <SectionHeading
              title="Interactive Mesh"
              description="Adjust the constellation of nodes and linking lines."
            />
            <div className="animation-color-row">
              <div className="animation-control">
                <label htmlFor="network-point-colour">Point colour</label>
                <div className="color-input-group">
                  <input
                    id="network-point-colour"
                    type="color"
                    value={settings.network.pointColor}
                    onChange={handleColorPickerChange('network', 'pointColor', 'networkPoint')}
                  />
                  <input
                    type="text"
                    value={colorInputs.networkPoint}
                    onChange={handleColorTextChange('network', 'pointColor', 'networkPoint')}
                    onBlur={handleColorInputBlur('network', 'pointColor', 'networkPoint')}
                    placeholder="#rrggbb"
                  />
                </div>
              </div>
              <div className="animation-control">
                <label htmlFor="network-line-colour">Line colour</label>
                <div className="color-input-group">
                  <input
                    id="network-line-colour"
                    type="color"
                    value={settings.network.lineColor}
                    onChange={handleColorPickerChange('network', 'lineColor', 'networkLine')}
                  />
                  <input
                    type="text"
                    value={colorInputs.networkLine}
                    onChange={handleColorTextChange('network', 'lineColor', 'networkLine')}
                    onBlur={handleColorInputBlur('network', 'lineColor', 'networkLine')}
                    placeholder="#rrggbb"
                  />
                </div>
              </div>
            </div>
            {renderRangeControl({
              label: 'Point opacity',
              section: 'network',
              keyName: 'pointOpacity',
              min: 0,
              max: 1,
              step: 0.05,
              helper: 'Adjust how prominent each node appears.',
            })}
            {renderRangeControl({
              label: 'Line opacity',
              section: 'network',
              keyName: 'maxLineOpacity',
              min: 0,
              max: 1,
              step: 0.05,
              helper: 'Set the maximum opacity for connecting lines.',
            })}
            {renderRangeControl({
              label: 'Animation speed',
              section: 'network',
              keyName: 'speed',
              min: 0.02,
              max: 0.6,
              step: 0.01,
              helper: 'Controls how quickly the points drift.',
            })}
            {renderRangeControl({
              label: 'Connection distance',
              section: 'network',
              keyName: 'connectionDistance',
              min: 60,
              max: 400,
              step: 10,
              helper: 'Maximum distance between points before a line is drawn.',
            })}
            {renderNumericControl({
              label: 'Point density divisor',
              section: 'network',
              keyName: 'pointDensity',
              min: 5000,
              max: 80000,
              step: 1000,
              helper: 'Lower numbers create more points (and lines).',
            })}
            {renderNumericControl({
              label: 'Point size (px)',
              section: 'network',
              keyName: 'pointSize',
              min: 0.5,
              max: 6,
              step: 0.1,
              helper: 'Radius of each node rendered in the mesh.',
            })}
            {renderNumericControl({
              label: 'Line width (px)',
              section: 'network',
              keyName: 'lineWidth',
              min: 0.5,
              max: 3,
              step: 0.1,
              helper: 'Thickness of each connecting line.',
            })}
            {renderRangeControl({
              label: 'Background blur (px)',
              section: 'network',
              keyName: 'backgroundBlur',
              min: 0,
              max: 10,
              step: 0.5,
              helper: 'Soften the mesh to make foreground content pop.',
            })}
          </section>
        </div>

        <div className="animation-controls-footer">
          <p>
            Looking for a clean slate? Click <strong>Reset to Defaults</strong> to restore the original configuration at any
            time. Settings are stored locally and do not impact other administrators.
          </p>
          <p className="animation-controls-footnote">
            Default plasma colours: <code>{defaultSettings.plasma.primaryColor}</code> and{' '}
            <code>{defaultSettings.plasma.secondaryColor}</code>. Mesh defaults use <code>{defaultSettings.network.pointColor}</code>{' '}
            for points and <code>{defaultSettings.network.lineColor}</code> for lines.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AnimationControlsPage;
