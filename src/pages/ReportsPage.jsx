// src/pages/ReportsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import api from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ReportsPage = () => {
    const { t } = useTranslation();
    const [availableReports, setAvailableReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState('');
    const [reportData, setReportData] = useState(null);
    
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [error, setError] = useState('');

    // 1. Fetch the list of available reports when the page loads
    useEffect(() => {
        const fetchAvailableReports = async () => {
            setIsLoadingList(true);
            try {
                const response = await api.get('/user/reports/available');
                setAvailableReports(response.data);
                // If reports exist, pre-select the most recent one
                if (response.data.length > 0) {
                    setSelectedReportId(response.data[0].report_id);
                }
            } catch (err) {
                console.error("Failed to fetch available reports:", err);
                setError("Could not load your available reports.");
            } finally {
                setIsLoadingList(false);
            }
        };
        fetchAvailableReports();
    }, []);

    // 2. Fetch the full report data whenever the selectedReportId changes
    useEffect(() => {
        if (!selectedReportId) {
            setReportData(null);
            return;
        }

        const fetchReportData = async () => {
            setIsLoadingReport(true);
            setError('');
            try {
                const response = await api.get(`/user/reports/${selectedReportId}`);
                setReportData(response.data);
            } catch (err) {
                console.error(`Failed to fetch report ${selectedReportId}:`, err);
                setError("Could not load the selected report.");
            } finally {
                setIsLoadingReport(false);
            }
        };
        fetchReportData();
    }, [selectedReportId]);


    return (
        <Layout>
            <div className="admin-container"> {/* Reusing admin styles for now */}
                <div className="admin-header">
                    <h1>My Reports</h1>
                    <Link to="/profile" className="btn-secondary btn-sm">← Back to Profile</Link>
                </div>

                {isLoadingList ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : availableReports.length === 0 ? (
                    <div className="profile-card text-center">
                        <h2>No Reports Available</h2>
                        <p>Your monthly performance reports will appear here once they have been generated and approved. Please check back later.</p>
                    </div>
                ) : (
                    <div className="admin-actions-card">
                        <div className="form-group">
                            <label htmlFor="reportSelect">Select a Report to View</label>
                            <select id="reportSelect" value={selectedReportId} onChange={(e) => setSelectedReportId(e.target.value)} disabled={isLoadingReport}>
                                {availableReports.map(report => (
                                    <option key={report.report_id} value={report.report_id}>
                                        {report.title} ({new Date(report.report_date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {isLoadingReport ? (
                    <LoadingSpinner />
                ) : reportData ? (
                    <div className="admin-card" style={{ marginTop: '24px' }}>
                        <h2>{reportData.title}</h2>
                        {/* We will replace this with a beautiful component later */}
                        <pre style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', color: '#fff', overflowX: 'auto' }}>
                            {JSON.stringify(reportData.report_data, null, 2)}
                        </pre>
                        {/* Placeholder for PDF button */}
                        <div style={{ marginTop: '24px' }}>
                           <button className="btn-primary" disabled>Download as PDF (Coming Soon)</button>
                        </div>
                    </div>
                ) : null}

            </div>
        </Layout>
    );
};

export default ReportsPage;
