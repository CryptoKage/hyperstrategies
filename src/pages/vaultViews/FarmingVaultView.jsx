// src/pages/vaultViews/FarmingVaultView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext'; // To get user's bonus points

// --- Sub-components for a cleaner layout ---
const StatCard = ({ label, value, subtext = null }) => (
    <div className="profile-card">
        <h3>{label}</h3>
        <p className="stat-value-large">{value}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);

const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="countdown-timer">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="timer-segment">
                    <span className="timer-value">{value.toString().padStart(2, '0')}</span>
                    <span className="timer-label">{unit}</span>
                </div>
            ))}
        </div>
    );
};


const FarmingVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    const { vaultInfo } = pageData;
    
    // --- State for our new data ---
    const [buybackStats, setBuybackStats] = useState({ poolBalance: 0, totalBonusPoints: 1 });
    const [farmingProfits, setFarmingProfits] = useState({});
    const [userBonusPoints, setUserBonusPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    // Hardcoded target date for the Q1 buyback
    const Q1_BUYBACK_DATE = "2026-03-31T23:59:59Z";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all necessary data in parallel
                const [buybackRes, profitsRes, dashboardRes] = await Promise.all([
                    api.get('/stats/buyback-pool'),
                    api.get('/stats/farming-profits'),
                    api.get('/dashboard') // Easiest way to get the current user's bonus points
                ]);

                setBuybackStats(buybackRes.data);
                setFarmingProfits(profitsRes.data);
                setUserBonusPoints(dashboardRes.data.totalBonusPoints || 0);

            } catch (err) {
                console.error("Failed to load farming vault data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    // Calculate the user's estimated payout
    const userShare = (buybackStats.totalBonusPoints > 0) ? (userBonusPoints / buybackStats.totalBonusPoints) : 0;
    const estimatedPayout = userShare * buybackStats.poolBalance;

    if (loading) {
        return (
            <div className="vault-detail-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="vault-detail-container">
            <div className="vault-detail-header">
                <h1>{vaultInfo.name}</h1>
                <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
            </div>
            <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
            
            {/* Buyback Countdown Section */}
            <div className="profile-card text-center" style={{ marginBottom: '24px', background: 'var(--color-surface-accent)' }}>
                <h2>Next Bonus Point Buyback</h2>
                <p>Time remaining until the end of Q1:</p>
                <CountdownTimer targetDate={Q1_BUYBACK_DATE} />
            </div>

            {/* User-specific Stats */}
            <div className="vault-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                <StatCard label="Current Buyback Pool" value={`$${buybackStats.poolBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                <StatCard label="Your Bonus Points" value={userBonusPoints.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} />
                <StatCard label="Your Est. Payout" value={`$${estimatedPayout.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext={`Based on your ${ (userShare * 100).toFixed(4) }% share of total points`} />
            </div>

            {/* Monthly Profit History */}
            <div className="admin-card" style={{ marginTop: '32px' }}>
                <h3>Monthly Profits Added to Pool</h3>
                <div className="table-responsive">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th className="amount">Profit Generated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(farmingProfits).length > 0 ? (
                                Object.entries(farmingProfits).map(([month, profit]) => (
                                    <tr key={month}>
                                        <td>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'year' })}</td>
                                        <td className="amount text-positive">+${profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" style={{textAlign: 'center'}}>No profits have been added to the pool yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FarmingVaultView;
