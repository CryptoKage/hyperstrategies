// src/pages/admin/MonthlyAuditPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatItem = ({ label, value, unit = '' }) => {
    const isMismatch = label.toLowerCase().includes('mismatch');
    let valueClassName = 'stat-value';
    if (isMismatch) {
        valueClassName += parseFloat(value) !== 0 ? ' text-negative' : ' text-positive';
    }
    return (
        <div className="stat-item">
            <span className="stat-label">{label}</span>
            <span className={valueClassName}>{value}{unit}</span>
        </div>
    );
};

const MonthlyAuditPage = () => {
    const [vaults, setVaults] = useState([]);
    const [selectedVaultId, setSelectedVaultId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [auditData, setAuditData] = useState(null);

    useEffect(() => {
        api.get('/admin/vaults/all')
          .then(res => {
            const activeVaults = res.data.filter(v => v.status === 'active');
            setVaults(activeVaults);
            if (activeVaults.length > 0) {
              setSelectedVaultId(activeVaults[0].vault_id);
            }
          })
          .catch(err => setError('Could not fetch list of vaults.'));
    }, []);

    const handleGenerateAudit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setAuditData(null);
        try {
            const monthDate = new Date(selectedMonth + '-01');
            const formattedMonth = monthDate.toISOString().split('T')[0];
            const response = await api.get(`/admin/monthly-audit-data?vaultId=${selectedVaultId}&month=${formattedMonth}`);
            setAuditData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate audit data.');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => (num || 0).toFixed(6);

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Monthly P&L Audit</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                <div className="admin-card">
                    <h3>Generate Audit Report</h3>
                    <p>Select a vault and month to compare the official P&L with the sum of ledger entries and generated report data. All three numbers should match.</p>
                    <form onSubmit={handleGenerateAudit} className="admin-form">
                        <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="vaultSelect">Select Vault</label>
                                <select id="vaultSelect" value={selectedVaultId} onChange={(e) => setSelectedVaultId(e.target.value)}>
                                    {vaults.map((v) => <option key={v.vault_id} value={v.vault_id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="monthSelect">Select Month</label>
                                <input type="month" id="monthSelect" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Generating...' : 'Run Audit'}
                        </button>
                    </form>
                </div>

                {loading && <LoadingSpinner />}
                {error && <p className="error-message admin-card">{error}</p>}

                {auditData && (
                    <div className="admin-card" style={{ marginTop: '24px' }}>
                        <h4>Audit Results for Vault {auditData.period.vaultId} - {auditData.period.month}</h4>
                        <div className="details-grid">
                            <StatItem label="Official System P&L" value={formatNumber(auditData.officialSystemPnlPercentage)} unit="%" />
                            <StatItem label="Total P&L in Ledger" value={formatNumber(auditData.totalPnlInLedger)} unit=" USDC" />
                            <StatItem label="Total P&L in Generated Reports" value={formatNumber(auditData.totalPnlInGeneratedReports)} unit=" USDC" />
                            <StatItem label="Ledger vs Reports Mismatch" value={formatNumber(auditData.totalPnlInLedger - auditData.totalPnlInGeneratedReports)} unit=" USDC" highlight={true} />
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MonthlyAuditPage;
