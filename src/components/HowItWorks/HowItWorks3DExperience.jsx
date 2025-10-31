import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CinematicScrollLayout from '../ThreeD/CinematicScrollLayout';

const HowItWorks3DExperience = ({ scenes = [] }) => {
  const { t } = useTranslation();

  const sections = useMemo(
    () =>
      [
        {
          id: 'routing',
          eyebrow: t('howItWorks3d.routing.eyebrow', { defaultValue: 'Flow routing' }),
          title: t('howItWorks3d.routing.title', {
            defaultValue: 'Deposits stream through orchestrated pathways',
          }),
          body: t('howItWorks3d.routing.body', {
            defaultValue:
              'Capital is segmented between active strategies, farming reserves, and protective buffers. The allocation engine adapts as market conditions and treasury mandates shift.',
          }),
          bullets: scenes.slice(1, 3).map((scene) => scene?.headline).filter(Boolean),
          footnote: t('howItWorks3d.routing.footnote', {
            defaultValue: 'Allocations respond dynamically to risk signals and live liquidity constraints.',
          }),
        },
        {
          id: 'automation',
          eyebrow: t('howItWorks3d.automation.eyebrow', { defaultValue: 'Adaptive automation' }),
          title: t('howItWorks3d.automation.title', {
            defaultValue: 'Scenario-aware execution keeps strategies hedged',
          }),
          body: t('howItWorks3d.automation.body', {
            defaultValue:
              'Signals, sizing, and hedges are coordinated inside a disciplined control loop. Manual overrides stay available when markets dislocate, keeping depositor capital guarded.',
          }),
          bullets: scenes
            .slice(3, 5)
            .map((scene) => scene?.headline || scene?.body)
            .filter(Boolean),
          chips: [
            t('howItWorks3d.automation.chips.guardrails', {
              defaultValue: 'Programmatic guardrails',
            }),
            t('howItWorks3d.automation.chips.telemetry', {
              defaultValue: 'Live telemetry',
            }),
            t('howItWorks3d.automation.chips.stopLoss', {
              defaultValue: 'Hedged stop-lossing',
            }),
          ],
        },
        {
          id: 'community',
          eyebrow: t('howItWorks3d.community.eyebrow', { defaultValue: 'Community rewards' }),
          title: t('howItWorks3d.community.title', {
            defaultValue: 'Transparent reporting fuels aligned incentives',
          }),
          body: t('howItWorks3d.community.body', {
            defaultValue:
              'Dashboards surface realized and unrealized performance, XP boosts, and governance scorecards. Contributors earn protocol revenue share when their efforts expand deposits responsibly.',
          }),
          bullets: scenes
            .slice(6, 8)
            .map((scene) => scene?.body)
            .filter(Boolean),
          actions: [
            {
              label: t('howItWorks3d.community.docs', { defaultValue: 'Open the docs' }),
              href: 'https://hs0-3.gitbook.io/hs-docs/',
              variant: 'btn-outline',
              target: '_blank',
            },
            {
              label: t('howItWorks3d.community.join', { defaultValue: 'Join the investor queue' }),
              href: '/investor',
              variant: 'btn-primary',
            },
          ],
        },
      ],
    [scenes, t]
  );

  const hero = (
    <>
      <span className="cinematic-3d-eyebrow">
        {t('howItWorks3d.hero.eyebrow', { defaultValue: 'Immersive walkthrough' })}
      </span>
      <h1>
        {t('howItWorks3d.hero.title', {
          defaultValue: 'Explore Hyper Strategies in cinematic 3D',
        })}
      </h1>
      <p>
        {t('howItWorks3d.hero.body', {
          defaultValue:
            'Switch into the 3D cockpit to see how deposits, risk controls, and rewards coordinate. Scroll through each layer while the galaxy of strategies responds in real time.',
        })}
      </p>
      <div className="cinematic-3d-actions">
        <a href="/register" className="btn-primary">
          {t('cta.connect')}
        </a>
        <a href="/faq" className="btn-outline">
          {t('howItWorks3d.hero.faq', { defaultValue: 'Common questions' })}
        </a>
      </div>
    </>
  );

  return <CinematicScrollLayout sections={sections} hero={hero} />;
};

export default HowItWorks3DExperience;
