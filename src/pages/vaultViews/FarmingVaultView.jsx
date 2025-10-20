// src/pages/vaultViews/FarmingVaultView.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import VaultModal from '../../components/VaultModal';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner'; // Import a loading spinner

const StatCard = ({ label, value, subtext = null }) => (
    <div className="profile-card">
        <h3>{label}</h3>
        <p className="stat-value-large">{value}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
    </div>
);

// --- NEW: Protocol Card component for a cleaner UI ---
const ProtocolCard = ({ protocol, userStatus }) => {
    let statusIndicator;
    switch (userStatus) {
        case 'Currently Farming':
            statusIndicator = <span className="status-badge status-active">You're Farming This</span>;
            break;
        case 'Contributed':
            statusIndicator = <span className="status-badge status-completed">You Contributed</span>;
            break;
        default:
            statusIndicator = null;
    }

    return (
        <div className="protocol-card">
            <h4>{protocol.name} {protocol.chain && `(${protocol.chain})`}</h4>
            {statusIndicator}
            {protocol.description && <p>{protocol.description}</p>}
            {protocol.status === 'REAPED' && (
                <div className="reaped-info">
                    Harvested: ${parseFloat(protocol.rewards_realized_usd || 0).toLocaleString()}
                </div>
            )}
        </div>
    );
};


const FarmingVaultView = ({ pageData }) => {
    const { t } = useTranslation();
    const { vaultInfo, userPosition, vaultStats, dashboardData } = pageData; // Get dashboardData from parent

    const [isAllocateModalOpen, setAllocateModalOpen] = useState(false);
    
    // --- NEW: State for user's specific farming status ---
    const [userFarmingStatus, setUserFarmingStatus] = useState([]);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    const isInvested = userPosition && userPosition.principal > 0;
    const vaultTotalPrincipal = vaultStats?.totalPrincipal || 1;
    const userOwnershipPct = isInvested ? (userPosition.principal / vaultTotalPrincipal) * 100 : 0;
    
    // Fetch user's specific farming status when the component loads
    useEffect(() => {
        setIsLoadingStatus(true);
        api.get(`/farming/${vaultInfo.vault_id}/my-status`)
            .then(res => {
                setUserFarmingStatus(res.data);
            })
            .catch(err => {
                console.error("Could not load user farming status", err);
                // Optionally show an error
            })
            .finally(() => {
                setIsLoadingStatus(false);
            });
    }, [vaultInfo.vault_id]);


    // --- Combine protocol data with user-specific status ---
    const protocolsWithStatus = (pageData.farmingProtocols || []).map(protocol => {
        const userStatusInfo = userFarmingStatus.find(s => s.protocolId === protocol.protocol_id);
        return {
            ...protocol,
            userStatus: userStatusInfo ? userStatusInfo.userStatus : "Not Involved",
        };
    });

    const seeding = protocolsWithStatus.filter(p => p.status === 'SEEDING');
    const farming = protocolsWithStatus.filter(p => p.status === 'FARMING');
    const reaped = protocolsWithStatus.filter(p => p.status === 'REAPED');

    return (
        <Layout>
            <div className="vault-detail-container">
                <div className="vault-detail-header">
                    <h1>{vaultInfo.name}</h1>
                    <Link to="/dashboard" className="btn-secondary btn-sm">← {t('common.backToDashboard')}</Link>
                </div>
                <p className="vault-detail-subtitle">{vaultInfo.strategy_description || vaultInfo.description}</p>
                
                {/* Simplified "Invest Now" button */}
                <div className="vault-actions">
                    <button className="btn-primary" onClick={() => setAllocateModalOpen(true)}>
                        {isInvested ? 'Invest More' : 'Invest Now'}
                    </button>
                    {isInvested && (
                         <button className="btn-secondary">Request Withdrawal</button> // Placeholder
                    )}
                </div>

                {isInvested && (
                    <div className="vault-detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                        <StatCard label="Your Total Capital" value={`$${userPosition.totalCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} />
                        <StatCard label="Your Ownership Share" value={`${userOwnershipPct.toFixed(4)}%`} />
                    </div>
                )}
                
                <div className="farming-pipeline-grid" style={{ marginTop: '32px' }}>
                    <div className="pipeline-column">
                        <h3>Actively Farming ({farming.length})</h3>
                        {isLoadingStatus ? <LoadingSpinner/> : (
                            <div className="protocol-list">
                                {farming.length > 0 ? farming.map(p => <ProtocolCard key={p.protocol_id} protocol={p} userStatus={p.userStatus} />) : <p className="text-muted">No protocols are being actively farmed.</p>}
                            </div>
                        )}
                    </div>
                    <div className="pipeline-column">
                        <h3>On the Radar ({seeding.length})</h3>
                         {isLoadingStatus ? <LoadingSpinner/> : (
                            <div className="protocol-list">
                                {seeding.length > 0 ? seeding.map(p => <ProtocolCard key={p.protocol_id} protocol={p} userStatus={p.userStatus} />) : <p className="text-muted">No protocols are in the research phase.</p>}
                            </div>
                        )}
                    </div>
                    <div className="pipeline-column">
                        <h3>Past Harvests ({reaped.length})</h3>
                         {isLoadingStatus ? <LoadingSpinner/> : (
                            <div className="protocol-list">
                                {reaped.length > 0 ? reaped.map(p => <ProtocolCard key={p.protocol_id} protocol={p} userStatus={p.userStatus} />) : <p className="text-muted">No rewards have been harvested yet.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal now gets its data from the main pageData prop */}
            {dashboardData && (
                <VaultModal
                    isOpen={isAllocateModalOpen}
                    onClose={() => setAllocateModalOpen(false)}
                    vault={vaultInfo}
                    availableBalance={dashboardData.availableBalance}
                    userTier={dashboardData.accountTier}
                    onAllocationSuccess={() => window.location.reload()}
                />
            )}
        </Layout>
    );
};

export default FarmingVaultView;
