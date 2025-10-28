// src/pages/admin/FarmingPipelinePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// This is the new component for handling the distribution workflow.
const HybridRewardDistributionForm = () => {
  const [allVaults, setAllVaults] = useState([]);
  const [totalRewardUsd, setTotalRewardUsd] = useState('');
  const [participatingVaultIds, setParticipatingVaultIds] = useState([]);
  const [description, setDescription] = useState('');
  
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [previewData, setPreviewData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    api.get('/admin/vaults/all')
      .then(res => {
        const activeVaults = res.data.filter(v => v.status === 'active');
        setAllVaults(activeVaults);
      })
      .catch(err => {
        setStatus({ message: 'Failed to load vault list.', type: 'error' });
      });
  }, []);

  const handleCheckboxChange = (vaultId) => {
    setParticipatingVaultIds(prev =>
      prev.includes(vaultId) ? prev.filter(id => id !== vaultId) : [...prev, vaultId]
    );
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatus({ message: '', type: '' });
    setPreviewData(null);
    try {
      const payload = { totalRewardUsd: parseFloat(totalRewardUsd), participatingVaultIds };
      const response = await api.post('/admin/rewards/preview-hybrid-distribution', payload);
      setPreviewData(response.data);
      setCurrentStep(2);
    } catch (err) {
      setStatus({ message: err.response?.data?.error || 'An unexpected error occurred during preview.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecute = async () => {
    if (!window.confirm("Are you sure you want to execute this distribution? This action is irreversible.")) return;
    setIsProcessing(true);
    setStatus({ message: '', type: '' });
    try {
      const payload = { totalRewardUsd: parseFloat(totalRewardUsd), participatingVaultIds, description };
      const response = await api.post('/admin/rewards/execute-hybrid-distribution', payload);
      setStatus({ message: response.data.message, type: 'success' });
      setCurrentStep(3);
    } catch (err) {
      setStatus({ message: err.response?.data?.error || 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetForm = () => {
    setTotalRewardUsd('');
    setParticipatingVaultIds([]);
    setDescription('');
    setPreviewData(null);
    setStatus({ message: '', type: '' });
    setCurrentStep(1);
  };

  return (
    <div className="admin-card" style={{ marginTop: '24px' }}>
      <h3>Distribute Farming Profits</h3>
      <p>Distribute funds from the Buyback Pool to users in selected vaults. The system prioritizes buying back Bonus Points first, then distributes any remainder based on user XP.</p>
      
      {currentStep === 1 && (
        <form onSubmit={handlePreview} className="admin-form">
          <div className="form-group"><label htmlFor="total-reward">Total Reward to Distribute (USDC)</label><input id="total-reward" type="number" step="0.01" value={totalRewardUsd} onChange={(e) => setTotalRewardUsd(e.target.value)} required /></div>
          <div className="form-group"><label>Distribute to Users In:</label><div className="checkbox-group">{allVaults.length > 0 ? allVaults.map(vault => (<label key={vault.vault_id} className="checkbox-label"><input type="checkbox" checked={participatingVaultIds.includes(vault.vault_id)} onChange={() => handleCheckboxChange(vault.vault_id)} />{vault.name}</label>)) : <p>Loading vaults...</p>}</div></div>
          <div className="form-group"><label htmlFor="reward-description">Description for User Activity Log</label><input id="reward-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Opensea Wave 1 Payout" required /></div>
          <button type="submit" className="btn-primary" disabled={isProcessing || participatingVaultIds.length === 0 || !description}>{isProcessing ? 'Calculating...' : 'Preview Distribution'}</button>
        </form>
      )}
      {currentStep === 2 && previewData && (
        <div>
          <h4 style={{marginTop: '2rem'}}>Distribution Preview</h4>
          <div className="stats-grid-small"><div className="stat-card"><span className="stat-label">Total Pool</span><span className="stat-value">${previewData.summary.totalRewardPool.toFixed(2)}</span></div><div className="stat-card"><span className="stat-label">For Bonus Point Buyback</span><span className="stat-value">${previewData.summary.allocatedToBuyback.toFixed(2)}</span></div><div className="stat-card"><span className="stat-label">For XP-based Payout</span><span className="stat-value">${previewData.summary.allocatedToXp.toFixed(2)}</span></div></div>
          <div className="table-responsive" style={{marginTop: '1rem'}}><table className="activity-table"><thead><tr><th>User</th><th className="amount">Bonus Point Payout</th><th className="amount">XP-Based Payout</th><th className="amount">Total Payout</th></tr></thead><tbody>{previewData.preview.map(item => (<tr key={item.userId}><td>{item.username}</td><td className="amount">${item.bonusPointPayout.toFixed(2)}</td><td className="amount">${item.xpBasedPayout.toFixed(2)}</td><td className="amount"><strong>${item.totalPayout.toFixed(2)}</strong></td></tr>))}</tbody></table></div>
          <div className="modal-actions" style={{marginTop: '1.5rem'}}><button onClick={resetForm} className="btn-secondary" disabled={isProcessing}>Back</button><button onClick={handleExecute} className="btn-primary" disabled={isProcessing}>{isProcessing ? 'Executing...' : `Execute Distribution for ${previewData.summary.participantCount} Users`}</button></div>
        </div>
      )}
      {currentStep === 3 && (<div className="admin-message success" style={{marginTop: '1.5rem'}}><h4>Distribution Complete!</h4><p>{status.message}</p><button onClick={resetForm} className="btn-secondary btn-sm" style={{marginTop: '1rem'}}>Start New Distribution</button></div>)}
      {status.message && status.type === 'error' && <p className={`admin-message ${status.type}`}>{status.message}</p>}
    </div>
  );
};

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

    const [newProtocol, setNewProtocol] = useState({ name: '', chain: 'ETHEREUM', description: '', has_token: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

   const fetchFarmingVaults = useCallback(async () => {
    try {
        const response = await api.get('/admin/vaults/all');
        const farmingVaults = response.data.filter(v => v.vault_type === 'FARMING');
        setVaults(farmingVaults);
        if (farmingVaults.length > 0) {
            setSelectedVaultId(farmingVaults[0].vault_id);
        }
    } catch (err) {
        setError('Could not fetch list of farming vaults.');
        console.error(err);
    }
}, []);

    const fetchPipeline = useCallback(async () => {
        if (!selectedVaultId) {
            setProtocols([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
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
            fetchPipeline();
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
            // Corrected alert message for clarity
            alert('Rewards successfully reaped and funds added to the Buyback Pool!');
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

                    <div className="pipeline-column">
                        <h3>Farming ({farming.length})</h3>
                        <div className="protocol-list">
                            {farming.map(p => <ProtocolCard key={p.protocol_id} protocol={p} onReap={handleReapRewards} />)}
                        </div>
                    </div>

                    <div className="pipeline-column">
                        <h3>Reaped ({reaped.length})</h3>
                        <div className="protocol-list">
                            {loading ? <LoadingSpinner /> : reaped.map(p => <ProtocolCard key={p.protocol_id} protocol={p} />)}
                        </div>
                    </div>
                </div>

                <HybridRewardDistributionForm />
            </div>
        </Layout>
    );
};

export default FarmingPipelinePage;
