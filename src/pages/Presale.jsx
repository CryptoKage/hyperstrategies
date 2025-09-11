// ==============================================================================
// START: PASTE THIS ENTIRE BLOCK into your src/pages/Presale.jsx FILE
// ==============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

// Import the shadcn/ui components we installed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import { PieChart, Pie, Cell, Label } from 'recharts';

// --- Tokenomics Data ---
const tokenomicsData = [
  { stage: 'Seed A', value: 30, fill: 'hsl(var(--primary))' },
  { stage: 'Seed B', value: 30, fill: 'hsl(var(--primary) / 0.8)' },
  { stage: 'Private', value: 10, fill: 'hsl(var(--primary) / 0.6)' },
  { stage: 'Public', value: 30, fill: 'hsl(var(--primary) / 0.4)' },
];

const chartConfig = {
  value: { label: 'Percentage' },
  'Seed A': { label: 'Seed A', color: 'hsl(var(--primary))' },
  'Seed B': { label: 'Seed B', color: 'hsl(var(--primary) / 0.8)' },
  'Private': { label: 'Private', color: 'hsl(var(--primary) / 0.6)' },
  'Public': { label: 'Public', color: 'hsl(var(--primary) / 0.4)' },
};

const Presale = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [eligibility, setEligibility] = useState({ isEligible: false, currentXp: 0, xpRequired: 1000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch eligibility if the user is logged in
    if (user) {
      api.get('/user/presale-eligibility')
        .then(res => setEligibility(res.data))
        .catch(err => console.error("Failed to fetch eligibility", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const xpNeeded = useMemo(() => {
    return Math.max(0, eligibility.xpRequired - eligibility.currentXp);
  }, [eligibility]);

  const renderBuyButton = () => {
    if (!user) {
      return <Link to="/login" className="btn-primary">Login to Participate</Link>;
    }
    if (loading) {
      return <button className="btn-primary" disabled>Checking Eligibility...</button>;
    }
    if (eligibility.isEligible) {
      return <button className="btn-primary">Buy Now (Coming Soon)</button>;
    }
    return (
      <button className="btn-primary" disabled title={`You need ${xpNeeded.toLocaleString()} more XP`}>
        You need {xpNeeded.toLocaleString()} more XP
      </button>
    );
  };
  
  return (
    <Layout>
      <div className="presale-container">
        <h1>Platform Token Presale</h1>
        <p className="presale-subtitle">Your XP balance determines your eligibility and allocation. Secure your spot in the future of HyperStrategies.</p>

        {/* --- Segmented Progress Bar --- */}
        <Card>
          <CardHeader>
            <CardTitle>Sale Progress</CardTitle>
            <CardDescription>Current Stage: Seed A (30% Filled)</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={30} />
          </CardContent>
        </Card>

        <div className="presale-grid">
          {/* --- Tokenomics Card --- */}
          <Card>
            <CardHeader>
              <CardTitle>Tokenomics</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="stage" hideLabel />} />
                  <Pie data={tokenomicsData} dataKey="value" nameKey="stage" innerRadius={60}>
                    {tokenomicsData.map((entry) => ( <Cell key={entry.stage} fill={entry.fill} /> ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy - 10} className="fill-foreground text-2xl font-bold">1B</tspan>
                              <tspan x={viewBox.cx} y={viewBox.cy + 10} className="fill-muted-foreground">Total Supply</tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* --- Buy/Eligibility Card --- */}
          <Card className="flex flex-col justify-center items-center">
            <CardHeader>
              <CardTitle>Participate in the Presale</CardTitle>
              <CardDescription>Requires {eligibility.xpRequired.toLocaleString()} XP</CardDescription>
            </CardHeader>
            <CardContent className="w-full text-center">
              {renderBuyButton()}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Presale;
