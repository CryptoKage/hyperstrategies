// src/pages/vaultViews/FarmingVaultView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext'; // To get user's bonus points

// --- Sub-components for a cleaner layout ---
const StatCard = ({ labelKey, value, subtextKey = null, subtextValues = {} }) => {
    const { t } = useTranslation();

    return (
        <div className="profile-card">
            <h3>{t(labelKey)}</h3>
            <p className="stat-value-large">{value}</p>
            {subtextKey && <p className="stat-subtext">{t(subtextKey, subtextValues)}</p>}
        </div>
    );
};

const CountdownTimer = ({ targetDate }) => {
    const { t, i18n } = useTranslation();
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

    const units = ['days', 'hours', 'minutes', 'seconds'];
    const hasTime = units.some(unit => timeLeft[unit] !== undefined);

    return (
        <div className="countdown-timer">
            {hasTime ? (
                units.map(unit => (
                    <div key={unit} className="timer-segment">
                        <span className="timer-value">{(timeLeft[unit] ?? 0).toString().padStart(2, '0')}</span>
                        <span className="timer-label">{t(`common.time.${unit}`)}</span>
                    </div>
                ))
            ) : (
                <span className="timer-label">{t('farmingVault.buybackCountdown.completed')}</span>
            )}
        </div>
    );
};


const FarmingVaultView = ({ pageData }) => {
    const { t, i18n } = useTranslation();
    const { vaultInfo } = pageData;

    // --- State for our new data ---
    const [buybackStats, setBuybackStats] = useState({ poolBalance: 0, totalBonusPoints: 1 });
    const [farmingProfits, setFarmingProfits] = useState({});
    const [userBonusPoints, setUserBonusPoints] = useState(0);
    const [loading, setLoading] = useState(true);

    // Hardcoded target date for the Q1 buyback
    const Q1_BUYBACK_DATE = "2026-01-01T00:00:00Z";

    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
    const currencyFormatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const formatCurrency = (value) =>
        typeof value === 'number'
            ? currencyFormatter.format(value)
            : value;

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
    const formattedPoolBalance = formatCurrency(buybackStats.poolBalance);
    const formattedBonusPoints = typeof userBonusPoints === 'number'
        ? userBonusPoints.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : userBonusPoints;
    const formattedEstimatedPayout = formatCurrency(estimatedPayout);
    const userSharePercent = (userShare * 100).toFixed(4);

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
                <h2>{t('farmingVault.buybackCountdown.title')}</h2>
                <p>{t('farmingVault.buybackCountdown.subtitle')}</p>
                <CountdownTimer targetDate={Q1_BUYBACK_DATE} />
            </div>

            {/* User-specific Stats */}
            <div className="vault-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                <StatCard
                    labelKey="farmingVault.stats.currentBuybackPool"
                    value={formattedPoolBalance}
                />
                <StatCard
                    labelKey="farmingVault.stats.yourBonusPoints"
                    value={formattedBonusPoints}
                />
                <StatCard
                    labelKey="farmingVault.stats.estimatedPayout"
                    value={formattedEstimatedPayout}
                    subtextKey="farmingVault.stats.estimatedPayoutSubtext"
                    subtextValues={{ share: userSharePercent }}
                />
            </div>

            {/* Monthly Profit History */}
            <div className="admin-card" style={{ marginTop: '32px' }}>
                <h3>{t('farmingVault.monthlyProfits.title')}</h3>
                <div className="table-responsive">
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>{t('farmingVault.monthlyProfits.month')}</th>
                                <th className="amount">{t('farmingVault.monthlyProfits.profit')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(farmingProfits).length > 0 ? (
                                Object.entries(farmingProfits).map(([month, profit]) => (
                                    <tr key={month}>
                                        <td>{new Date(`${month}-02`).toLocaleString(locale, { month: 'long', year: 'numeric' })}</td>
                                        <td className="amount text-positive">{`${profit >= 0 ? '+' : ''}${currencyFormatter.format(profit)}`}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" style={{textAlign: 'center'}}>{t('farmingVault.monthlyProfits.empty')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div style={{ marginTop: '32px' }}>
                <h3>{t('farmingVault.activities.title')}</h3>
                <div className="farming-pipeline-grid">
                    <div className="pipeline-column">
                        <h4>{t('farmingVault.activities.activeTitle')}</h4>
                        <div className="protocol-list">
                           {activeFarms.length > 0 ? (
                                activeFarms.map(p => (
                                    <div key={p.protocol_id} className="protocol-card">
                                        <h5>{p.name} ({p.chain})</h5>
                                        <p>{p.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p>{t('farmingVault.activities.noActive')}</p>
                            )}
                        </div>
                    </div>
                    <div className="pipeline-column">
                        <h4>{t('farmingVault.activities.seedingTitle')}</h4>
                        <div className="protocol-list">
                            {seedingFarms.length > 0 ? (
                                seedingFarms.map(p => (
                                    <div key={p.protocol_id} className="protocol-card">
                                        <h5>{p.name} ({p.chain})</h5>
                                        <p>{p.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p>{t('farmingVault.activities.noPipeline')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmingVaultView;
