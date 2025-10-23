// src/pages/admin/DeskResultsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const DeskResultsPage = () => {
    // --- State for Setup ---
    const [vaults, setVaults] = useState([]);
    const [selectedVaultId, setSelectedVaultId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [pnlPercentage, setPnlPercentage] = useState('');

    // --- State for Workflow Control ---
    const [currentStep, setCurrentStep] = useState(1); // 1: Input PNL, 2: Review Fees, 3: Generate Reports
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [step2Data, setStep2Data] = useState(null); // To store results from fee calculation

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

    // --- Step 1 Handler: Calculate Fees ---
    const handleCalculateFees = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const monthDate = new Date(selectedMonth + '-01');
            const formattedMonth = monthDate.toISOString().split('T')[0];
            
            const payload = { 
                vaultId: selectedVaultId, 
                month: formattedMonth, 
                pnlPercentage: pnlPercentage
            };
            
            const response = await api.post('/admin/calculate-and-post-fees', payload);
            setStep2Data(response.data); // Save the results
            setCurrentStep(2); // Move to the next step
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to calculate fees.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Step 3 Handler: Generate Reports ---
    const handleGenerateReports = async () => {
        setIsLoading(true);
        setError('');
        try {
            const monthDate = new Date(selectedMonth + '-01');
            const formattedMonth = monthDate.toISOString().split('T')[0];
            
            const payload = { 
                vaultId: selectedVaultId, 
                month: formattedMonth, 
                pnlPercentage: pnlPercentage,
                notes: `Monthly report generated after automated fee calculation.` // Optional note
            };

            const response = await api.post('/admin/reports/generate-monthly-drafts', payload);
            setStep2Data({ ...step2Data, finalMessage: response.data.message }); // Add final message to step 2 data
            setCurrentStep(3); // Move to the final confirmation step
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate reports.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetWorkflow = () => {
        setCurrentStep(1);
        setStep2Data(null);
        setError('');
        setPnlPercentage('');
    };

    return (
        <Layout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Monthly Close Workflow</h1>
                    <Link to="/admin" className="btn-secondary btn-sm">← Back to Mission Control</Link>
                </div>

                {/* --- Workflow Header --- */}
                <div className="admin-card">
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', opacity: currentStep > 1 ? 0.6 : 1 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="vaultSelect">Select Vault</label>
                            <select id="vaultSelect" value={selectedVaultId} onChange={(e) => setSelectedVaultId(e.target.value)} disabled={currentStep > 1}>
                                {vaults.map((v) => <option key={v.vault_id} value={v.vault_id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="monthSelect">Select Month</label>
                            <input type="month" id="monthSelect" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} required disabled={currentStep > 1} />
                        </div>
                    </div>
                    {currentStep > 1 && <button onClick={resetWorkflow} className="btn-link" style={{marginTop: '1rem'}}>Start Over</button>}
                </div>
                
                {error && <p className="error-message admin-card">{error}</p>}

                {/* --- Step 1: Input Gross PNL --- */}
                {currentStep === 1 && (
                    <div className="admin-actions-card">
                        <h3>Step 1: Record Gross Performance</h3>
                        <p>Enter the vault's gross (before-fees) P&L percentage for the selected month. This will be used to calculate fees against each user's high-water mark.</p>
                        <form onSubmit={handleCalculateFees} className="admin-form">
                            <div className="form-group">
                                <label htmlFor="perf-pnl">Gross Performance Percentage (e.g., 8.5 or -2.1)</label>
                                <input id="perf-pnl" type="number" step="any" value={pnlPercentage} onChange={(e) => setPnlPercentage(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn-primary" disabled={isLoading || !selectedMonth || !pnlPercentage}>
                                {isLoading ? 'Calculating...' : 'Calculate & Post Fees'}
                            </button>
                        </form>
                    </div>
                )}
                
                {/* --- Step 2: Review Fees --- */}
                {currentStep >= 2 && step2Data && (
                    <div className="admin-actions-card">
                        <h3>Step 2: Review Posted Performance Fees</h3>
                        <p>{step2Data.message}</p>
                        <div className="table-responsive">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Starting Capital</th>
                                        <th>High-Water Mark</th>
                                        <th>Gross PNL</th>
                                        <th>New Account Value</th>
                                        <th className="amount">Fee Calculated & Posted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {step2Data.calculationResults.map(r => (
                                        <tr key={r.userId}>
                                            <td>{r.username}</td>
                                            <td>${r.startingCapital.toFixed(2)}</td>
                                            <td>${r.highWaterMark.toFixed(2)}</td>
                                            <td className={r.grossPnl >= 0 ? 'text-positive' : 'text-negative'}>${r.grossPnl.toFixed(2)}</td>
                                            <td>${r.newAccountValue.toFixed(2)}</td>
                                            <td className="amount text-negative">${r.feeAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {currentStep === 2 && (
                             <button onClick={handleGenerateReports} className="btn-primary" disabled={isLoading} style={{marginTop: '1.5rem'}}>
                                {isLoading ? 'Generating...' : 'Confirm & Generate Final Reports'}
                            </button>
                        )}
                    </div>
                )}

                {/* --- Step 3: Confirmation --- */}
                {currentStep === 3 && step2Data?.finalMessage && (
                     <div className="admin-card admin-message success">
                        <h3>Step 3: Complete!</h3>
                        <p>{step2Data.finalMessage}</p>
                        <Link to="/admin/reports/review" className="btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                            Go to Review & Publish →
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DeskResultsPage;
