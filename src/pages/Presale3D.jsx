import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import CinematicScrollLayout from '../components/ThreeD/CinematicScrollLayout';

const Presale3D = () => {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        id: 'ease-of-use',
        eyebrow: t('presale3d.ease.eyebrow', { defaultValue: 'Ease of use' }),
        title: t('presale3d.ease.title', {
          defaultValue: 'A hedged fund experience without the learning curve',
        }),
        body: t('presale3d.ease.body', {
          defaultValue:
            'HedgeFund-as-a-Service orchestration handles custody, automation, and reporting. Depositors tap into discretionary and quantitative desks with intuitive controls designed for everyday operators.',
        }),
        chips: [
          t('presale3d.ease.chips.autopilot', { defaultValue: 'Autopilot deposits' }),
          t('presale3d.ease.chips.riskDesk', { defaultValue: 'Live risk desk' }),
          t('presale3d.ease.chips.reporting', { defaultValue: 'Instant reporting' }),
        ],
        bullets: [
          t('presale3d.ease.bullets.streamlined', {
            defaultValue: 'Streamlined onboarding from KYC to first deposit in minutes.',
          }),
          t('presale3d.ease.bullets.guardrails', {
            defaultValue: 'Smart guardrails rebalance positions and keep drawdowns contained.',
          }),
          t('presale3d.ease.bullets.visibility', {
            defaultValue: 'Every trade ladder, fee schedule, and treasury movement stays visible.',
          }),
        ],
      },
      {
        id: 'token-utility',
        eyebrow: t('presale3d.token.eyebrow', { defaultValue: 'Token utility' }),
        title: t('presale3d.token.title', {
          defaultValue: 'Holding the token unlocks USDC dividends',
        }),
        body: t('presale3d.token.body', {
          defaultValue:
            'Protocol revenues from performance, automation, and partner desks cycle back to token holders. Vault outcomes settle in USDC and are streamed directly to verified wallets on a predictable cadence.',
        }),
        chips: [
          t('presale3d.token.chips.dividends', { defaultValue: 'USDC dividend claims' }),
          t('presale3d.token.chips.buybacks', { defaultValue: 'Programmed buy-backs' }),
          t('presale3d.token.chips.voting', { defaultValue: 'Governance alignment' }),
        ],
        bullets: [
          t('presale3d.token.bullets.hurdle', {
            defaultValue: 'Dividends accrue only after clearing the high-water mark and safety buffers.',
          }),
          t('presale3d.token.bullets.claim', {
            defaultValue: 'Claim windows are handled on-chain with one-click receipts from the dashboard.',
          }),
          t('presale3d.token.bullets.partners', {
            defaultValue: 'Strategic partner flows amplify rewards through syndicate multipliers.',
          }),
        ],
        actions: [
          {
            label: t('presale3d.token.actions.learnMore', { defaultValue: 'Learn about revenue share' }),
            href: 'https://hs0-3.gitbook.io/hs-docs/',
            variant: 'btn-outline',
            target: '_blank',
          },
        ],
      },
      {
        id: 'participate',
        eyebrow: t('presale3d.participate.eyebrow', { defaultValue: 'Participate' }),
        title: t('presale3d.participate.title', {
          defaultValue: 'Your path into the presale cockpit',
        }),
        body: t('presale3d.participate.body', {
          defaultValue:
            'Reserve an allocation, connect a wallet, and monitor tranche unlocks in one motion. The 3D timeline keeps milestones and compliance steps impossible to miss.',
        }),
        bullets: [
          t('presale3d.participate.bullets.reserve', {
            defaultValue: '1. Reserve your allocation and complete eligibility checks.',
          }),
          t('presale3d.participate.bullets.connect', {
            defaultValue: '2. Connect a wallet to receive vault receipts and upcoming dividends.',
          }),
          t('presale3d.participate.bullets.track', {
            defaultValue: '3. Track unlock schedules and reinvest directly from the same interface.',
          }),
        ],
        actions: [
          {
            label: t('presale3d.participate.actions.register', { defaultValue: 'Register for presale access' }),
            href: '/register',
            variant: 'btn-primary',
          },
          {
            label: t('presale3d.participate.actions.dashboard', { defaultValue: 'Preview presale dashboard' }),
            href: '/presale-info',
            variant: 'btn-outline',
          },
        ],
        footnote: t('presale3d.participate.footnote', {
          defaultValue: 'Availability depends on jurisdictional compliance and on-chain verification.',
        }),
      },
    ],
    [t]
  );

  const hero = (
    <>
      <span className="cinematic-3d-eyebrow">
        {t('presale3d.hero.eyebrow', { defaultValue: 'Presale flight deck' })}
      </span>
      <h1>
        {t('presale3d.hero.title', {
          defaultValue: 'Glide through the Hyper Strategies presale in 3D',
        })}
      </h1>
      <p>
        {t('presale3d.hero.body', {
          defaultValue:
            'Experience how allocations unlock, how hedged vaults operate, and how dividends accumulate — all inside a cinematic control room built for serious operators.',
        })}
      </p>
      <div className="cinematic-3d-actions">
        <a href="/presale-info" className="btn-outline">
          {t('presale3d.hero.ctaRounds', { defaultValue: 'View round details' })}
        </a>
        <a href="/login" className="btn-primary">
          {t('presale3d.hero.ctaLogin', { defaultValue: 'Log in to participate' })}
        </a>
      </div>
    </>
  );

  return (
    <Layout showInteractiveBackground={false}>
      <CinematicScrollLayout sections={sections} hero={hero} />
    </Layout>
  );
};

export default Presale3D;
