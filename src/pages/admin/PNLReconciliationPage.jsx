// src/pages/admin/PNLReconciliationPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const PNLReconciliationPage = () => {
    // --- State for Setup & Data ---
    const [vaults, setVaults] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [selectedVaultId, setSelectedVaultId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [pnlEvents, setPnlEvents] = useState([]);

    // --- State for UI & Forms ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formState, setFormState] = useState({ userId: '', amount: '', eventDate: '' });
    const [editingEventId, setEditingEventId] = useState(null); // The ID of the event being edited
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch lists of vaults and users on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [vaultsRes, usersRes] = await Promise.all([
                    api.get('/admin/vaults/all'),
                    api.get('/admin/vault-users') // Gets all users who have ever been in a vault
                ]);
                const activeVaults = vaultsRes.data.filter(v => v.status === 'active');
                setVaults(activeVaults);
                setParticipants(usersRes.data);
                if (activeVaults.length > 0) {
                    setSelectedVaultId(activeVaults[0].vault_id);
                }
            } catch (err) {
                setError('Could not fetch initial page data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch PNL events when vault or month changes
    const fetchPnlEvents = useCallback(async () => {
        if (!selectedVaultId || !selectedMonth) {
            setPnlEvents([]);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const monthDate = new Date(selectedMonth + '-01');
            const formattedMonth = monthDate.toISOString().split('T')[0];
            const response = await api.get(`/admin/pnl-events?vaultId=${selectedVaultId}&month=${formattedMonth}`);
            setPnlEvents(response.data);
        } catch (err) {
            setError('Failed to fetch PNL events for this period.');
        } finally {
            setLoading(false);
        }
    }, [selectedVaultId, selectedMonth]);

    useEffect(() => {
        fetchPnlEvents();
    }, [fetchPnlEvents]);

    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingEventId) {
                // Update existing event
                await api.put(`/admin/pnl-events/${editingEventId}`, {
                    amount: formState.amount,
                    eventDate: formState.eventDate,
                });
            } else {
                // Add new event
                await api.post('/admin/pnl-events', {
                    vaultId: selectedVaultId,
                    userId: formState.userId,
                    amount: formState.amount,
                    eventDate: formState.eventDate,
                });
            }
            resetForm();
            fetchPnlEvents(); // Refresh the list
        } catch (err) {
            alert(`Operation failed: ${err.response?.data?.error || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleEdit = (pnlEvent) => {
        setEditingEventId(pnlEvent.entry_id);
        setFormState({
            userId: pnlEvent.user_id,
            amount: pnlEvent.amount,
            eventDate: new Date(pnlEvent.created_at).toISOString().substring(0, 16), // Format for datetime-local
        });
    };

    const handleDelete = async (entryId) => {
        if (!window.confirm('Are you sure you want to delete this PNL event?')) return;
        try {
            await api.delete(`/admin/pnl-events/${entryId}`);
            fetchPnlEvents(); // Refresh the list
        } catch (err) {
            alert(`Delete failed: ${err.response?.data?.error || 'Unknown error'}`);
        }
    };
    
    const resetForm = () => {
        setEditingEventId(null);
        setFormState({ userId: '', amount: '', eventDate: '' });
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>PNL Reconciliation</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                <div className="admin-card">
                    <p>Manage the individual `PNL_DISTRIBUTION` events for a vault. This is the source of truth for the event-driven report generator.</p>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="vaultSelect">Select Vault</label>
                            <select id="vaultSelect" value={selectedVaultId} onChange={(e) => setSelectedVaultId(e.target.value)}>
                                {vaults.map((v) => <option key={v.vault_id} value={v.vault_id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="monthSelect">Select Month</label>
                            <input type="month" id="monthSelect" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} required />
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <h3>{editingEventId ? 'Edit' : 'Add New'} PNL Event</h3>
                    <form onSubmit={handleFormSubmit} className="admin-form-inline">
                        <select name="userId" value={formState.userId} onChange={handleFormChange} required disabled={editingEventId}>
                            <option value="" disabled>-- Select User --</option>
                            {participants.map(p => <option key={p.user_id} value={p.user_id}>{p.username}</option>)}
                        </select>
                        <input name="amount" type="number" step="any" placeholder="Amount (e.g., 105.50 or -20.10)" value={formState.amount} onChange={handleFormChange} required />
                        <input name="eventDate" type="datetime-local" value={formState.eventDate} onChange={handleFormChange} required />
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (editingEventId ? 'Update Event' : 'Add Event')}</button>
                        {editingEventId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel Edit</button>}
                    </form>
                </div>

                <div className="admin-card">
                    <h3>Recorded PNL Events for Selected Period</h3>
                    {loading ? <LoadingSpinner /> : error ? <p className="error-message">{error}</p> : (
                        <div className="table-responsive">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User</th>
                                        <th className="amount">Amount (USDC)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pnlEvents.length > 0 ? pnlEvents.map(event => (
                                        <tr key={event.entry_id}>
                                            <td>{new Date(event.created_at).toLocaleString()}</td>
                                            <td>{event.username}</td>
                                            <td className={`amount ${event.amount >= 0 ? 'text-positive' : 'text-negative'}`}>{event.amount.toFixed(2)}</td>
                                            <td className="actions-cell">
                                                <button onClick={() => handleEdit(event)} className="btn-secondary btn-sm">Edit</button>
                                                <button onClick={() => handleDelete(event.entry_id)} className="btn-danger-outline btn-sm">Delete</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" style={{textAlign: 'center'}}>No PNL events recorded for this period.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PNLReconciliationPage;
