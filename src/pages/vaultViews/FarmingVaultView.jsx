// src/pages/vaultViews/FarmingVaultView.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import VaultModal from '../../components/VaultModal';
import api from '../../api/api';

const StatCard = ({ label, value, subtext = null }) => (
    <div className="profile-card">
        <h3>{label}</h3>
        <p className="stat-value-large">{value}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);

const FarmingVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    const { vaultInfo, userPosition, farmingProtocols = [], vaultStats } = pageData;

    const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null); // State to hold data for the modal

    const isInvested = userPosition && userPosition.principal > 0;

    // Calculate User Ownership for display
    const vaultTotalPrincipal = vaultStats?.totalPrincipal || 1;
    const userOwnershipPct = isInvested ? (userPosition.principal / vaultTotalPrincipal) * 100 : 0;
    const harvestableCapital = isInvested ? userPosition.realizedPnl : 0;

    // Filter protocols into their pipeline stages
    const seeding = farmingProtocols.filter(p => p.status === 'SEEDING');
    const farming = farmingProtocols.filter(p => p.status === 'FARMING');
    const reaped = farmingProtocols.filter(p => p.status === 'REAPED' || p.has_rewards);

    // --- THIS IS THE FIX ---
    // Function to fetch necessary data right before opening the modal
    const handleOpenInvestModal = async () => {
        try {
            // We need the user's available balance and tier for the modal.
            // The main dashboard endpoint is the easiest way to get this.
            const response = await api.get('/dashboard');
            setModalData(response.data); // Store this data
            setAllocateModalOpen(true); // Then open the modal
        } catch (error) {
            console.error("Could not load data for investment modal", error);
            // Optionally, show an error to the user with a toast notification
        }
    };
    // --- END OF FIX ---

    return (
        <Layout>
            <div className="vault-detail-container">
                <div className="vault-detail-header">
                    <h1>{vaultInfo.name}</h1>
                    <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
                </div>
                <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
                
                {!isInvested && (
                    <div className="profile-card text-center" style={{ marginBottom: '24px' }}>
                        <h2>Ready to Start Farming?</h2>
                        <p>Invest now to get exposure to the activities below and a share of future rewards.</p>
                        <div style={{ marginTop: '24px' }}>
                            <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={handleOpenInvestModal}>
                                Invest Now
                            </button>
                        </div>
                    </div>
                )}

                {isInvested && (
                    <div className="vault-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                        <StatCard label="Your Total Capital" value={`$${userPosition.totalCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                        <StatCard label="Your Ownership Share" value={`${userOwnershipPct.toFixed(4)}%`} />
                        <StatCard label="Harvestable Capital" value={`$${harvestableCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="Realized profits from airdrops" />
                    </div>
                )}
                
                <div className="farming-pipeline-grid" style={{ marginTop: '32px' }}>
                    <div className="pipeline-column">
                        <h3>Actively Farming ({farming.length})</h3>
                        <div className="protocol-list">
                            {farming.length > 0 ? farming.map(p => <div key={p.protocol_id} className="protocol-card"><h4>{p.name} ({p.chain})</h4><p>{p.description}</p></div>) : <p className="text-muted">No protocols are being actively farmed.</p>}
                        </div>
                    </div>
                    <div className="pipeline-column">
                        <h3>On the Radar ({seeding.length})</h3>
                        <div className="protocol-list">
                            {seeding.length > 0 ? seeding.map(p => <div key={p.protocol_id} className="protocol-card"><h4>{p.name} ({p.chain})</h4><p>{p.description}</p></div>) : <p className="text-muted">No protocols are in the research phase.</p>}
                        </div>
                    </div>
                    <div className="pipeline-column">
                        <h3>Past Harvests ({reaped.length})</h3>
                        <div className="protocol-list">
                            {reaped.length > 0 ? reaped.map(p => (
                                <div key={p.protocol_id} className="protocol-card">
                                    <h4>{p.name}</h4>
                                    <div className="reaped-info">${parseFloat(p.rewards_realized_usd).toLocaleString()}</div>
                                </div>
                            )) : <p className="text-muted">No rewards have been harvested yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {modalData && (
                <VaultModal
                    isOpen={isAllocateModalOpen}
                    onClose={() => setAllocateModalOpen(false)}
                    vault={vaultInfo}
                    availableBalance={modalData.availableBalance}
                    userTier={modalData.accountTier}
                    onAllocationSuccess={() => window.location.reload()}
                />
            )}
        </Layout>
    );
};

export default FarmingVaultView;
