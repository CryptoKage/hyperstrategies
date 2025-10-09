// src/pages/admin/FarmingPipelinePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// A sub-component for a single protocol card
const ProtocolCard = ({ protocol, onMove, onReap }) => {
    return (
        <div className="protocol-card">
            <h4>{protocol.name} ({protocol.chain})</h4>
            <p>{protocol.description}</p>
            <div className="protocol-card-footer">
                {protocol.status === 'SEEDING' && (
                    <button onClick={() => onMove(protocol.protocol_id, 'FARMING')} className="btn-secondary btn-sm">Move to Farming</button>
                )}
                {protocol.status === 'FARMING' && (
                    <button onClick={() => onReap(protocol)} className="btn-positive btn-sm">Log Rewards (Reap)</button>
                )}
                {protocol.status === 'REAPED' && (
                     <span className="reaped-info">Reaped: ${parseFloat(protocol.rewards_realized_usd).toLocaleString()}</span>
                )}
            </div>
        </div>
    );
};


const FarmingPipelinePage = () => {
    const [vaults, setVaults] = useState([]);
    const [selectedVaultId, setSelectedVaultId] = useState('');
    const [protocols, setProtocols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the "Add New" form
    const [newProtocol, setNewProtocol] = useState({ name: '', chain: 'ETHEREUM', description: '', has_token: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch all vaults that are of type 'FARMING'
    const fetchFarmingVaults = useCallback(async () => {
        try {
            const response = await api.get('/dashboard');
            const farmingVaults = response.data.vaults.filter(v => v.vault_type === 'FARMING' && v.status === 'active');
            setVaults(farmingVaults);
            if (farmingVaults.length > 0) {
                setSelectedVaultId(farmingVaults[0].vault_id);
            }
        } catch (err) {
            setError('Could not fetch list of farming vaults.');
        }
    }, []);

    // Fetch the pipeline data for the selected vault
    const fetchPipeline = useCallback(async () => {
        if (!selectedVaultId) {
            setProtocols([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // NOTE: We need a new backend endpoint for this. Let's build it next.
            const response = await api.get(`/admin/farming-protocols?vaultId=${selectedVaultId}`);
            setProtocols(response.data);
        } catch (err) {
            setError('Could not fetch pipeline data for this vault.');
        } finally {
            setLoading(false);
        }
    }, [selectedVaultId]);

    useEffect(() => { fetchFarmingVaults(); }, [fetchFarmingVaults]);
    useEffect(() => { fetchPipeline(); }, [fetchPipeline]);

    const handleAddNewProtocol = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/admin/farming-protocols', { vaultId: selectedVaultId, ...newProtocol });
            setNewProtocol({ name: '', chain: 'ETHEREUM', description: '', has_token: false });
            fetchPipeline(); // Refresh the list
        } catch (err) {
            alert('Failed to add protocol.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMoveProtocol = async (protocolId, newStatus) => {
        try {
            await api.patch(`/admin/farming-protocols/${protocolId}/status`, { newStatus });
            fetchPipeline();
        } catch (err) {
            alert('Failed to update protocol status.');
        }
    };

    const handleReapRewards = async (protocol) => {
        const valueStr = prompt(`Enter the total Realized USD Value of rewards from ${protocol.name}:`);
        if (!valueStr) return;
        
        try {
            await api.post(`/admin/farming-protocols/${protocol.protocol_id}/reap`, { realizedUsdValue: valueStr });
            alert('Rewards successfully reaped and PNL distributed!');
            fetchPipeline();
        } catch (err) {
            alert('Failed to reap rewards: ' + (err.response?.data?.error || 'Unknown error'));
        }
    };
    
    const seeding = protocols.filter(p => p.status === 'SEEDING');
    const farming = protocols.filter(p => p.status === 'FARMING');
    const reaped = protocols.filter(p => p.status === 'REAPED' || p.has_rewards);

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Farming Pipeline Management</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                <div className="admin-card" style={{ marginBottom: '24px' }}>
                    <label htmlFor="vaultSelect">Select Farming Vault</label>
                    <select id="vaultSelect" value={selectedVaultId} onChange={e => setSelectedVaultId(e.target.value)} className="admin-vault-select">
                        {vaults.map(v => <option key={v.vault_id} value={v.vault_id}>{v.name}</option>)}
                    </select>
                </div>

                <div className="farming-pipeline-grid">
                    {/* Column 1: Seeding */}
                    <div className="pipeline-column">
                        <h3>Seeding ({seeding.length})</h3>
                        <div className="protocol-list">
                            {seeding.map(p => <ProtocolCard key={p.protocol_id} protocol={p} onMove={handleMoveProtocol} />)}
                        </div>
                        <div className="add-protocol-form">
                            <h4>Add to Seeding</h4>
                            <form onSubmit={handleAddNewProtocol} className="admin-form">
                                <input value={newProtocol.name} onChange={e => setNewProtocol({...newProtocol, name: e.target.value})} placeholder="Protocol Name" required/>
                                <input value={newProtocol.chain} onChange={e => setNewProtocol({...newProtocol, chain: e.target.value})} placeholder="Chain (e.g., ARBITRUM)" required/>
                                <textarea value={newProtocol.description} onChange={e => setNewProtocol({...newProtocol, description: e.target.value})} placeholder="Description"></textarea>
                                <button type="submit" className="btn-primary btn-sm" disabled={isSubmitting}>{isSubmitting ? '...' : 'Add Protocol'}</button>
                            </form>
                        </div>
                    </div>

                    {/* Column 2: Farming */}
                    <div className="pipeline-column">
                        <h3>Farming ({farming.length})</h3>
                        <div className="protocol-list">
                            {farming.map(p => <ProtocolCard key={p.protocol_id} protocol={p} onReap={handleReapRewards} />)}
                        </div>
                    </div>

                    {/* Column 3: Reaped */}
                    <div className="pipeline-column">
                        <h3>Reaped ({reaped.length})</h3>
                        <div className="protocol-list">
                            {reaped.map(p => <ProtocolCard key={p.protocol_id} protocol={p} />)}
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default FarmingPipelinePage;
