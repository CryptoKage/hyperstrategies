import React from 'react';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

// Placeholder data - TODO: replace with real API data
const sampleWeights = [
  { asset: 'BTC', weight: 60 },
  { asset: 'ETH', weight: 20 },
  { asset: 'SOL', weight: 20 },
];

const sampleChart = [
  { time: 'Day 1', btc: 1, eth: 1, sol: 1, pnl: 1 },
  { time: 'Day 2', btc: 1.05, eth: 1.02, sol: 1.1, pnl: 1.07 },
  { time: 'Day 3', btc: 1.1, eth: 1.04, sol: 1.2, pnl: 1.12 },
];

const chartConfig = {
  btc: { label: 'BTC', color: '#f7931a' },
  eth: { label: 'ETH', color: '#627eea' },
  sol: { label: 'SOL', color: '#66f' },
  pnl: { label: 'PnL', color: '#00c853' },
};

const sampleTrades = [
  // TODO: Replace with actual completed trade data
  // { date: '2024-01-01', amount: 100, result: 'Compounded 2%' }
];

const Vault1Page = () => {
  return (
    <Layout>
      <div className="vault1-page">
        <h1>Vault 1 Information</h1>

        <section>
          <h2>User Money Route</h2>
          <p>
            When you deposit into the vault your funds remain in USDC until they are
            bridged and a position is taken.
            {/* TODO: verify flow details */}
          </p>
        </section>

        <section>
          <h2>Portfolio Weights</h2>
          <ul>
            {sampleWeights.map((w) => (
              <li key={w.asset}>{w.asset}: {w.weight}%</li>
            ))}
          </ul>
          {/* TODO: show user-specific weights and deposit */}
        </section>

        <section>
          <h2>Vault Performance</h2>
          <ChartContainer config={chartConfig} className="w-full h-[300px]">
            <LineChart data={sampleChart}>
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="btc" stroke="var(--color-btc)" strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="eth" stroke="var(--color-eth)" strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="sol" stroke="var(--color-sol)" strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="pnl" stroke="var(--color-pnl)" dot={false} />
            </LineChart>
          </ChartContainer>
          {/* TODO: fetch live prices and real PnL */}
        </section>

        <section>
          <h2>Completed Trades</h2>
          {sampleTrades.length === 0 ? (
            <p>No completed trades yet.</p>
          ) : (
            <ul>
              {sampleTrades.map((t, i) => (
                <li key={i}>{t.date}: ${t.amount} - {t.result}</li>
              ))}
            </ul>
          )}
          {/* TODO: display actual trade history */}
        </section>
      </div>
    </Layout>
  );
};

export default Vault1Page;
