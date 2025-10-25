import React, { useState, useEffect } from 'react'; // This line has been corrected
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DeskResultsPage = () => {
    // --- State for Setup ---
    const [vaults, setVaults] = useState([]);
    const [selectedVaultId, setSelectedVaultId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    // --- State for Action ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch list of all vaults on component mount
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

    // --- Handler to Generate Reports ---
    const handleGenerateReports = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Are you sure you want to generate all user reports for this vault and month? This will use the PNL data from the Reconciliation tool and overwrite any existing drafts.`)) {
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const monthDate = new Date(selectedMonth + '-01');
            const formattedMonth = monthDate.toISOString().split('T')[0];
            
            const payload = { 
                vaultId: selectedVaultId, 
                month: formattedMonth, 
            };
            
            const response = await api.post('/admin/reports/generate-monthly-drafts', payload);
            setSuccessMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate reports.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Generate Monthly Reports</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                <div className="admin-actions-card">
                    <h3>Generate User Reports</h3>
                    <p>
                        This tool generates draft reports for all eligible users in a vault for the selected month.
                        It uses the PNL data recorded in the <Link to="/admin/pnl-reconciliation">PNL Reconciliation</Link> tool as the source of truth.
                    </p>
                    <form onSubmit={handleGenerateReports} className="admin-form">
                        <div className="form-group" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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

                        <button type="submit" className="btn-primary" disabled={isLoading || !selectedMonth || !selectedVaultId}>
                            {isLoading ? 'Generating...' : 'Generate All Draft Reports'}
                        </button>
                    </form>
                    
                    {error && <p className="admin-message error" style={{marginTop: '1rem'}}>{error}</p>}
                    
                    {successMessage && (
                         <div className="admin-message success" style={{marginTop: '1rem'}}>
                            <p>{successMessage}</p>
                            <Link to="/admin/reports/review" className="btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                                Go to Review & Publish →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DeskResultsPage;
